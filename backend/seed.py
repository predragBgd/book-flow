"""Seed demo data for BookFlow."""

import sys
from datetime import datetime, time, timedelta

from app import create_app
from app.extensions import db
from app.models import (
    AppSettings,
    Booking,
    BusinessHours,
    Review,
    Service,
    User,
)


DEFAULT_HOURS = [
    (0, True, "09:00", "17:00"),   # Mon
    (1, True, "09:00", "17:00"),   # Tue
    (2, True, "09:00", "17:00"),   # Wed
    (3, True, "09:00", "17:00"),   # Thu
    (4, True, "09:00", "17:00"),   # Fri
    (5, True, "10:00", "14:00"),   # Sat
    (6, False, None, None),        # Sun
]


def parse_time(value):
    hour, minute = map(int, value.split(":"))
    return time(hour, minute)


def seed_database(reset=False):
    """Create tables and insert demo data. Skips if data exists unless reset=True."""
    if reset:
        db.drop_all()

    db.create_all()

    if User.query.first() and not reset:
        print("Database already initialized — skipping seed.")
        return False

    admin = User(
        name="Demo Admin",
        email="admin@demo.com",
        role="admin",
        is_active=True,
    )
    admin.set_password("demo123")

    staff1 = User(
        name="Ana Markovic",
        email="staff@demo.com",
        role="staff",
        is_active=True,
    )
    staff1.set_password("demo123")

    staff2 = User(
        name="Marko Petrovic",
        email="marko@demo.com",
        role="staff",
        is_active=True,
    )
    staff2.set_password("demo123")

    db.session.add_all([admin, staff1, staff2])

    services = [
        Service(name="Haircut", duration_minutes=30, price=25.00),
        Service(name="Color Treatment", duration_minutes=90, price=80.00),
        Service(name="Consultation", duration_minutes=45, price=40.00),
    ]
    db.session.add_all(services)

    for day, is_open, open_str, close_str in DEFAULT_HOURS:
        db.session.add(
            BusinessHours(
                day_of_week=day,
                is_open=is_open,
                open_time=parse_time(open_str) if open_str else None,
                close_time=parse_time(close_str) if close_str else None,
            )
        )

    db.session.add(AppSettings(slot_buffer_minutes=10))
    db.session.flush()

    tomorrow = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
    tomorrow += timedelta(days=1)
    while tomorrow.weekday() >= 5:
        tomorrow += timedelta(days=1)

    pending = Booking(
        client_name="Jelena Nikolic",
        client_email="jelena@example.com",
        client_phone="+381601234567",
        service_id=services[0].id,
        scheduled_at=tomorrow,
        status="pending",
    )

    confirmed_time = tomorrow + timedelta(days=1)
    confirmed = Booking(
        client_name="Petar Jovanovic",
        client_email="petar@example.com",
        service_id=services[1].id,
        staff_id=staff1.id,
        scheduled_at=confirmed_time.replace(hour=11, minute=0),
        status="confirmed",
    )

    completed_time = datetime.now() - timedelta(days=2)
    completed_time = completed_time.replace(hour=14, minute=0, second=0, microsecond=0)
    completed = Booking(
        client_name="Mila Stojanovic",
        client_email="mila@example.com",
        service_id=services[2].id,
        staff_id=staff2.id,
        scheduled_at=completed_time,
        status="completed",
    )

    reviewed_time = datetime.now() - timedelta(days=5)
    reviewed_time = reviewed_time.replace(hour=15, minute=30, second=0, microsecond=0)
    reviewed = Booking(
        client_name="Nikola Ilic",
        client_email="nikola@example.com",
        service_id=services[0].id,
        staff_id=staff1.id,
        scheduled_at=reviewed_time,
        status="reviewed",
    )

    db.session.add_all([pending, confirmed, completed, reviewed])
    db.session.flush()

    db.session.add(
        Review(booking_id=reviewed.id, rating=5, comment="Excellent service!")
    )

    db.session.commit()

    print("Seed complete.")
    print("Admin: admin@demo.com / demo123")
    print("Staff: staff@demo.com / demo123")
    print(f"Sample booking token (completed): {completed.access_token}")
    print(f"Sample booking token (reviewed): {reviewed.access_token}")
    return True


def seed(reset=False):
    app = create_app()
    with app.app_context():
        seed_database(reset=reset)


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv
    seed(reset=reset_flag)
