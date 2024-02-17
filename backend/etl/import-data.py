import requests
import psycopg2

# Connect to the database
conn = psycopg2.connect(database="postgres", user="postgres", password="foobar", host="localhost", port="5432")
cur = conn.cursor()

# Base URL of the API
base_url = "https://api.kierratys.info/collectionspots/"
# API key (Please replace this with your actual API key)
api_key = "YOUR_API_KEY_HERE"

# Fetch data from the first page and set total_items
url = f"{base_url}?api_key={api_key}&format=json&limit=1000&offset=0"
response = requests.get(url)
data = response.json()
total_items = data['count']

# Iterate through all pages and save the data to the database
limit = 1000
offset = 0
while offset < total_items:
    url = f"{base_url}?api_key={api_key}&format=json&limit={limit}&offset={offset}"
    response = requests.get(url)
    data = response.json()
    
    # Iterate through the search results and save them to the database
    for item in data['results']:
        name = item['name']
        address = item['address']
        geometry = item.get('geometry')  # Get geometry if it exists
        if geometry is not None:
            coordinates = geometry.get('coordinates')  # Get coordinates if they exist
            if coordinates is not None and len(coordinates) == 2:  # Ensure coordinates are in the correct format
                # Convert coordinates to PostGIS point geometry and insert into the database
                point_text = f"POINT({coordinates[0]} {coordinates[1]})"
                cur.execute("INSERT INTO collection_spots (name, address, geom) VALUES (%s, %s, ST_GeomFromText(%s, 4326))", (name, address, point_text))
    
    # Update offset for the next page
    offset += limit

# Commit changes and close the database connection
conn.commit()
conn.close()
