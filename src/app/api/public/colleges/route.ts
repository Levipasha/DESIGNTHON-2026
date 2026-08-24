import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://designathon:12345%40qwert@cluster0.zugoiy9.mongodb.net/?appName=Cluster0';

let client: MongoClient | null = null;

async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db();
}

const HIDDEN_TEST_EMAILS = ['admin@retrend.com', 'admnklnklin@retrend.com', 'abbupasha61@gmail.com'];
const HIDDEN_TEST_NAMES = ['p9uy87ghuoijpok opihguyftc', 'hjjjkkj', 'skyweb'];

const isRealParticipant = (u: any) => {
  if (u.role === 'admin') return false;
  const email = (u.email || '').toLowerCase().trim();
  const name = (u.name || '').toLowerCase().trim();
  if (HIDDEN_TEST_EMAILS.includes(email) || HIDDEN_TEST_NAMES.includes(name)) return false;
  if (email.endsWith('@retrend.com')) return false;
  return true;
};

export async function GET() {
  try {
    const db = await getDb();
    const users = await db.collection('users').find({}).toArray();
    const realUsers = users.filter(isRealParticipant);
    const collegesSet = new Set(realUsers.map((u: any) => u.college).filter(Boolean));

    return NextResponse.json(Array.from(collegesSet), {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/public/colleges route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
