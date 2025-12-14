import axios from "axios";
import { NextResponse } from "next/server";
import z from "zod";

const baseUrl = process.env.KIERRATYS_API_URL;
const apiKey = process.env.KIERRATYS_API_KEY;

export async function GET() {
  const url = `${baseUrl}/collectionspots/?api_key=${apiKey}&format=json`;
  const response = await axios.head(url);

  return NextResponse.json({
    status: response.status,
    statusText: response.statusText,
  });
}
