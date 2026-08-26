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

const isConfirmedParticipant = (u: any) => {
  if (!isRealParticipant(u)) return false;
  return u.paymentStatus === 'paid' || u.registrationStatus === 'CONFIRMED' || u.registrationStatus === 'PAYMENT_COMPLETED';
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const college = searchParams.get('college');
    const lookingForTeam = searchParams.get('lookingForTeam');
    const sort = searchParams.get('sort');

    const db = await getDb();
    const users = await db.collection('users').find({}).toArray();
    const teams = await db.collection('teams').find({}).toArray();

    const teamsMap = new Map(teams.map((t: any) => [t.id, t.name]));

    let participants = users.filter(isConfirmedParticipant).map((u: any) => ({
      id: u.id || String(u._id),
      registrationId: u.registrationId || `DT26-${(u.id || String(u._id)).substring(0, 6).toUpperCase()}`,
      name: u.name,
      college: u.college,
      branch: u.branch,
      year: u.year,
      gender: u.gender,
      linkedin: u.linkedin,
      portfolio: u.portfolio,
      teamId: u.teamId,
      teamName: u.teamId ? (teamsMap.get(u.teamId) || 'In Team') : undefined,
      teamRole: u.teamRole,
      paymentStatus: u.paymentStatus,
      registrationStatus: u.registrationStatus || 'CONFIRMED',
      createdAt: u.createdAt
    }));

    if (search) {
      const term = search.toLowerCase();
      participants = participants.filter((p: any) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.college && p.college.toLowerCase().includes(term)) ||
        (p.branch && p.branch.toLowerCase().includes(term)) ||
        (p.teamName && p.teamName.toLowerCase().includes(term))
      );
    }

    if (college) {
      const clg = college.toLowerCase();
      participants = participants.filter((p: any) => p.college && p.college.toLowerCase() === clg);
    }

    if (lookingForTeam === 'true') {
      participants = participants.filter((p: any) => !p.teamId);
    }

    if (sort === 'newest') {
      participants.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else {
      participants.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    }

    return NextResponse.json(participants, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('Error in /api/public/participants route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
