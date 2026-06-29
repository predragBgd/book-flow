from datetime import datetime, timedelta, time

from app.extensions import db
from app.models import Booking, BusinessHours, BlockedDate, AppSettings, Service


def _parse_time(value):
    if isinstance(value, time):
        return value
    hour, minute = map(int, value.split(":"))
    return time(hour, minute)


def get_available_slots(service_id, date_str):
    service = Service.query.get(service_id)
    if not service or not service.is_active:
        return []

    date = datetime.strptime(date_str, "%Y-%m-%d").date()

    if BlockedDate.query.filter_by(date=date).first():
        return []

    day_of_week = date.weekday()
    hours = BusinessHours.query.filter_by(day_of_week=day_of_week).first()
    if not hours or not hours.is_open or not hours.open_time or not hours.close_time:
        return []

    settings = AppSettings.get()
    buffer = settings.slot_buffer_minutes
    duration = service.duration_minutes

    day_start = datetime.combine(date, hours.open_time)
    day_end = datetime.combine(date, hours.close_time)

    existing = Booking.query.filter(
        Booking.scheduled_at >= day_start,
        Booking.scheduled_at < day_end + timedelta(days=1),
        Booking.status.in_(["pending", "confirmed", "completed", "reviewed"]),
    ).all()

    slots = []
    current = day_start
    step = timedelta(minutes=15)

    while current + timedelta(minutes=duration) <= day_end:
        slot_end = current + timedelta(minutes=duration)
        blocked = False

        for booking in existing:
            booking_end = booking.scheduled_at + timedelta(
                minutes=booking.service.duration_minutes + buffer
            )
            slot_end_buffered = slot_end + timedelta(minutes=buffer)

            if current < booking_end and slot_end_buffered > booking.scheduled_at:
                blocked = True
                break

        if not blocked and current > datetime.now():
            slots.append(current.strftime("%H:%M"))

        current += step

    return slots
