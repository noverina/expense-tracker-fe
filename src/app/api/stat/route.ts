import { NextRequest, NextResponse } from "next/server";
import { HttpResponse } from "../../../types/types";
import { error } from "console";

export async function GET(req: NextRequest) {
  if (req.method === "GET") {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year")?.toString() || "";
    const month = searchParams.get("month")?.toString() || "";
    if (year == "" || month == "") {
      NextResponse.json(
        { message: "unable to get url params" },
        { status: 500 }
      );
    }
    const queryParams = new URLSearchParams({
      year: year,
      month: month,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const urlEnv = process.env.ENDPOINT_SUM;
    if (urlEnv == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });
    const url = new URL(urlEnv || "");
    url.search = queryParams.toString();
    const token = process.env.TOKEN;
    if (token == undefined)
      NextResponse.json({ message: "unable to load .env" }, { status: 500 });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw error("Failed to fetch events data");
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
