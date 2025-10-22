import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();
  const body = await req.json();
  const { data, error } = await supabase
    .from('soldiers')
    .update({
      name: body.name,
      rank: body.rank,
      unit: body.unit,
      clearance: body.clearance,
      status: body.status,
      last_seen: body.last_seen,
      confidence: body.confidence,
      avatar_url: body.avatar_url,
    })
    .eq('id', params.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('soldiers').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


