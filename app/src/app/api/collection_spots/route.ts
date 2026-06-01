import db from "@/services/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.raw(`
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
                    'postal_code', postal_code,
                    'post_office', post_office,
                    'materials', materials,
                    'additional_details', additional_details,
                    'description_en', description_en,
                    'opening_hours_fi', opening_hours_fi,
                    'opening_hours_en', opening_hours_en,
                    'description_fi', description_fi
                )
            ) AS feature
            FROM recycler.collection_spots
        ) AS features;
    `);

  return NextResponse.json(result.rows[0].geojson);
}
