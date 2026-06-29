from datetime import datetime

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Booking, Review, Service
from app.utils.slots import get_available_slots

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")


@bookings_bp.post("")
def create_booking():
    data = request.get_json(silent=True) or {}

    service_id = data.get("service_id")
    date = data.get("date")
    time_str = data.get("time")
    client_name = (data.get("client_name") or "").strip()
    client_email = (data.get("client_email") or "").strip().lower()
    client_phone = (data.get("client_phone") or "").strip() or None

    if not all([service_id, date, time_str, client_name, client_email]):
        return jsonify({"error": "Missing required fields"}), 400

    service = Service.query.get(service_id)
    if not service or not service.is_active:
        return jsonify({"error": "Service not found"}), 404

    available = get_available_slots(service_id, date)
    if time_str not in available:
        return jsonify({"error": "Selected slot is not available"}), 400

    scheduled_at = datetime.strptime(f"{date} {time_str}", "%Y-%m-%d %H:%M")

    booking = Booking(
        service_id=service_id,
        client_name=client_name,
        client_email=client_email,
        client_phone=client_phone,
        scheduled_at=scheduled_at,
        status="pending",
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify(booking.to_dict()), 201


@bookings_bp.get("/<token>")
def get_booking(token):
    booking = Booking.query.filter_by(access_token=token).first()
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking.to_dict(include_review=True))


@bookings_bp.post("/<token>/review")
def submit_review(token):
    booking = Booking.query.filter_by(access_token=token).first()
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.status != "completed":
        return jsonify({"error": "Booking must be completed before review"}), 400

    if booking.review:
        return jsonify({"error": "Review already submitted"}), 400

    data = request.get_json(silent=True) or {}
    rating = data.get("rating")
    comment = (data.get("comment") or "").strip() or None

    if rating is None or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400

    review = Review(booking_id=booking.id, rating=rating, comment=comment)
    booking.status = "reviewed"
    db.session.add(review)
    db.session.commit()

    result = booking.to_dict(include_review=True)
    return jsonify(result), 201
