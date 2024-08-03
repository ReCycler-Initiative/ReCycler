import db from "@/services/db";
import axios from "axios";
import { Knex } from "knex";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

// Config
const baseUrl = "https://api.kierratys.info/collectionspots/";
const apiKey = process.env.KIERRATYS_API_KEY;

export function GET() {
  return new Response(`Hello from collection spots etl`);
}

export async function DELETE() {
  // Clear all data from the collection_spots table
  await db("recycler.collection_spots").truncate();

  return new Response("OK");
}

export async function POST(request: NextRequest) {
  try {
    await db.transaction(async (trx: Knex.Transaction) => {
      // Initialize total_items
      let totalItems: number;

      // Get the details of the first page and set total_items
      const limit = 100;
      const from = +(request.nextUrl.searchParams.get("from") ?? 1);
      const to = request.nextUrl.searchParams.get("to");

      const firstPageUrl = `${baseUrl}?api_key=${apiKey}&format=json&limit=${limit}&offset=0`;
      let response = await axios.get(firstPageUrl);
      let data = response.data;
      totalItems = to ? +to * limit : data.count;

      // Iterate through all pages and save the data to the database
      let offset = (from - 1) * limit;

      const totalPages = Math.ceil(totalItems / limit);

      while (offset < totalItems) {
        const url = `${baseUrl}?api_key=${apiKey}&format=json&limit=${limit}&offset=${offset}`;
        const page = Math.ceil(offset / limit) + 1;

        console.log(`Loading page ${page} of ${totalPages}`);

        response = await axios.get(url);
        data = response.data;

        // Iterate through the search results and save them to the database
        for (const item of data.results) {
          const spotId = item.spot_id;
          const name = item.name;
          const address = item.address;
          const postalCode = item.postal_code;
          const postOffice = item.post_office;
          const municipality = item.municipality;
          const openingHoursEn = item.opening_hours_en;
          const openingHoursFi = item.opening_hours_fi;
          const openingHoursSv = item.opening_hours_sv;
          const descriptionEn = item.description_en;
          const descriptionFi = item.description_fi;
          const descriptionSv = item.description_sv;
          const occupied = item.occupied || "";
          const additionalDetails = item.additional_details;
          const materials = item.materials
            ? item.materials.map((material: { name: string }) => material.name)
            : [];
          const geometry = item.geometry;
          let pointText = null;

          if (
            geometry &&
            geometry.coordinates &&
            geometry.coordinates.length === 2
          ) {
            const [longitude, latitude] = geometry.coordinates;
            pointText = `POINT(${longitude} ${latitude})`;
          }

          await db("recycler.collection_spots").insert({
            spot_id: spotId,
            name,
            address,
            postal_code: postalCode,
            post_office: postOffice,
            municipality,
            materials,
            opening_hours_en: openingHoursEn,
            opening_hours_fi: openingHoursFi,
            opening_hours_sv: openingHoursSv,
            description_en: descriptionEn,
            description_fi: descriptionFi,
            description_sv: descriptionSv,
            occupied,
            additional_details: additionalDetails,
            geom: pointText && db.raw(`ST_GeomFromText('${pointText}', 4326)`),
          });
        }

        // Update the offset for the next page
        offset += limit;
      }
      console.log("Data successfully loaded into the database.");
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }

  return new Response("OK");
}
