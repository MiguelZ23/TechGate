'use client';

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';
type AnalysisResult = { risk_level: RiskLevel; score: number; summary: string; reasons: string[]; actions: string[]; pipeline_version?: string };
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
      if (window.location.hostname.endsWith('chatgpt.site') && API_URL.includes('localhost')) {
        setResult(analyzeInBrowser(mode === 'paste' ? message : '', file?.name));
        return;
      }
      const formData = new FormData();
      formData.append('input_type', mode === 'upload' ? 'image' : 'text');
      if (file && mode === 'upload') formData.append('image', file);
      if (mode === 'paste') formData.append('message', message.trim());
      const response = await fetch(`${API_URL}/api/analyze`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Analysis service unavailable');
      setResult(await response.json());
    } catch { setResult(analyzeInBrowser(mode === 'paste' ? message : '', file?.name)); }
    finally { setIsLoading(false); }
  };
  const reset = () => { setFile(null); setMessage(''); setResult(null); setError(''); if (fileInput.current) fileInput.current.value = ''; };
  const switchMode = (next: 'upload' | 'paste') => { setMode(next); setResult(null); setError(''); };

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="TechGate home"><span className="brand-mark" aria-hidden="true">T</span><span>Tech<b>Gate</b></span></a>
      <span className="contest-pill">Built for the OUPI Cyber Clinic Contest</span>
    </header>
    <section className="hero" id="top">
      <div className="eyebrow"><span aria-hidden="true">●</span> AI-powered protection against digital scams</div>
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
      <article><span>02</span><div className="step-icon" aria-hidden="true">⌕</div><h3>We check the warning signs</h3><p>TechGate looks for urgency, impersonation, risky links, and requests for sensitive information.</p></article>
      <article><span>03</span><div className="step-icon" aria-hidden="true">✓</div><h3>Know what to do next</h3><p>Get a clear risk level, simple reasons, and practical steps to protect yourself.</p></article>
    </div></section>
    <aside className="safety-reminder"><div aria-hidden="true">♡</div><p><strong>When in doubt, pause.</strong><br />A real organization won’t pressure you to share passwords, verification codes, or payment details.</p></aside>
    <footer><div className="brand"><span className="brand-mark" aria-hidden="true">T</span><span>Tech<b>Gate</b></span></div><p>AI-powered protection against digital scams.</p><p className="disclaimer">This tool offers guidance, not a guarantee. For urgent concerns, contact the organization through an official channel.</p></footer>
  </main>;
}

function Results({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const label = { low: 'Low risk', medium: 'Caution advised', high: 'High risk' }[result.risk_level];
  return <section className={`results ${result.risk_level}`} aria-live="polite" aria-labelledby="result-title"><div className="result-top"><div className="risk-symbol" aria-hidden="true">{result.risk_level === 'high' ? '!' : result.risk_level === 'medium' ? '?' : '✓'}</div><div><p className="result-kicker">TechGate assessment</p><h2 id="result-title">{label}</h2><p>{result.summary}</p></div><div className="score"><strong>{result.score}</strong><span>/100 risk</span></div></div>{result.pipeline_version?.startsWith('browser') && <p className="demo-note"><strong>Demo analysis:</strong> This preview uses transparent warning-sign rules. It does not yet use OCR or an AI model.</p>}<div className="result-grid"><div><h3>What stood out</h3><ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div><div><h3>What to do next</h3><ol>{result.actions.map((action) => <li key={action}>{action}</li>)}</ol></div></div><button className="reset-button" onClick={onReset}>Check another message</button></section>;
}

function analyzeInBrowser(text: string, filename?: string): AnalysisResult {
  if (!text) return { risk_level: 'medium', score: 45, pipeline_version: 'browser-mock-v1', summary: 'The screenshot was received, but text extraction is still in demo mode.', reasons: ['The current MVP has not read the text inside this image yet.', `The uploaded file (${filename ?? 'image'}) is ready for a future OCR and vision-analysis step.`], actions: ['Do not click links or share sensitive information until the message is verified.', 'Paste the visible message text for a more specific demo result.', 'Contact the claimed sender through an official channel if the request is urgent.'] };
  const normalized = text.toLowerCase();
  const signals = [
    { terms: ['urgent', 'immediately', 'act now', 'today', 'final notice'], points: 18, reason: 'The message uses urgency or pressure to make you act quickly.' },
    { terms: ['password', 'verification code', 'security code', 'social security', 'ssn'], points: 30, reason: 'It asks for private account or identity information.' },
    { terms: ['gift card', 'crypto', 'bitcoin', 'wire transfer', 'payment'], points: 28, reason: 'It mentions a payment method commonly used in scams.' },
    { terms: ['click here', 'click the link', 'verify your account', 'sign in', 'log in'], points: 22, reason: 'It directs you to follow a link or sign in to an account.' },
    { terms: ['account will be locked', 'account will be closed', 'account will be disabled', 'account will be suspended', 'unusual activity'], points: 22, reason: 'It threatens an account or service consequence.' },
    { terms: ["you've won", 'you have won', 'winner', 'claim your prize', 'refund'], points: 20, reason: 'It offers an unexpected prize, reward, or refund.' },
  ];
  let score = 5;
  const reasons: string[] = [];
  signals.forEach((signal) => { if (signal.terms.some((term) => normalized.includes(term))) { score += signal.points; reasons.push(signal.reason); } });
  if (/(https?:\/\/|www\.)\S+/i.test(text)) { score += 12; reasons.push('The message includes a link; its destination should be verified independently.'); }
  if (/\b(bit\.ly|tinyurl\.com|t\.co|rb\.gy|is\.gd)\//i.test(text)) { score += 18; reasons.push('The link uses a shortened address that hides its true destination.'); }
  if ((text.match(/!/g) ?? []).length >= 2 || text.trim() === text.trim().toUpperCase()) { score += 8; reasons.push('The formatting adds pressure or alarm.'); }
  score = Math.min(score, 100);
  const common = { pipeline_version: 'browser-mock-v1', score, reasons: reasons.length ? reasons.slice(0, 4) : ['No strong urgency, payment, credential, or suspicious-link language was detected.'] };
  if (score >= 60) return { ...common, risk_level: 'high', summary: 'This message shows several common scam or phishing warning signs. Do not interact with it yet.', actions: ['Do not click links, scan QR codes, reply, or send money.', 'Contact the organization using a phone number or website you find independently.', 'Block or report the sender after confirming the message is fraudulent.'] };
  if (score >= 30) return { ...common, risk_level: 'medium', summary: 'Some details deserve a closer look before you trust or respond to this message.', actions: ['Pause before clicking links or sharing information.', 'Open the organization’s official app or website yourself to check the claim.', 'Ask a trusted person or the organization’s official support team if you are unsure.'] };
  return { ...common, risk_level: 'low', summary: 'We found few common warning signs, but you should still verify unexpected requests.', actions: ['Confirm the sender if the request was unexpected.', 'Use an official app or saved website instead of links in the message.', 'Never share passwords or one-time verification codes.'] };
}
