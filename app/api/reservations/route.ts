import { NextResponse } from 'next/server';

// Mock data for reservations
const reservations = [
  { id: '1', court: 'Court 1', date: '2023-12-01', time: '09:00', player: 'John Doe', email: 'john@example.com' },
  { id: '2', court: 'Court 2', date: '2023-12-01', time: '10:00', player: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', court: 'Court 3', date: '2023-12-02', time: '14:00', player: 'Bob Johnson', email: 'bob@example.com' },
];

export async function GET() {
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // In a real app, you would save this to a database
    const newReservation = {
      id: String(Date.now()),
      ...data,
    };
    
    // For this mock implementation, we're just returning the new reservation
    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
} 