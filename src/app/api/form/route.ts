import { NextRequest, NextResponse } from "next/server";
import { HttpResponse, FormData, FormDataRequest } from "../../../types/types";
import { error } from "console";

export async function POST(req: NextRequest) {
  if (req.method === "POST") {
    const urlEnv = process.env.ENDPOINT_UPSERT;
    if (urlEnv == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });
    const url = new URL(urlEnv || "");
    const token = process.env.TOKEN;
    if (token == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });

    const body = await req.json();
    const formattedAmount = body.amount.replace(/,/g, "");
    body.amount = formattedAmount;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
    }

    const data: HttpResponse = await response.json();

    if (data.is_error && data.message != "event limit")
      return NextResponse.json(data, { status: 500 });

    return NextResponse.json(data, { status: 200 });
  } else {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }
}
