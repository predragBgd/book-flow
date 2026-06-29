from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, jwt, migrate
from app.routes import auth_bp, public_bp, bookings_bp, admin_bp, staff_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    if app.config.get("CORS_ALLOW_ALL"):
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app, origins=app.config["CORS_ORIGINS"])

    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(staff_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "BookFlow"})

    return app
