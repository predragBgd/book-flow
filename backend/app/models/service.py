from app.extensions import db
from app.models.user import utcnow


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)

    bookings = db.relationship("Booking", back_populates="service", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "duration_minutes": self.duration_minutes,
            "price": float(self.price) if self.price is not None else None,
            "is_active": self.is_active,
        }
