# NeighborShield AI

NeighborShield AI is an accessible web app that helps people inspect suspicious emails, texts, direct messages, and screenshots. This MVP was created for the 2026 OUPI Cyber Clinic Contest.

## What works now

- Drag-and-drop screenshot/photo upload with file type and size checks
- Paste-message analysis
- Transparent mock risk scoring based on common scam signals
- Low, medium, and high risk results with reasons and recommended actions
- Responsive, keyboard-friendly interface with plain-language guidance
- FastAPI documentation at `http://localhost:8000/docs`
- Automatic browser-based demo scoring when the hosted preview cannot reach FastAPI

Screenshot uploads currently return a clearly labeled demo assessment. The hosted preview uses matching browser-side demo rules so it remains interactive without a separately hosted API. The extension point for OCR or a multimodal model is `backend/app/scoring.py`.

## Project structure

```text
neighborshield/
├── app/                  # React interface (Vite/Vinext)
├── backend/
│   ├── app/              # FastAPI route, schema, and scoring pipeline
│   ├── tests/
│   └── requirements.txt
├── public/
├── .env.example
├── package.json
└── vite.config.ts
```

## Local setup

Prerequisites: Node.js 22+, pnpm, and Python 3.11+.

### 1. Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start the frontend

In a second terminal:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open the local address printed by the frontend. The app expects the API at `http://localhost:8000` by default.

## Run checks

```bash
pnpm lint
pnpm build
cd backend && pytest
```

## Connecting OCR and AI next

Keep the API response shape unchanged so the interface does not need to be rewritten:

1. Extract visible text and QR destinations from screenshots.
2. Pass extracted text through deterministic URL and scam-pattern checks.
3. Ask a multimodal model for classification and plain-language explanation.
4. Combine signals into a calibrated score and return the existing `AnalysisResponse` model.
5. Add redaction, rate limits, retention controls, and adversarial tests before production use.

Never send screenshots to a third-party model without clearly telling users how their data is handled.

## Important limitation

NeighborShield provides educational guidance, not a guarantee that a message is safe. Users should verify unexpected requests through an independently found official channel.

## License

Add an open-source license before publishing the repository publicly. MIT is a common choice for contest projects.
