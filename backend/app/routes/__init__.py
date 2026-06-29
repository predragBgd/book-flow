from app.routes.auth import auth_bp
from app.routes.public import public_bp
from app.routes.bookings import bookings_bp
from app.routes.admin import admin_bp
from app.routes.staff import staff_bp

__all__ = ["auth_bp", "public_bp", "bookings_bp", "admin_bp", "staff_bp"]
