from app import create_app

app = create_app()


def _init_production_db():
    """Seed PostgreSQL on Render free tier (no Shell / pre-deploy available)."""
    import os

    if not os.getenv("RENDER"):
        return

    from seed import seed_database

    with app.app_context():
        seed_database(reset=False)


_init_production_db()


if __name__ == "__main__":
    import os

    debug = os.getenv("FLASK_ENV", "development") == "development"
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=debug)
