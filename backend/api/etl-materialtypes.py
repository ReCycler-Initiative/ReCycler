# This script retrieves data from the kierratys.info API about recycling materials and saves it into a PostgreSQL database.
# Request Kierrätys Info API key: https://api.kierratys.info/get_apikey/
# This script connects to a PostgreSQL database, retrieves data from an API endpoint,
# and inserts the retrieved data into the 'materials' table in the database.
# The data is fetched from the 'https://api.kierratys.info/materialtypes/' API endpoint,
# using an API key for authentication.

import psycopg2
import requests

# config
api_key = "kierratysinfo_api_key"
base_url = f"https://api.kierratys.info/materialtypes/?api_key={api_key}"

try:
    # Connect to the database
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="foobar",
        host="localhost",
        port="5432",
    )
    c = conn.cursor()

    # Create materials table
    c.execute(
        """CREATE TABLE IF NOT EXISTS recycler.materials
                (id SERIAL PRIMARY KEY,
                material_name TEXT UNIQUE)"""
    )

    # Clear old data
    c.execute("DELETE FROM recycler.materials")

    # Fetch materials from the API
    response = requests.get(base_url)
    if response.status_code == 200:
        data = response.json()
        materials = [(material["name"],) for material in data["results"]]

        # Insert materials into the table
        c.executemany("INSERT INTO recycler.materials (material_name) VALUES (%s)", materials)

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
