from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.models import Booking, User
from app.utils.decorators import staff_required

staff_bp = Blueprint("staff", __name__, url_prefix="/api/staff")


@staff_bp.get("/bookings")
@staff_required
def list_my_bookings():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    query = Booking.query.filter(
        Booking.staff_id == user_id,
        Booking.status.in_(["confirmed", "completed", "reviewed"]),
    ).order_by(Booking.scheduled_at.asc())

    bookings = query.all()
    return jsonify([booking.to_dict(include_review=True) for booking in bookings])


@staff_bp.patch("/bookings/<int:booking_id>/complete")
@staff_required
def complete_booking(booking_id):
    user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.staff_id != user_id:
        return jsonify({"error": "Not assigned to this booking"}), 403

    if booking.status != "confirmed":
        return jsonify({"error": "Only confirmed bookings can be completed"}), 400

    booking.status = "completed"
    db.session.commit()
    return jsonify(booking.to_dict())
