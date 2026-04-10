import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, secretCode, startsWith } = body ?? {};

    if (!playerId || !secretCode || !startsWith) {
      return NextResponse.json({ error: 'Trūkst dati.' }, { status: 400 });
    }

    const cleanCode = String(secretCode).trim();

    const { data: player, error } = await supabase
      .from('players')
      .select('id, secret_code')
      .eq('secret_code', cleanCode)
      .single();

    if (error || !player) {
      return NextResponse.json({ error: 'Šāds slepenais kods nav atrasts.' }, { status: 404 });
    }

    if (player.id === playerId) {
      return NextResponse.json({ error: 'Nevari izmantot pats savu kodu.' }, { status: 400 });
    }

    if (!cleanCode.startsWith(String(startsWith))) {
      return NextResponse.json(
        { error: `Kodam jāsākas ar ${startsWith}.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Nezināma servera kļūda.',
      },
      { status: 500 }
    );
  }
}