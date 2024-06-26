# This script retrieves data from the kierratys.info API about recycling materials and saves it into a PostgreSQL database.
# Request Kierrätys Info API key: https://api.kierratys.info/get_apikey/
# This script connects to a PostgreSQL database, retrieves data from an API endpoint,
# and inserts the retrieved data into the 'materials' table in the database.
# The data is fetched from the 'https://api.kierratys.info/materialtypes/' API endpoint,
# using an API key for authentication.

import os
import psycopg2
import requests

# config
api_key = os.getenv("KIERRATYS_API_KEY")
base_url = f"https://api.kierratys.info/materialtypes/?api_key={api_key}"

dbname = os.getenv("POSTGRES_DB")
user = os.getenv("POSTGRES_USER")
password = os.getenv("POSTGRES_PASSWORD")
host = os.getenv("POSTGRES_HOST")
port = os.getenv("POSTGRES_PORT")

try:
    # Connect to the database
    conn = psycopg2.connect(
        dbname="postgres" if dbname is None else dbname,
        user="postgres" if user is None else user,
        password="foobar" if password is None else password,
        host="localhost" if host is None else host,
        port="5434" if port is None else port,
    )
    c = conn.cursor()

    c.execute(
        """CREATE EXTENSION IF NOT EXISTS postgis;"""
    )

    c.execute(
        """CREATE SCHEMA IF NOT EXISTS recycler;"""
    )

    # Drop and create materials table with code and material_name columns
    c.execute(
        """DROP TABLE IF EXISTS recycler.materials"""
    )

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
        materials = [(material["code"], material["name"]) for material in data["results"]]

        # Insert materials into the table
        c.executemany("INSERT INTO recycler.materials (code, material_name) VALUES (%s, %s)", materials)

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
