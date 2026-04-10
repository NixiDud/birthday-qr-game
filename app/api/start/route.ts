import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SECRET_CODE_LIBRARY } from '@/lib/secret-codes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Vārds ir obligāts.' }, { status: 400 });
  }

  const { data: existingPlayers, error: existingError } = await supabase
    .from('players')
    .select('secret_code')
    .order('created_at', { ascending: true });

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const usedCodes = new Set((existingPlayers || []).map((p) => p.secret_code));
  const nextCodeEntry = SECRET_CODE_LIBRARY.find((entry) => !usedCodes.has(entry.code));

  if (!nextCodeEntry) {
    return NextResponse.json({ error: 'Nav vairs pieejamu slepeno kodu.' }, { status: 400 });
  }

  const { data: insertedPlayer, error: insertError } = await supabase
    .from('players')
    .insert({
      name,
      secret_code: nextCodeEntry.code,
    })
    .select('id, name, secret_code')
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    player: insertedPlayer,
  });
}

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json({ error: 'Nav playerId.' }, { status: 400 });
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id, name, secret_code')
    .eq('id', playerId)
    .single();

  if (playerError || !player) {
    return NextResponse.json({ error: 'Spēlētājs nav atrasts. Restartē spēli.' }, { status: 404 });
  }

  const { data: attempts, error: attemptsError } = await supabase
    .from('task_attempts')
    .select('qr_code, status, elapsed_seconds, bonus_seconds')
    .eq('player_id', playerId);

  if (attemptsError) {
    return NextResponse.json({ error: attemptsError.message }, { status: 500 });
  }

  const normalizedAttempts = (attempts || []).map((item) => ({
    task_code: item.qr_code,
    status: item.status,
    elapsed_seconds: item.elapsed_seconds ?? undefined,
    bonus_seconds: item.bonus_seconds ?? undefined,
  }));

  return NextResponse.json({
    player: {
      ...player,
      attempts: normalizedAttempts,
    },
  });
}