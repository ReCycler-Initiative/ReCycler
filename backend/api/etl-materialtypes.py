# This script retrieves data from the kierratys.info API about recycling materials and saves it into a PostgreSQL database.
# Request Kierrätys Info API key: https://api.kierratys.info/get_apikey/
# This script connects to a PostgreSQL database, retrieves data from an API endpoint,
# and inserts the retrieved data into the 'materials' table in the database.
# The data is fetched from the 'https://api.kierratys.info/materialtypes/' API endpoint,
# using an API key for authentication.

import os
import requests
from db import connect_to_db
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# config
api_key = os.getenv("KIERRATYS_API_KEY")
base_url = f"https://api.kierratys.info/materialtypes/?api_key={api_key}"


try:
    # Connect to the database
    conn = connect_to_db()
    c = conn.cursor()

    # Drop and create materials table with code and material_name columns
    c.execute("""DROP TABLE IF EXISTS recycler.materials""")

    c.execute(
        """CREATE TABLE recycler.materials
                (id SERIAL PRIMARY KEY,
                code INTEGER UNIQUE,
                material_name TEXT UNIQUE)"""
    )

    # Fetch materials from the API
    response = requests.get(base_url)
    if response.status_code == 200:
        data = response.json()
        materials = [
            (material["code"], material["name"]) for material in data["results"]
        ]

        # Insert materials into the table
        c.executemany(
            "INSERT INTO recycler.materials (code, material_name) VALUES (%s, %s)",
            materials,
        )

        # Save changes
        conn.commit()
        print("Materials successfully added to their own table.")
    else:
        print("Error fetching materials from the API.")
except Exception as e:
    print(f"Error: {e}")
finally:
    # Close the database connection
    if conn:
        conn.close()
