import db from "@/services/db";
import axios from "axios";
import { Knex } from "knex";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

// Config
const apiKey = process.env.KIERRATYS_API_KEY;
const baseUrl = `https://api.kierratys.info/materialtypes/?api_key=${apiKey}`;

export function GET(request: Request) {
  return new Response(`Hello from materials etl`);
}

export async function POST() {
  try {
    await db.transaction(async (trx: Knex.Transaction) => {
      // Clear all data from the collection_spots table
      await db("recycler.materials").truncate();

      // Fetch materials from the API
      const response = await axios.get(baseUrl);

      if (response.status === 200) {
        const data = response.data;
        const materials = data.results.map(
          (material: { code: number; name: string }) => ({
            code: material.code,
            name: material.name,
          })
        );

        // Insert materials into the table
        await db("recycler.materials").insert(materials);

        console.log("Materials successfully added to their own table.");
      } else {
        console.error("Error fetching materials from the API.");
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response("Error", { status: 500 });
  }

  return new Response("OK");
}
