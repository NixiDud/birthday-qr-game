import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json({ error: 'Trūkst playerId.' }, { status: 400 });
    }

    const { data: players, error } = await supabase
      .from('players')
      .select('id, secret_code')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const otherPlayers = (players || []).filter((p) => p.id !== playerId);
    if (otherPlayers.length === 0) {
      return NextResponse.json(
        { error: 'QR2 vajag vismaz vēl vienu spēlētāju.' },
        { status: 400 }
      );
    }

    const availableDigits = Array.from(
      new Set(
        otherPlayers
          .map((p) => String(p.secret_code || '').charAt(0))
          .filter(Boolean)
      )
    );

    if (availableDigits.length === 0) {
      return NextResponse.json(
        { error: 'Nav pieejamu slepeno kodu sākuma ciparu.' },
        { status: 400 }
      );
    }

    const randomDigit =
      availableDigits[Math.floor(Math.random() * availableDigits.length)];

    return NextResponse.json({
      digit: randomDigit,
    });
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