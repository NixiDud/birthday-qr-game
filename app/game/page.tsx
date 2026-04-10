'use client';

import Link from 'next/link';
import { Camera, Eye, EyeOff, Lock, Clock3, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getLocalPlayer } from '@/lib/storage';
import { type BadgeData } from '@/components/BadgeGrid';
import { ALL_TASK_CODES, type TaskCode } from '@/lib/tasks';

const defaultBadges: BadgeData[] = ALL_TASK_CODES.map((code) => ({
  task_code: code,
  status: 'pending',
}));


type PlayerSummary = {
  id: string;
  name: string;
  secret_code: string;
  attempts: BadgeData[];
};

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function GamePage() {
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [error, setError] = useState('');
  const [secretVisible, setSecretVisible] = useState(false);

  useEffect(() => {
    const { playerId } = getLocalPlayer();
    if (!playerId) {
      setError('Nav atrasts spēlētājs. Atgriezies sākumā un izveido profilu.');
      return;
    }

    fetch(`/api/start?playerId=${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setPlayer(data.player);
      })
      .catch((err) => setError(err.message || 'Neizdevās ielādēt spēli.'));
  }, []);

  const badges = useMemo(() => {
    if (!player) return defaultBadges;

    const map = new Map<TaskCode, BadgeData>();
    for (const badge of defaultBadges) map.set(badge.task_code, badge);
    for (const item of player.attempts) map.set(item.task_code, item);
    return Array.from(map.values());
  }, [player]);

  function revealSecret() {
    setSecretVisible(true);
    window.setTimeout(() => setSecretVisible(false), 5000);
  }

  return (
    <main className="page">
      <div className="container stack">
        <div className="card stack center">
          <div>
            <h1 className="title">Sveika, {player?.name || 'spēlētāj'}!</h1>
            <p className="subtitle">Meklē QR kodus, skenē un pildi uzdevumus.</p>
          </div>

          <div className="secretBox stack">
            <div className="muted">Tavs slepenais kods</div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 2 }}>
              {secretVisible ? player?.secret_code || '—' : '•••••'}
            </div>
            <button className="btn btn-secondary" onClick={revealSecret}>
              {secretVisible ? (
                <>
                  <EyeOff size={18} /> Paslēpt pēc 5 sek
                </>
              ) : (
                <>
                  <Eye size={18} /> Parādīt slepeno kodu
                </>
              )}
            </button>
          </div>

          <Link href="/game/scan" className="cameraButton" aria-label="Atvērt kameru">
            <Camera size={42} />
          </Link>
          <div className="muted">Atver kameru un noskenē QR kodu</div>


          {error ? <div className="notice">{error}</div> : null}
        </div>

        <div className="card stack">
          <div>
            <h2 style={{ margin: 0 }}>Tavi badge</h2>
            <p className="subtitle" style={{ marginTop: 8 }}>
              Tikai pabeigtie rāda laiku vai bonusu.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 16,
            }}
          >
            {badges.map((badge) => {
              const elapsed =
                typeof badge.elapsed_seconds === 'number' ? badge.elapsed_seconds : null;
              const bonus =
                typeof badge.bonus_seconds === 'number' ? badge.bonus_seconds : null;

              const isBonus = !!bonus && bonus > 0;
              const isDone = badge.status === 'completed' || isBonus || elapsed !== null;
              const bottomText = isBonus
                ? `-${bonus}s`
                : elapsed !== null
                  ? formatSeconds(elapsed)
                  : '';

              return (
                <div
                  key={badge.task_code}
                  style={{
                    minHeight: 130,
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    padding: 20,
                    opacity: isDone ? 1 : 0.35,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isBonus
                        ? 'rgba(255, 215, 0, 0.14)'
                        : isDone
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    {isBonus ? (
                      <Sparkles size={28} />
                    ) : isDone ? (
                      <Clock3 size={28} />
                    ) : (
                      <Lock size={28} />
                    )}
                  </div>

                  <div
                    style={{
                      minHeight: 24,
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                    }}
                  >
                    {bottomText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}