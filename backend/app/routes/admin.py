import csv
import io
from datetime import datetime, time, timedelta

from flask import Blueprint, jsonify, request, Response
from flask_jwt_extended import get_jwt_identity
from sqlalchemy import func

from app.extensions import db
from app.models import (
    AppSettings,
    BlockedDate,
    Booking,
    BusinessHours,
    Review,
    Service,
    User,
)
from app.utils.decorators import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _parse_time(value):
    if not value:
        return None
    hour, minute = map(int, value.split(":"))
    return time(hour, minute)


# --- Services ---


@admin_bp.get("/services")
@admin_required
def list_services():
    services = Service.query.order_by(Service.name).all()
    return jsonify([service.to_dict() for service in services])


@admin_bp.post("/services")
@admin_required
def create_service():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    duration_minutes = data.get("duration_minutes", 30)
    price = data.get("price")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    service = Service(
        name=name,
        duration_minutes=int(duration_minutes),
        price=price,
        is_active=data.get("is_active", True),
    )
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201


@admin_bp.put("/services/<int:service_id>")
@admin_required
def update_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data:
        service.name = data["name"].strip()
    if "duration_minutes" in data:
        service.duration_minutes = int(data["duration_minutes"])
    if "price" in data:
        service.price = data["price"]
    if "is_active" in data:
        service.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify(service.to_dict())


@admin_bp.delete("/services/<int:service_id>")
@admin_required
def delete_service(service_id):
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    service.is_active = False
    db.session.commit()
    return jsonify({"message": "Service deactivated"})


# --- Staff ---


@admin_bp.get("/staff")
@admin_required
def list_staff():
    staff = User.query.filter_by(role="staff").order_by(User.name).all()
    return jsonify([member.to_dict() for member in staff])


@admin_bp.post("/staff")
@admin_required
def create_staff():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or "demo123"

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already in use"}), 400

    user = User(name=name, email=email, role="staff", is_active=True)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@admin_bp.put("/staff/<int:staff_id>")
@admin_required
def update_staff(staff_id):
    user = User.query.filter_by(id=staff_id, role="staff").first()
    if not user:
        return jsonify({"error": "Staff member not found"}), 404

    data = request.get_json(silent=True) or {}
    if "name" in data:
        user.name = data["name"].strip()
    if "email" in data:
        email = data["email"].strip().lower()
        existing = User.query.filter(User.email == email, User.id != user.id).first()
        if existing:
            return jsonify({"error": "Email already in use"}), 400
        user.email = email
    if "password" in data and data["password"]:
        user.set_password(data["password"])
    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify(user.to_dict())


@admin_bp.delete("/staff/<int:staff_id>")
@admin_required
def deactivate_staff(staff_id):
    user = User.query.filter_by(id=staff_id, role="staff").first()
    if not user:
        return jsonify({"error": "Staff member not found"}), 404

    user.is_active = False
    db.session.commit()
    return jsonify({"message": "Staff member deactivated"})


# --- Bookings ---


@admin_bp.get("/bookings")
@admin_required
def list_bookings():
    status = request.args.get("status")
    query = Booking.query.order_by(Booking.scheduled_at.desc())
    if status:
        query = query.filter_by(status=status)
    bookings = query.all()
    return jsonify([booking.to_dict(include_review=True) for booking in bookings])


@admin_bp.patch("/bookings/<int:booking_id>/confirm")
@admin_required
def confirm_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "pending":
        return jsonify({"error": "Only pending bookings can be confirmed"}), 400

    data = request.get_json(silent=True) or {}
    staff_id = data.get("staff_id")
    admin_notes = data.get("admin_notes")

    if not staff_id:
        return jsonify({"error": "staff_id is required"}), 400

    staff = User.query.filter_by(id=staff_id, role="staff", is_active=True).first()
    if not staff:
        return jsonify({"error": "Staff member not found"}), 404

    booking.staff_id = staff_id
    booking.status = "confirmed"
    if admin_notes is not None:
        booking.admin_notes = admin_notes

    db.session.commit()
    return jsonify(booking.to_dict())


@admin_bp.patch("/bookings/<int:booking_id>/cancel")
@admin_required
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status in ("completed", "reviewed", "cancelled"):
        return jsonify({"error": "Booking cannot be cancelled"}), 400

    booking.status = "cancelled"
    db.session.commit()
    return jsonify(booking.to_dict())


# --- CRM ---


@admin_bp.get("/clients")
@admin_required
def list_clients():
    rows = (
        db.session.query(
            Booking.client_email,
            Booking.client_name,
            func.count(Booking.id).label("booking_count"),
            func.max(Booking.scheduled_at).label("last_visit"),
            func.avg(Review.rating).label("avg_rating"),
        )
        .outerjoin(Review, Review.booking_id == Booking.id)
        .filter(Booking.status != "cancelled")
        .group_by(Booking.client_email, Booking.client_name)
        .order_by(func.max(Booking.scheduled_at).desc())
        .all()
    )

    clients = []
    for row in rows:
        clients.append(
            {
                "client_email": row.client_email,
                "client_name": row.client_name,
                "booking_count": row.booking_count,
                "last_visit": row.last_visit.isoformat() if row.last_visit else None,
                "avg_rating": round(float(row.avg_rating), 1)
                if row.avg_rating
                else None,
            }
        )
    return jsonify(clients)


# --- Stats ---


@admin_bp.get("/stats")
@admin_required
def stats():
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())

    pending_count = Booking.query.filter_by(status="pending").count()
    today_count = Booking.query.filter(
        func.date(Booking.scheduled_at) == today,
        Booking.status.in_(["confirmed", "completed", "reviewed"]),
    ).count()

    avg_rating = db.session.query(func.avg(Review.rating)).scalar()
    avg_rating = round(float(avg_rating), 1) if avg_rating else None

    weekly = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        count = Booking.query.filter(
            func.date(Booking.scheduled_at) == day,
            Booking.status.in_(["confirmed", "completed", "reviewed"]),
        ).count()
        weekly.append({"date": day.isoformat(), "count": count})

    return jsonify(
        {
            "pending_count": pending_count,
            "today_count": today_count,
            "avg_rating": avg_rating,
            "weekly_bookings": weekly,
        }
    )


# --- Reviews ---


@admin_bp.get("/reviews")
@admin_required
def list_reviews():
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify([review.to_dict() for review in reviews])


# --- Export ---


@admin_bp.get("/export.csv")
@admin_required
def export_csv():
    bookings = Booking.query.order_by(Booking.scheduled_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "id",
            "client_name",
            "client_email",
            "service",
            "staff",
            "scheduled_at",
            "status",
            "rating",
        ]
    )

    for booking in bookings:
        writer.writerow(
            [
                booking.id,
                booking.client_name,
                booking.client_email,
                booking.service.name if booking.service else "",
                booking.staff.name if booking.staff else "",
                booking.scheduled_at.isoformat(),
                booking.status,
                booking.review.rating if booking.review else "",
            ]
        )

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=bookings.csv"},
    )


# --- Settings ---


@admin_bp.get("/settings/hours")
@admin_required
def get_hours():
    hours = BusinessHours.query.order_by(BusinessHours.day_of_week).all()
    return jsonify([entry.to_dict() for entry in hours])


@admin_bp.put("/settings/hours")
@admin_required
def update_hours():
    data = request.get_json(silent=True) or {}
    entries = data.get("hours", [])

    for entry in entries:
        day = entry.get("day_of_week")
        if day is None:
            continue

        record = BusinessHours.query.filter_by(day_of_week=day).first()
        if not record:
            record = BusinessHours(day_of_week=day)
            db.session.add(record)

        record.is_open = bool(entry.get("is_open", False))
        record.open_time = _parse_time(entry.get("open_time"))
        record.close_time = _parse_time(entry.get("close_time"))

    db.session.commit()
    hours = BusinessHours.query.order_by(BusinessHours.day_of_week).all()
    return jsonify([entry.to_dict() for entry in hours])


@admin_bp.get("/settings/blocked-dates")
@admin_required
def get_blocked_dates():
    dates = BlockedDate.query.order_by(BlockedDate.date).all()
    return jsonify([entry.to_dict() for entry in dates])


@admin_bp.post("/settings/blocked-dates")
@admin_required
def add_blocked_date():
    data = request.get_json(silent=True) or {}
    date_str = data.get("date")
    reason = (data.get("reason") or "").strip() or None

    if not date_str:
        return jsonify({"error": "date is required"}), 400

    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    if BlockedDate.query.filter_by(date=date).first():
        return jsonify({"error": "Date already blocked"}), 400

    blocked = BlockedDate(date=date, reason=reason)
    db.session.add(blocked)
    db.session.commit()
    return jsonify(blocked.to_dict()), 201


@admin_bp.delete("/settings/blocked-dates/<int:blocked_id>")
@admin_required
def delete_blocked_date(blocked_id):
    blocked = BlockedDate.query.get(blocked_id)
    if not blocked:
        return jsonify({"error": "Blocked date not found"}), 404

    db.session.delete(blocked)
    db.session.commit()
    return jsonify({"message": "Blocked date removed"})


@admin_bp.get("/settings/app")
@admin_required
def get_app_settings():
    return jsonify(AppSettings.get().to_dict())


@admin_bp.put("/settings/app")
@admin_required
def update_app_settings():
    data = request.get_json(silent=True) or {}
    settings = AppSettings.get()

    if "slot_buffer_minutes" in data:
        settings.slot_buffer_minutes = max(0, int(data["slot_buffer_minutes"]))

    db.session.commit()
    return jsonify(settings.to_dict())
