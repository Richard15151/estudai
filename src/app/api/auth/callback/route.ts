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

  // const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

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
        // --- Troca de token manual (alternativa se oauth2Client.getToken() causar problemas) ---
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Error getting tokens from Google (manual fetch):', errorData);
      return NextResponse.json({ error: 'Failed to authenticate with Google.', details: errorData }, { status: tokenResponse.status });
    }

    const tokens = await tokenResponse.json();
    // --------------------------------------------------------------------------------------

    // Você ainda pode instanciar o OAuth2Client para usar o token de acesso nas APIs do Google
    // mas não para a troca inicial do código
    const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials(tokens);

    // O refresh_token só vem na primeira vez. Armazene-o!
    if (tokens.refresh_token) {
        // ATENÇÃO: Em produção, armazene isso de forma segura (banco de dados, etc.)
        // Para testes, você pode usar um arquivo temporário no backend
        // Ou, se você quer que o frontend o receba, considere cuidadosamente a segurança.
        console.log("Refresh Token recebido e precisa ser armazenado:", tokens.refresh_token);
        // Exemplo de como você poderia persistir o refresh token no backend (fora desta rota GET)
        // Por exemplo, em um banco de dados associado a um usuário.
        // Ou, para fins de depuração:
        // import fs from 'fs/promises';
        // await fs.writeFile('/tmp/refresh_token.txt', tokens.refresh_token);
    }


    const redirectBackUrl = new URL(url.origin);
    redirectBackUrl.searchParams.set('accessToken', tokens.access_token || '');

    return NextResponse.redirect(redirectBackUrl);
    
  } catch (error: any) {
  console.error('Error getting tokens from Google:', error.response?.data || error.message || error);
  return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}