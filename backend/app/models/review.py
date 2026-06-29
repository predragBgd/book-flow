from app.extensions import db
from app.models.user import utcnow


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(
        db.Integer, db.ForeignKey("bookings.id"), unique=True, nullable=False
    )
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)

    booking = db.relationship("Booking", back_populates="review")

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat(),
            "client_name": self.booking.client_name if self.booking else None,
            "service_name": self.booking.service.name
            if self.booking and self.booking.service
            else None,
            "staff_name": self.booking.staff.name
            if self.booking and self.booking.staff
            else None,
        }
