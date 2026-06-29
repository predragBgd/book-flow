import uuid
from datetime import datetime, timedelta

from app.extensions import db
from app.models.user import utcnow

BOOKING_STATUSES = (
    "pending",
    "confirmed",
    "completed",
    "reviewed",
    "cancelled",
)


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    access_token = db.Column(
        db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    )
    client_name = db.Column(db.String(120), nullable=False)
    client_email = db.Column(db.String(255), nullable=False, index=True)
    client_phone = db.Column(db.String(40), nullable=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    scheduled_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    admin_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=utcnow, onupdate=utcnow, nullable=False
    )

    service = db.relationship("Service", back_populates="bookings")
    staff = db.relationship("User", back_populates="bookings")
    review = db.relationship("Review", back_populates="booking", uselist=False)

    def end_at(self):
        duration = self.service.duration_minutes if self.service else 30
        return self.scheduled_at + timedelta(minutes=duration)

    def to_dict(self, include_review=False):
        data = {
            "id": self.id,
            "access_token": self.access_token,
            "client_name": self.client_name,
            "client_email": self.client_email,
            "client_phone": self.client_phone,
            "service_id": self.service_id,
            "service": self.service.to_dict() if self.service else None,
            "staff_id": self.staff_id,
            "staff": self.staff.to_dict() if self.staff else None,
            "scheduled_at": self.scheduled_at.isoformat(),
            "status": self.status,
            "admin_notes": self.admin_notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if include_review and self.review:
            data["review"] = self.review.to_dict()
        return data
