import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // 1. Security Check
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // 2. The Nuclear Option
    // By revalidating '/', and setting type to 'layout', 
    // Next.js clears the cache for the Root Layout and EVERYTHING nested inside it.
    console.log("[Cache] ☢️ CLEARING ENTIRE SITE CACHE ☢️");
    revalidatePath("/", "layout");

    return NextResponse.json({ 
      revalidated: true, 
      scope: "ENTIRE_SITE", 
      now: Date.now() 
    });

  } catch (error) {
    return NextResponse.json({ message: "Error processing request", error: error.message }, { status: 500 });
  }
}