# This script retrieves data from the kierratys.info API about collection spots for recycling and saves it into a PostgreSQL database.
# If location information is available, it is stored in PostGIS format.
# Request Kierrätys Info API key: https://api.kierratys.info/get_apikey/
# This script connects to a PostgreSQL database, retrieves data from an API endpoint,
# and inserts the retrieved data into the 'collection_spots' table in the database.
# The data is fetched from the 'https://api.kierratys.info/collectionspots/' API endpoint,
# using an API key for authentication. The script iterates through all the pages of results,
# extracts relevant information and coordinates of collection spots,
# converts the coordinates into a PostGIS point geometry format, and inserts this information
# into the 'collection_spots' table in the PostgreSQL database. If the retrieved data does not
# contain coordinates or if they are not in the expected format, it skips inserting that specific record.

import os
import psycopg2
import requests

# Config
base_url = "https://api.kierratys.info/collectionspots/"
api_key = "kierratysinfo_api_key"

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="foobar",
        host="localhost",
        port="5432",
    )
    c = conn.cursor()

    c.execute("DROP TABLE IF EXISTS recycler.collection_spots")

    c.execute(
        """CREATE TABLE IF NOT EXISTS recycler.collection_spots
                (id SERIAL PRIMARY KEY,
                spot_id TEXT,
                name TEXT,
                address TEXT,
                postal_code TEXT,
                post_office TEXT,
                materials TEXT,
                municipality TEXT,
                geom GEOMETRY(Point, 4326),
                opening_hours_en TEXT,
                opening_hours_fi TEXT,
                opening_hours_sv TEXT,
                description_en TEXT,
                description_fi TEXT,
                description_sv TEXT,
                occupied TEXT,
                additional_details TEXT
                )"""
    )

    # Clear the table
    c.execute("DELETE FROM recycler.collection_spots")

    # Initialize total_items
    total_items = None

    # Get the details of the first page and set total_items
    url = f"{base_url}?api_key={api_key}&format=json&limit=1000&offset=0"
    response = requests.get(url)
    data = response.json()
    total_items = data["count"]

    # Iterate through all pages and save the data to the database
    limit = 1000
    offset = 0
    total_pages = int(total_items / limit + 1)

    while offset < total_items:
        url = f"{base_url}?api_key={api_key}&format=json&limit={limit}&offset={offset}"

        page = int(offset / limit + 1)

        print("Loading page " + str(page) + " of " + str(total_pages))

        response = requests.get(url)
        data = response.json()

        # Iterate through the search results and save them to the database
        for item in data["results"]:
            spot_id = item["spot_id"]
            name = item["name"]
            address = item["address"]
            postal_code = item["postal_code"]
            post_office = item["post_office"]
            municipality= item["municipality"]
            opening_hours_en = item.get("opening_hours_en", "")
            opening_hours_fi = item.get("opening_hours_fi", "")
            opening_hours_sv = item.get("opening_hours_sv", "")
            description_en = item.get("description_en", "")
            description_fi = item.get("description_fi", "")
            description_sv = item.get("description_sv", "")
            occupied = item.get("occupied", "")
            additional_details = item.get("additional_details", "")
            materials = [material["name"] for material in item.get("materials", [])]
            geometry = item.get('geometry')  # Get geometry if it exists
            if geometry is not None:
                coordinates = geometry.get('coordinates')  # Get coordinates if they exist
                if coordinates is not None and len(coordinates) == 2:  # Ensure coordinates are in the correct format
                    # Convert coordinates to PostGIS point geometry and insert into the database
                    point_text = f"POINT({coordinates[0]} {coordinates[1]})"
                    c.execute("INSERT INTO recycler.collection_spots (spot_id, name, address, postal_code, post_office, municipality, materials, opening_hours_fi, opening_hours_sv, description_en, opening_hours_en, description_fi, description_sv, occupied, additional_details, geom) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_GeomFromText(%s, 4326))", (spot_id, name, address, postal_code, post_office, municipality, materials, opening_hours_en, opening_hours_fi, opening_hours_sv, description_en, description_fi, description_sv, occupied, additional_details, point_text))
        # Update the offset for the next page
        offset += limit

    conn.commit()
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    # Save the changes and close the database connection
    if conn:
        conn.close()
