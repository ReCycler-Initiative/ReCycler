import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

type Handler<T> = (params: T, req: NextRequest) => Promise<Response>;

export function withZodPost<T>(
  requestSchema: ZodSchema<T>,
  handler: Handler<T>
) {
  return async function (req: NextRequest): Promise<Response> {
    try {
      const json = await req.json();
      const params = requestSchema.parse(json);
      return await handler(params, req);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }

      console.error(error);

      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  };
}

export function withZodGet<T>(
  requestSchema: ZodSchema<T>,
  handler: Handler<T>
) {
  return async function (req: NextRequest): Promise<Response> {
    try {
      const url = req.nextUrl;
      const params = requestSchema.parse(Object.fromEntries(url.searchParams));
      return await handler(params, req);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }

      console.error(error);

      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  };
}
