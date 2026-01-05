import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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