import os
import psycopg2

dbname = os.getenv("POSTGRES_DB")
user = os.getenv("POSTGRES_USER")
password = os.getenv("POSTGRES_PASSWORD")
host = os.getenv("POSTGRES_HOST")
port = os.getenv("POSTGRES_PORT")


def connect_to_db():
    conn = psycopg2.connect(
        dbname="postgres" if dbname is None else dbname,
        user="postgres" if user is None else user,
        password="foobar" if password is None else password,
        host="localhost" if host is None else host,
        port="5434" if port is None else port,
    )
    return conn
