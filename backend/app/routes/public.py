from flask import Blueprint, jsonify, request

from app.models import Service
from app.utils.slots import get_available_slots

public_bp = Blueprint("public", __name__, url_prefix="/api")


@public_bp.get("/services")
def list_services():
    services = Service.query.filter_by(is_active=True).order_by(Service.name).all()
    return jsonify([service.to_dict() for service in services])


@public_bp.get("/slots")
def list_slots():
    service_id = request.args.get("service_id", type=int)
    date = request.args.get("date")

    if not service_id or not date:
        return jsonify({"error": "service_id and date are required"}), 400

    try:
        slots = get_available_slots(service_id, date)
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    return jsonify({"date": date, "service_id": service_id, "slots": slots})
