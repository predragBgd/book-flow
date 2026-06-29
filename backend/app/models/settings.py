from app.extensions import db


class BusinessHours(db.Model):
    __tablename__ = "business_hours"

    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.Integer, nullable=False, unique=True)  # 0=Mon … 6=Sun
    is_open = db.Column(db.Boolean, default=True, nullable=False)
    open_time = db.Column(db.Time, nullable=True)
    close_time = db.Column(db.Time, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "day_of_week": self.day_of_week,
            "is_open": self.is_open,
            "open_time": self.open_time.strftime("%H:%M") if self.open_time else None,
            "close_time": self.close_time.strftime("%H:%M")
            if self.close_time
            else None,
        }


class BlockedDate(db.Model):
    __tablename__ = "blocked_dates"

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    reason = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date.isoformat(),
            "reason": self.reason,
        }


class AppSettings(db.Model):
    __tablename__ = "app_settings"

    id = db.Column(db.Integer, primary_key=True)
    slot_buffer_minutes = db.Column(db.Integer, default=10, nullable=False)

    @classmethod
    def get(cls):
        settings = cls.query.first()
        if not settings:
            settings = cls(slot_buffer_minutes=10)
            db.session.add(settings)
            db.session.commit()
        return settings

    def to_dict(self):
        return {
            "slot_buffer_minutes": self.slot_buffer_minutes,
        }
