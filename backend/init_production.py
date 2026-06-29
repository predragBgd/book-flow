"""Initialize production database (tables + demo seed if empty)."""

from app import create_app
from seed import seed_database


def main():
    app = create_app()
    with app.app_context():
        seeded = seed_database(reset=False)
        if seeded:
            print("Production database initialized with demo data.")
        else:
            print("Production database ready.")


if __name__ == "__main__":
    main()
