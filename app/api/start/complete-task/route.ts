import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId,
      taskCode,
      elapsedSeconds = 0,
      bonusSeconds = 0,
      answerText = '',
    } = body ?? {};

    if (!playerId || !taskCode) {
      return NextResponse.json(
        { error: 'Trūkst playerId vai taskCode.' },
        { status: 400 }
      );
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

    const { data: existingAttempt, error: existingError } = await supabase
      .from('task_attempts')
      .select('id, status')
      .eq('player_id', playerId)
      .eq('qr_code', taskCode)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existingAttempt) {
      return NextResponse.json(
        { error: 'Šis jau ir izpildīts.' },
        { status: 409 }
      );
    }

    const payload = {
      player_id: playerId,
      qr_code: taskCode,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      elapsed_seconds: Number(elapsedSeconds) || 0,
      bonus_seconds: Number(bonusSeconds) || 0,
      answer_text: answerText || null,
    };

    const { error: insertError } = await supabase
      .from('task_attempts')
      .insert(payload);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
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