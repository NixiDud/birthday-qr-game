'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft } from 'lucide-react';

const scannerId = 'qr-reader';
const TEST_CODES = ['QR1', 'QR2', 'QR3', 'QR4', 'QR5', 'QR6'] as const;

export default function ScanPage() {
  const [status, setStatus] = useState('Atļauj kameru un noskenē QR kodu. Ja kamera niķojas, izmanto testēšanas pogas zemāk.');
  const [debugMode, setDebugMode] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    async function startScanner() {
      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (isRedirectingRef.current) return;
            isRedirectingRef.current = true;
            setStatus(`Atrasts: ${decodedText}`);

            if (isScanningRef.current) {
              try {
                await scanner.stop();
              } catch {
                // Ignorē stop kļūdas, ja skeneris jau ir apstājies.
              }
              isScanningRef.current = false;
            }

            window.location.href = `/game/task/${encodeURIComponent(decodedText.trim())}`;
          },
          () => {}
        );

        isScanningRef.current = true;
        setStatus('Kamera atvērta. Meklē QR kodu vai izmanto testēšanas pogas zemāk.');
      } catch {
        setStatus('Kameru neizdevās atvērt. Izmanto testēšanas režīmu zemāk.');
        setDebugMode(true);
      }
    }

    startScanner();

    return () => {
      const scanner = scannerRef.current;
      if (scanner && isScanningRef.current) {
        scanner.stop().catch(() => undefined);
        isScanningRef.current = false;
      }
    };
  }, []);

  return (
    <main className="page">
      <div className="container stack">
        <div className="row">
          <Link href="/game" className="btn btn-secondary"><ArrowLeft size={18} /> Atpakaļ</Link>
        </div>

        <div className="card stack center">
          <h1 className="title">Skenē QR kodu</h1>
          <div id={scannerId} style={{ width: '100%', minHeight: 320, borderRadius: 20, overflow: 'hidden' }} />
          <div className="notice">{status}</div>
        </div>

        {debugMode ? (
          <div className="card stack">
            <div style={{ fontWeight: 700 }}>Testēšanas režīms</div>
            <div className="muted">Šīs pogas atver uzdevumus bez kameras. Tās ir domātas lokālai testēšanai datorā.</div>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              {TEST_CODES.map((code) => (
                <Link key={code} className="btn btn-secondary" href={`/game/task/${code}`}>{code}</Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
