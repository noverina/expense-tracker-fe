import { NextRequest, NextResponse } from "next/server";
import { HttpResponse } from "../../../types/types";
import { error } from "console";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const urlEnv = process.env.ENDPOINT_FILTER;
    if (urlEnv == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });
    const url = new URL(urlEnv || "");
    const token = process.env.TOKEN;
    if (token == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });

    const requestBody: string = await req.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw error("Failed to fetch submit form");
    }

    const data: HttpResponse = await response.json();

    if (data.is_error) {
      return NextResponse.json(data, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } else {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
}
