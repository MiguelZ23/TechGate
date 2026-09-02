'use client';

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';
type AnalysisResult = { risk_level: RiskLevel; score: number; summary: string; reasons: string[]; actions: string[] };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function Home() {
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const selectFile = (nextFile?: File) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) return setError('Please choose an image file, such as a screenshot or photo.');
    if (nextFile.size > 10 * 1024 * 1024) return setError('That image is larger than 10 MB. Please choose a smaller image.');
    setFile(nextFile); setError(''); setResult(null);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); };
  const analyze = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'upload' && !file) return setError('Add a screenshot or photo first.');
    if (mode === 'paste' && !message.trim()) return setError('Paste the message you want to check first.');
    setIsLoading(true); setError(''); setResult(null);
    try {
      const formData = new FormData();
      formData.append('input_type', mode === 'upload' ? 'image' : 'text');
      if (file && mode === 'upload') formData.append('image', file);
      if (mode === 'paste') formData.append('message', message.trim());
      const response = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis service unavailable');
      setResult(await response.json());
    } catch { setError('We could not check this right now. Make sure the backend is running, then try again.'); }
    finally { setIsLoading(false); }
  };
  const reset = () => { setFile(null); setMessage(''); setResult(null); setError(''); if (fileInput.current) fileInput.current.value = ''; };
  const switchMode = (next: 'upload' | 'paste') => { setMode(next); setResult(null); setError(''); };

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="NeighborShield AI home"><span className="brand-mark" aria-hidden="true">N</span><span>NeighborShield <b>AI</b></span></a>
      <span className="contest-pill">Built for the OUPI Cyber Clinic Contest</span>
    </header>
    <section className="hero" id="top">
      <div className="eyebrow"><span aria-hidden="true">●</span> Your calm second opinion online</div>
      <h1>Not sure if a message<br />is <em>safe?</em></h1>
      <p className="hero-copy">Share a screenshot or paste the message. We’ll point out warning signs and explain what to do next—in plain language.</p>
    </section>
    <section className="checker" aria-labelledby="checker-title">
      <h2 className="sr-only" id="checker-title">Check a message</h2>
      <div className="tabs" role="tablist" aria-label="Choose how to share the message">
        <button className={mode === 'upload' ? 'tab active' : 'tab'} role="tab" aria-selected={mode === 'upload'} onClick={() => switchMode('upload')}><span aria-hidden="true">▣</span> Upload screenshot</button>
        <button className={mode === 'paste' ? 'tab active' : 'tab'} role="tab" aria-selected={mode === 'paste'} onClick={() => switchMode('paste')}><span aria-hidden="true">≡</span> Paste message</button>
      </div>
      <form onSubmit={analyze}>
        {mode === 'upload' ? <div className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop}>
          <input ref={fileInput} className="sr-only" id="screenshot" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => selectFile(e.target.files?.[0])} />
          <div className="upload-icon" aria-hidden="true">↑</div>
          {file ? <><h3>{file.name}</h3><p>{(file.size / 1024 / 1024).toFixed(1)} MB · Ready to check</p><button className="link-button" type="button" onClick={() => fileInput.current?.click()}>Choose a different image</button></> : <><h3>Drop your screenshot here</h3><p>or choose a photo from your device</p><button className="secondary-button" type="button" onClick={() => fileInput.current?.click()}>Choose an image</button><small>PNG, JPG, or WebP · up to 10 MB</small></>}
        </div> : <div className="paste-area"><label htmlFor="message">Paste the email, text, or direct message below</label><textarea id="message" value={message} onChange={(e) => { setMessage(e.target.value); setResult(null); }} placeholder="Example: Your account will be locked today. Verify your password at..." maxLength={5000} /><span className="counter">{message.length} / 5,000</span></div>}
        {error && <div className="error" role="alert"><span aria-hidden="true">!</span>{error}</div>}
        <button className="analyze-button" type="submit" disabled={isLoading}>{isLoading ? <><span className="spinner" aria-hidden="true" /> Checking for warning signs…</> : <><span aria-hidden="true">✦</span> Check if it’s safe</>}</button>
        <p className="privacy-note"><span aria-hidden="true">◇</span> Your submission is only used for this check and is not saved.</p>
      </form>
    </section>
    {result && <Results result={result} onReset={reset} />}
    <section className="how-it-works" aria-labelledby="how-title"><p className="section-kicker">Simple by design</p><h2 id="how-title">A safer next step in seconds</h2><div className="steps">
      <article><span>01</span><div className="step-icon" aria-hidden="true">▤</div><h3>Share what you received</h3><p>Upload a screenshot or paste the message—no cybersecurity knowledge needed.</p></article>
      <article><span>02</span><div className="step-icon" aria-hidden="true">⌕</div><h3>We check the warning signs</h3><p>NeighborShield looks for urgency, impersonation, risky links, and requests for sensitive information.</p></article>
      <article><span>03</span><div className="step-icon" aria-hidden="true">✓</div><h3>Know what to do next</h3><p>Get a clear risk level, simple reasons, and practical steps to protect yourself.</p></article>
    </div></section>
    <aside className="safety-reminder"><div aria-hidden="true">♡</div><p><strong>When in doubt, pause.</strong><br />A real organization won’t pressure you to share passwords, verification codes, or payment details.</p></aside>
    <footer><div className="brand"><span className="brand-mark" aria-hidden="true">N</span><span>NeighborShield <b>AI</b></span></div><p>Helping our community feel safer online.</p><p className="disclaimer">This tool offers guidance, not a guarantee. For urgent concerns, contact the organization through an official channel.</p></footer>
  </main>;
}

function Results({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const label = { low: 'Low risk', medium: 'Caution advised', high: 'High risk' }[result.risk_level];
  return <section className={`results ${result.risk_level}`} aria-live="polite" aria-labelledby="result-title"><div className="result-top"><div className="risk-symbol" aria-hidden="true">{result.risk_level === 'high' ? '!' : result.risk_level === 'medium' ? '?' : '✓'}</div><div><p className="result-kicker">NeighborShield assessment</p><h2 id="result-title">{label}</h2><p>{result.summary}</p></div><div className="score"><strong>{result.score}</strong><span>/100 risk</span></div></div><div className="result-grid"><div><h3>What stood out</h3><ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div><div><h3>What to do next</h3><ol>{result.actions.map((action) => <li key={action}>{action}</li>)}</ol></div></div><button className="reset-button" onClick={onReset}>Check another message</button></section>;
}
