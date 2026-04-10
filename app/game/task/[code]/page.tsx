'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ALL_TASK_CODES, TASKS, type TaskCode } from '@/lib/tasks';
import { getLocalPlayer } from '@/lib/storage';

type TaskStatusResponse = {
  alreadyCompleted: boolean;
  taskCode: TaskCode;
};

const QR6_PARTS = ['dzi', 'Bab', 'm', 'as', 'die', '!', 'uļai', 'šan', 'na'];
const QR6_CORRECT = ['Bab', 'uļai', 'dzi', 'm', 'šan', 'as', 'die', 'na', '!'];

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export default function TaskPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params.code || '').toUpperCase() as TaskCode;

  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [buttonLocked, setButtonLocked] = useState(code === 'QR1');
  const [qr2Digit, setQr2Digit] = useState<string>('');
  const [qr6Selected, setQr6Selected] = useState<string[]>([]);

  const validTask = ALL_TASK_CODES.includes(code);

  useEffect(() => {
    if (!validTask) return;

    const { playerId } = getLocalPlayer();
    if (!playerId) {
      setError('Nav atrasts spēlētājs. Atgriezies sākumā.');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const statusRes = await fetch(
          `/api/start/task-status?playerId=${playerId}&taskCode=${code}`
        );
        const statusData: TaskStatusResponse & { error?: string } =
          await statusRes.json();

        if (!statusRes.ok || statusData.error) {
          throw new Error(statusData.error || 'Kļūda ielādējot uzdevumu.');
        }

        setAlreadyDone(statusData.alreadyCompleted);

        if (statusData.alreadyCompleted) {
          setLoading(false);
          return;
        }

        if (code === 'QR2') {
          const qr2Res = await fetch(
            `/api/start/qr2-challenge?playerId=${playerId}`
          );
          const qr2Data = await qr2Res.json();

          if (!qr2Res.ok || qr2Data.error) {
            throw new Error(qr2Data.error || 'Neizdevās ielādēt QR2 uzdevumu.');
          }

          setQr2Digit(String(qr2Data.digit));
        }

        if (code !== 'QR5') {
          setTimerStartedAt(Date.now());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kļūda.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code, validTask]);

  useEffect(() => {
    if (code !== 'QR1') return;
    const timeout = window.setTimeout(() => setButtonLocked(false), 10000);
    return () => window.clearTimeout(timeout);
  }, [code]);

  useEffect(() => {
    if (timerStartedAt === null) return;
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - timerStartedAt) / 1000));
    }, 250);
    return () => window.clearInterval(interval);
  }, [timerStartedAt]);

  const title = useMemo(
    () => (validTask ? TASKS[code].title : 'Nezināms QR kods'),
    [code, validTask]
  );

  const qr6AvailableParts = useMemo(() => {
    const remaining = [...QR6_PARTS];
    for (const picked of qr6Selected) {
      const index = remaining.indexOf(picked);
      if (index !== -1) remaining.splice(index, 1);
    }
    return remaining;
  }, [qr6Selected]);

  async function completeTask(payload?: Record<string, unknown>) {
    const { playerId } = getLocalPlayer();
    if (!playerId) return;

    const response = await fetch('/api/start/complete-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        taskCode: code,
        elapsedSeconds: code === 'QR5' ? 0 : elapsed,
        ...payload,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Neizdevās saglabāt uzdevumu.');
    router.push('/game');
  }

  function handleQr6Pick(part: string) {
    if (qr6Selected.length >= QR6_CORRECT.length) return;
    setQr6Selected((prev) => [...prev, part]);
  }

  function handleQr6RemoveLast() {
    setQr6Selected((prev) => prev.slice(0, -1));
  }

  async function handleSubmit() {
    setError('');

    try {
      if (code === 'QR1') {
        await completeTask();
        return;
      }

      if (code === 'QR2') {
        const cleanAnswer = answer.trim();
        if (!cleanAnswer) {
          setError('Ievadi atrasto slepeno kodu.');
          return;
        }

        if (!qr2Digit) {
          setError('Nav pieejams QR2 cipars.');
          return;
        }

        if (!cleanAnswer.startsWith(qr2Digit)) {
          setError(`Kods nesākas ar ${qr2Digit}.`);
          return;
        }

        const validateRes = await fetch('/api/start/validate-secret-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: getLocalPlayer().playerId,
            secretCode: cleanAnswer,
            startsWith: qr2Digit,
          }),
        });

        const validateData = await validateRes.json();
        if (!validateRes.ok || validateData.error) {
          throw new Error(validateData.error || 'Kods nav pareizs.');
        }

        await completeTask({ answerText: cleanAnswer });
        return;
      }

      if (code === 'QR3') {
        if (answer.trim().toLowerCase() !== 'bleiks') {
          setError('Nav pareizā atbilde.');
          return;
        }
        await completeTask({ answerText: answer.trim() });
        return;
      }

      if (code === 'QR4') {
        if (answer.trim() !== '3') {
          setError('Pareizā atbilde nav ievadīta.');
          return;
        }
        await completeTask({ answerText: answer.trim() });
        return;
      }

      if (code === 'QR5') {
        const options = [5, 10, 20, 35];
        const bonus = options[Math.floor(Math.random() * options.length)];
        await completeTask({ bonusSeconds: bonus });
        return;
      }

      if (code === 'QR6') {
        if (qr6Selected.length !== QR6_CORRECT.length) {
          setError('Saliec visas daļas pareizā secībā.');
          return;
        }

        const isCorrect = qr6Selected.every((part, index) => part === QR6_CORRECT[index]);

        if (!isCorrect) {
          setError('Secība nav pareiza.');
          return;
        }

        const finalText = 'Babuļai dzimšanas diena!';
        await completeTask({ answerText: finalText });
        return;
      }

      setError('Neatbalstīts uzdevums.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kļūda.');
    }
  }

  if (!validTask) {
    return (
      <main className="page">
        <div className="container">
          <div className="card">Neatpazīts QR kods.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container stack">
        <Link href="/game" className="btn btn-secondary">
          Atpakaļ
        </Link>

        <div className="card taskCard">
          <div>
            <div className="muted">{code}</div>
            <h1 className="title" style={{ marginBottom: 12 }}>
              {title}
            </h1>
            {loading ? <div className="notice">Ielādē...</div> : null}
            {!loading && alreadyDone ? (
              <div className="notice">Šis jau ir izpildīts.</div>
            ) : null}
            {!loading && !alreadyDone && code !== 'QR5' ? (
              <div className="timer">{formatElapsed(elapsed)}</div>
            ) : null}
          </div>

          {!loading && !alreadyDone ? (
            <>
              {code === 'QR1' ? (
                <>
                  <div className="notice">
                    Atrodi, samīļo Babuļu un pasaki viņai: “Tu esi Karaliene!”
                  </div>
                  <button className="btn" disabled={buttonLocked} onClick={handleSubmit}>
                    {buttonLocked ? 'Babuļa smaida pēc 10 sek...' : 'Babuļa smaida'}
                  </button>
                </>
              ) : null}

              {code === 'QR2' ? (
                <>
                  <div className="notice">
                    Atrodi cilvēku, kura slepenais kods sākas ar: <strong>{qr2Digit || '...'}</strong>
                  </div>
                  <input
                    className="input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Ievadi atrasto 5 ciparu kodu"
                  />
                  <button className="btn" onClick={handleSubmit}>
                    Pārbaudīt kodu
                  </button>
                </>
              ) : null}

              {code === 'QR3' ? (
                <>
                  <div className="notice">
                    Atmini mīklu: Kas ir paklausīgs, sver 60kg un mīl bebrus?
                  </div>
                  <input
                    className="input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Ievadi atbildi"
                  />
                  <button className="btn" onClick={handleSubmit}>
                    Pārbaudīt atbildi
                  </button>
                </>
              ) : null}

              {code === 'QR4' ? (
                <>
                  <div className="notice">Cik galdi ir lapenē?</div>
                  <input
                    className="input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Ievadi skaitu"
                  />
                  <button className="btn" onClick={handleSubmit}>
                    Pārbaudīt atbildi
                  </button>
                </>
              ) : null}

              {code === 'QR5' ? (
                <>
                  <div className="notice">Padzeries, tu izskaties izslāpis.</div>
                  <button className="btn" onClick={handleSubmit}>
                    Spin the wheel
                  </button>
                </>
              ) : null}

              {code === 'QR6' ? (
                <>
                  <div className="notice">
                    Atrisini teikumu: <strong>dzi Bab m as die ! uļai šan na</strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                      padding: 14,
                      borderRadius: 18,
                      background: 'rgba(255,255,255,0.04)',
                      minHeight: 70,
                    }}
                  >
                    {QR6_CORRECT.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {}}
                        style={{
                          minWidth: 68,
                          minHeight: 48,
                          borderRadius: 14,
                          border: '1px solid rgba(255,255,255,0.09)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'white',
                          fontSize: 18,
                          fontWeight: 700,
                          padding: '8px 12px',
                          cursor: 'default',
                        }}
                      >
                        {qr6Selected[index] || '—'}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    {qr6AvailableParts.map((part, index) => (
                      <button
                        key={`${part}-${index}`}
                        type="button"
                        onClick={() => handleQr6Pick(part)}
                        className="btn btn-secondary"
                        style={{ minWidth: 70 }}
                      >
                        {part}
                      </button>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleQr6RemoveLast}
                    >
                      Dzēst pēdējo
                    </button>

                    <button className="btn" onClick={handleSubmit}>
                      Pārbaudīt teikumu
                    </button>
                  </div>
                </>
              ) : null}

              {error ? <div className="notice">{error}</div> : null}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}