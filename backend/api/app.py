from flask import Flask, jsonify, request
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

crs = 4326


def get_db_connection():
    return psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="foobar",
        host="localhost",
        port="5434",
    )


@app.route("/api/collection_spots", methods=["GET"])
def get_collection_spots():
    try:
        # xmin = request.args.get("xmin", type=float)
        # ymin = request.args.get("ymin", type=float)
        # xmax = request.args.get("xmax", type=float)
        # ymax = request.args.get("ymax", type=float)

        # if xmin is None or ymin is None or xmax is None or ymax is None:
        #     return jsonify({"error": "Koordinaatit puuttuvat"}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        # cursor.execute(
        #     """
        #     SELECT jsonb_build_object(
        #         'type', 'FeatureCollection',
        #         'features', jsonb_agg(features.feature)
        #     ) AS geojson
        #     FROM (
        #         SELECT jsonb_build_object(
        #             'type', 'Feature',
        #             'geometry', ST_AsGeoJSON(geom)::jsonb,
        #             'properties', jsonb_build_object(
        #                 'id', id,
        #                 'name', name
        #             )
        #         ) AS feature
        #         FROM recycler.collection_spots
        #         WHERE ST_Intersects(geom, ST_MakeEnvelope(%s, %s, %s, %s, %s))
        #     ) AS features;
        # """,
        #     (xmin, ymin, xmax, ymax, crs),
        # )

        cursor.execute(
            """
            SELECT jsonb_build_object(
                'type', 'FeatureCollection',
                'features', jsonb_agg(features.feature)
            ) AS geojson
            FROM (
                SELECT jsonb_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(geom)::jsonb,
                    'properties', jsonb_build_object(
                        'id', id,
                        'name', name,
                        'address', address,
                        'materials', materials
                    )
                ) AS feature
                FROM recycler.collection_spots
            ) AS features;
        """
        )

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return jsonify(result[0])

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return jsonify({"error": "Tietokantavirhe"}), 500


@app.route("/api/collection_spots/<int:feature_id>", methods=["GET"])
def get_collection_spot(collection_spot_id):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geom)::jsonb,
                'properties', jsonb_build_object(
                    'id', id,
                    'name', name,
                    'materials', materials
                    -- Lisää muita ominaisuuksia tarvittaessa
                )
            ) AS feature
            FROM recycler.collection_spots
            WHERE id = %s;
        """,
            (collection_spot_id,),
        )

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result:
            return jsonify(result[0])
        else:
            return jsonify({"error": "Collection spot not found"}), 404

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        return jsonify({"error": "Tietokantavirhe"}), 500


if __name__ == "__main__":
    app.run(debug=True)


if __name__ == "__main__":
    app.run(debug=True)
