import db from "@/services/db";
import axios from "axios";
import { Knex } from "knex";
import fs from "fs";
import path from "path";

const filenameCodeMap: { [key: string]: number } = {
  "Ajoneuvoakut(lyijy).txt": 115,
  "energiajäte.txt": 102,
  "kartonki.txt": 105,
  "kyllästetty-puu.txt": 118,
  "lamput.txt": 116,
  "lasi.txt": 107,
  "metalli.txt": 106,
  "muovi.txt": 111,
  "muujäte.txt": 114,
  "pahvi.txt": 104,
  "paperi.txt": 103,
  "Paristot-ja-pienakut.txt": 110,
};

async function readFilesFromFolder(folderPath: string) {
  const fileContents: { [key: number]: string } = {};

  try {
    const files = await fs.promises.readdir(folderPath);

    for (const filename in filenameCodeMap) {
      if (!files.includes(filename)) {
        throw new Error(`File ${filename} not found in folder ${folderPath}`);
      }
    }

    for (const filename of files) {
      if (filename in filenameCodeMap) {
        const filePath = path.join(folderPath, filename);
        const data = await fs.promises.readFile(filePath, "utf8");
        const code = filenameCodeMap[filename];
        fileContents[code] = data;
      }
    }
  } catch (err) {
    console.error("Error reading directory or files:", err);
    throw err;
  }

  return fileContents;
}

export const dynamic = "force-dynamic"; // static by default, unless reading the request

// Config
const apiKey = process.env.KIERRATYS_API_KEY;
const baseUrl = `https://api.kierratys.info/materialtypes/?api_key=${apiKey}`;

export function GET(request: Request) {
  return new Response(`Hello from materials etl`);
}

export async function POST() {
  const contents = await readFilesFromFolder("../ai-training-materials");

  try {
    await db.transaction(async (trx: Knex.Transaction) => {
      // Clear all data from the collection_spots table
      await db("recycler.materials").delete();

      // Fetch materials from the API
      const response = await axios.get(baseUrl);

      if (response.status === 200) {
        const data = response.data;
        const materials = data.results.map(
          (material: { code: number; name: string }) => ({
            code: material.code,
            name: material.name,
            contents: contents[material.code] ?? material.name,
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
