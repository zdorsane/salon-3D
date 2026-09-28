/** Réponses HTTP des edge functions (JSON + CORS pour l'appel depuis le navigateur). */

export const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * Enveloppe commune : pré-vol CORS, POST obligatoire, corps JSON ; `handle` reçoit le corps
 * déjà décodé et renvoie { statut, corps }. Toute exception devient une erreur 500 générique.
 */
export async function handleJsonPost(
  request: Request,
  handle: (body: unknown) => Promise<{ status: number; body: unknown }>,
): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (request.method !== 'POST') return json(405, { error: 'method' });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid' });
  }
  try {
    const result = await handle(body);
    return json(result.status, result.body);
  } catch (error) {
    console.error(error);
    return json(500, { error: 'server' });
  }
}
