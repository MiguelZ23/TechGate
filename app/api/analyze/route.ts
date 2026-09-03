const BACKEND_URL = process.env.TECHGATE_BACKEND_URL ?? 'https://techgate-api.onrender.com';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return Response.json(
      { detail: 'The analysis service could not be reached. Please try again shortly.' },
      { status: 502 },
    );
  }
}
