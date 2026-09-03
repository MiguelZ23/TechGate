# TechGate — AI-powered protection against digital scams

TechGate is an accessible web app that helps people inspect suspicious emails, texts, direct messages, and screenshots. This MVP was created for the 2026 OUPI Cyber Clinic Contest.

## What works now

- Drag-and-drop screenshot/photo upload with file type and size checks
- Paste-message analysis
- AI screenshot analysis through the OpenAI Responses API when a key is configured
- Transparent mock risk scoring when the AI service is not configured
- Low, medium, and high risk results with reasons and recommended actions
- Responsive, keyboard-friendly interface with plain-language guidance
- FastAPI documentation at `http://localhost:8000/docs`
- Automatic browser-based demo scoring when the hosted preview cannot reach FastAPI

Screenshot uploads are analyzed by a vision-capable OpenAI model when the FastAPI backend has an API key. The hosted preview uses matching browser-side demo rules until a separately hosted API is connected.

## Project structure

```text
techgate/
├── app/                  # React interface (Vite/Vinext)
├── backend/
│   ├── app/              # FastAPI route, schema, and scoring pipeline
│   ├── tests/
│   ├── .env.example      # Safe template for backend secrets
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
cp .env.example .env
# Open .env and paste your key after OPENAI_API_KEY=
uvicorn app.main:app --reload --port 8000
```

Keep `backend/.env` private. It is ignored by Git and must never be uploaded to GitHub, pasted into frontend code, or shared in screenshots.

### 2. Start the frontend

In a second terminal:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Open the local address printed by the frontend. The example configuration connects to the deployed TechGate API. Change `NEXT_PUBLIC_API_URL` to `http://localhost:8000` in `.env.local` when you want to use a local backend instead.

## Run checks

```bash
pnpm lint
pnpm build
cd backend && pytest
```

## Deploy the backend on Render

The included `render.yaml` can create the FastAPI service on Render's Free plan:

1. In Render, choose **New > Blueprint** and connect `MiguelZ23/TechGate`.
2. Render will detect `render.yaml` and create `techgate-api`.
3. When prompted for `OPENAI_API_KEY`, paste it as a secret environment variable.
4. After deployment, copy the service's `https://...onrender.com` URL.

Free Render services can sleep after inactivity, so the first contest demo request might take about a minute. Open the `/health` URL shortly before presenting to wake it up.

The backend includes `.python-version` to keep Render on the tested Python 3.12 runtime.

## Analysis pipeline

Keep the API response shape unchanged so the interface does not need to be rewritten:

1. The browser sends an image to FastAPI.
2. FastAPI validates the type and 10 MB size limit and keeps the key server-side.
3. The image is sent to the OpenAI Responses API with Structured Outputs.
4. TechGate returns a risk level, reasons, and recommended actions in plain language.
5. If no key is configured, the clearly labeled demo pipeline remains available.

Before public production use, add rate limits, abuse controls, a privacy policy, redaction options, and adversarial tests.

Never send screenshots to a third-party model without clearly telling users how their data is handled.

## Important limitation

TechGate provides educational guidance, not a guarantee that a message is safe. Users should verify unexpected requests through an independently found official channel.

## License

This project is available under the MIT License in `LICENSE`.
