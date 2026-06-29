from app import create_app

app = create_app()


def _init_production_db():
    """Seed PostgreSQL on Render — run in background so gunicorn starts quickly."""
    import logging
    import os
    import threading

    if not os.getenv("RENDER"):
        return

    logger = logging.getLogger(__name__)

    def run():
        try:
            from seed import seed_database

            with app.app_context():
                seeded = seed_database(reset=False)
                if seeded:
                    logger.info("Production database initialized with demo data.")
        except Exception:
            logger.exception("Production database init failed")

    threading.Thread(target=run, daemon=True, name="bookflow-db-init").start()


_init_production_db()


if __name__ == "__main__":
    import os

    debug = os.getenv("FLASK_ENV", "development") == "development"
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=debug)
