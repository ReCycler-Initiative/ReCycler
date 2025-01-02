import db from "@/services/db";

export const chat = (message: string): Promise<string> =>
  db
    .raw("SELECT generate_rag_response(?)", [message])
    .then((res) => res.rows[0].generate_rag_response);
