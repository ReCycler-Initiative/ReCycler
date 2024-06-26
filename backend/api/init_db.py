from db import connect_to_db

if __name__ == "__main__":
    connection = connect_to_db()
    cursor = connection.cursor()

    cursor.execute("""CREATE EXTENSION IF NOT EXISTS postgis;""")

    cursor.execute("""CREATE SCHEMA IF NOT EXISTS recycler;""")

    cursor.close()
    connection.close()
