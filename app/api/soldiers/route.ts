import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('soldiers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const body = await req.json();
  const { data, error } = await supabase.from('soldiers').insert({
    name: body.name,
    rank: body.rank,
    unit: body.unit ?? null,
    clearance: body.clearance ?? null,
    status: body.status ?? null,
    last_seen: body.last_seen ?? null,
    confidence: body.confidence ?? null,
    avatar_url: body.avatar_url ?? null,
  }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}


