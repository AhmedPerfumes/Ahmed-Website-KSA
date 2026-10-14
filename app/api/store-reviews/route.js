import { NextResponse } from 'next/server';

// Server-side cache keyed by each store's unique locationName (3-day TTL)
const reviewsCache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days in milliseconds

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const locationName = requestBody.locationName || requestBody.location;

    if (!locationName) {
      return NextResponse.json(
        { success: false, message: 'locationName is required' },
        { status: 400 }
      );
    }

    // Check individual store cache first
    const cached = reviewsCache.get(locationName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data);
    }

    const token = process.env.STORE_LOCATOR;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // RightChoice expects { locationName: "locations/..." }
    const res = await fetch(
      'https://prod-backend.rightchoice.ai/v1/private_user_store_reviews/',
      {
        method: 'POST',
        headers: {
          Authorization: token.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationName }),
        cache: 'no-store', // Avoid Next.js data-cache sharing the same URL across different stores
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Failed: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Cache the successful response for this specific store
    if (data?.success) {
      reviewsCache.set(locationName, {
        data,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching store reviews:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
