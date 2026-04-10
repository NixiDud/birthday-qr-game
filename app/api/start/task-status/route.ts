import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const playerId = request.nextUrl.searchParams.get('playerId');
    const taskCode = request.nextUrl.searchParams.get('taskCode');

    if (!playerId || !taskCode) {
      return NextResponse.json({ error: 'Trūkst dati.' }, { status: 400 });
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('id', playerId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Spēlētājs nav atrasts.' },
        { status: 404 }
      );
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('task_attempts')
      .select('id')
      .eq('player_id', playerId)
      .eq('qr_code', taskCode)
      .maybeSingle();

    if (attemptError) {
      return NextResponse.json(
        { error: attemptError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      alreadyCompleted: !!attempt,
      taskCode,
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