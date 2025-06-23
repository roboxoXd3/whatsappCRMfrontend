import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(`${BACKEND_URL}/api/leads/${id}/interactions`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/leads/${id}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json({ error: 'Failed to create interaction' }, { status: 500 });
  }
} 