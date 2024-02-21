import psycopg2
import requests

# API-avain
api_key = "04acd2662d9ed17046ec0dcf23d09e3ed2f1b3a3"
base_url = f"https://api.kierratys.info/materialtypes/?api_key={api_key}"

try:
    # Yhdistetään tietokantaan
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="foobar",
        host="localhost",
        port="5432",
    )
    c = conn.cursor()

    # Luodaan materials-taulu
    c.execute(
        """CREATE TABLE IF NOT EXISTS recycler.materials
                (id SERIAL PRIMARY KEY,
                material_name TEXT UNIQUE)"""
    )

    # Poistetaan vanhat tiedot
    c.execute("DELETE FROM recycler.materials")

    # Haetaan materiaalit API:sta
    response = requests.get(base_url)
    if response.status_code == 200:
        data = response.json()
        materials = [(material["name"],) for material in data["results"]]

        # Lisätään materiaalit tauluun
        c.executemany("INSERT INTO recycler.materials (material_name) VALUES (%s)", materials)

        # Tallennetaan muutokset
        conn.commit()
        print("Materiaalit lisätty onnistuneesti omaan tauluun.")
    else:
        print("Virhe haettaessa materiaaleja API:sta.")
except Exception as e:
    print(f"Virhe: {e}")
finally:
    # Suljetaan tietokantayhteys
    if conn:
        conn.close()
