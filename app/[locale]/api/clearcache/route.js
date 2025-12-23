import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { secret, tags } = body; // Look for 'tags' array

    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ message: "Missing or invalid tags parameter" }, { status: 400 });
    }

    // ✅ OPTIMIZATION: Loop through the array and clear each one
    console.log(`[Cache] Revalidating tags: ${tags.join(', ')}`);
    tags.forEach((tag) => {
        revalidateTag(tag);
    });

    return NextResponse.json({ revalidated: true, tags, now: Date.now() });

  } catch (error) {
    return NextResponse.json({ message: "Error processing request", error: error.message }, { status: 400 });
  }
}