// src/app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

/**
 * Método GET: Lida com o redirecionamento do Google após o consentimento do usuário.
 * Troca o código de autorização por tokens de acesso e refresh.
 */
export async function GET(request: Request) {
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

  // Adicione verificações de existência (opcional, mas boa prática)
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing Google API credentials for GET /api/auth/callback.');
    return NextResponse.json({ error: 'Server configuration error: Missing Google API credentials.' }, { status: 500 });
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Em produção, você deve verificar este 'state' para segurança

  console.log("--- Callback Request Details ---");
  console.log("Full Request URL:", request.url);
  console.log("Code received in URL:", code ? code.substring(0, 10) + '...' : 'None');
  console.log("State received in URL:", state);

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not found in callback.' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const redirectBackUrl = new URL(url.origin);
    redirectBackUrl.searchParams.set('accessToken', tokens.access_token || '');

    // Redireciona o navegador do usuário de volta para a sua aplicação principal
    return NextResponse.redirect(redirectBackUrl);

  } catch (error) {
    console.error('Error getting tokens from Google:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}