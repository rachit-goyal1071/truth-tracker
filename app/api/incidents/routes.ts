// app/api/incidents/route.ts
import { db } from '@/lib/firebase'; // adjust this import to your Firebase config
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { source, incidents } = await request.json();
    if (!source || !Array.isArray(incidents)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Save to Firestore
    await db.collection('incidents').add({
      source,
      incidents,
      fetchedAt: new Date()
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving incidents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
