'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { setLocalPlayer } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Ievadi savu vārdu.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Neizdevās uzsākt spēli.');

      setLocalPlayer(data.player.id, data.player.name);
      router.push('/game');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kļūda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="card stack">
          <div>
            <h1 className="title">Dzimšanas dienas QR spēle</h1>
            <p className="subtitle">
              Ievadi savu vārdu, saņem slepeno kodu un dodies meklēt QR uzdevumus.
            </p>
          </div>

          <form className="stack" onSubmit={handleStart}>
            <div>
              <label className="label" htmlFor="name">Vārds</label>
              <input
                id="name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Piemēram, Anna"
                maxLength={40}
              />
            </div>
            {error ? <div className="notice">{error}</div> : null}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Veido spēlētāju...' : 'Sākt spēli'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}