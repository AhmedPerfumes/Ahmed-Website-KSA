import { NextResponse } from "next/server";
export async function GET(request) {
    return new NextResponse(JSON.stringify({ answer: "John Doe" }), {
      status: 200,
    });
}