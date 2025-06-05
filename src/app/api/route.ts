// src/app/api/gerar-google-form/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Exercicio, Alternativa } from '../../components/Resposta'; // Importe suas interfaces

// Defina estas variáveis de ambiente no seu .env.local
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI; // Ex: 'http://localhost:3000/api/auth/callback'

// Inicializa o cliente OAuth
const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Função para gerar a URL de autorização
export async function GET(request: Request) {
  // Você precisará armazenar um "state" para evitar ataques CSRF
  // e verificar esse state no callback de redirecionamento.
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // Você deve armazenar 'state' e 'redirect_url' na sessão do usuário ou cookies para validação.
  // Para simplificar aqui, vamos apenas gerar a URL.

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Para obter um refresh_token
    scope: [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/forms.responses.readonly',
      'https://www.googleapis.com/auth/drive.file' // Para criar o formulário no Drive
    ],
    state: state,
    prompt: 'consent', // Para garantir que o usuário dê consentimento
  });

  // Retorne a URL para o frontend. O frontend redirecionará o usuário para esta URL.
  return NextResponse.json({ authUrl });
}


// Endpoint para criar o formulário APÓS a autenticação e com o token de acesso
export async function POST(request: Request) {
  try {
    const { exercicios, titulo, materia, tema, accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token não fornecido.' }, { status: 401 });
    }

    if (!exercicios || !Array.isArray(exercicios) || !titulo) {
      return NextResponse.json({ error: 'Dados da prova incompletos.' }, { status: 400 });
    }

    // Define o access token no cliente OAuth
    oauth2Client.setCredentials({ access_token: accessToken });

    const forms = google.forms({ version: 'v1', auth: oauth2Client });

    // Construir o corpo do formulário
    const requests: any[] = [];

    // Adicionar título e descrição
    requests.push({
      updateFormInfo: {
        info: {
          title: titulo,
          description: `Prova gerada automaticamente${materia ? ` de ${materia}` : ''}${tema ? ` sobre ${tema}` : ''}.`
        },
        updateMask: 'title,description',
      },
    });

    exercicios.forEach((exercicio: Exercicio, index: number) => {
      // Mapear alternativas para o formato da API do Forms
      const choices = exercicio.alternativas.map((alt: Alternativa) => ({
        value: `${alt.letra.toUpperCase()}) ${alt.texto}`,
      }));

      // A resposta correta para a questão
      const correctAnswers = exercicio.respostaCorreta ? {
        answers: [{ value: `${exercicio.respostaCorreta.toUpperCase()}) ${exercicio.alternativas.find(a => a.letra === exercicio.respostaCorreta)?.texto || ''}` }]
      } : undefined;

      // Adicionar a questão como múltipla escolha
      requests.push({
        createItem: {
          item: {
            title: `Questão ${index + 1}: ${exercicio.enunciado}`,
            questionItem: {
              question: {
                // Definir como múltipla escolha
                choiceQuestion: {
                  type: 'RADIO', // Ou 'DROP_DOWN'
                  options: choices,
                  shuffleOptions: false, // Pode embaralhar se quiser
                },
                // Definir a resposta correta se existir
                grading: correctAnswers ? {
                    // A pontuação para a questão (ex: 1 ponto)
                    pointValue: 1,
                    correctAnswers: correctAnswers,
                    // Feedback opcional para respostas corretas/incorretas
                    feedback: {
                        correct: {
                            text: "Resposta correta!"
                        },
                        incorrect: {
                            text: "Resposta incorreta. Revise o conteúdo."
                        }
                    }
                } : undefined,
                required: true, // Questão obrigatória
              },
            },
          },
          // Onde inserir a questão (no final do formulário)
          location: {
            index: index + 1, // +1 para pular o título/descrição
          },
        },
      });
    });

    // Criar o formulário inicial
    const createFormResponse = await forms.forms.create({
      requestBody: {
        info: {
          title: titulo,
          description: `Prova gerada automaticamente${materia ? ` de ${materia}` : ''}${tema ? ` sobre ${tema}` : ''}.`
        }
      }
    });

    const formId = createFormResponse.data.formId;

    if (!formId) {
      throw new Error("ID do formulário não foi retornado pela API do Google Forms.");
    }

    // Atualizar o formulário com as questões
    const batchUpdateResponse = await forms.forms.batchUpdate({
      formId: formId,
      requestBody: {
        requests: requests,
      },
    });

    // A URL correta do formulário é forms.google.com/d/FORM_ID/edit
    // ou para visualizar: forms.google.com/d/FORM_ID/view
    const finalFormUrl = `https://docs.google.com/forms/d/${formId}/edit`; // URL de edição
    const viewFormUrl = `https://docs.google.com/forms/d/${formId}/view`; // URL para visualizar

    return NextResponse.json({ success: true, formUrl: finalFormUrl, viewUrl: viewFormUrl, formId: formId });

  } catch (error: any) {
    console.error('Erro ao gerar formulário do Google Forms:', error.message || error);
    if (error.code === 401 || error.code === 403) {
        return NextResponse.json({ error: 'Erro de autenticação com o Google Forms API. Verifique as credenciais ou permissões.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao gerar formulário do Google Forms.' }, { status: 500 });
  }
}

// --- Tratamento do Callback de Autenticação (Obrigatório para fluxo OAuth) ---
// Você precisará de outro endpoint para lidar com o redirecionamento após o consentimento do usuário.
// Ex: src/app/api/auth/callback/route.ts
/*
import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // Verifique este state com o que você armazenou

  if (!code) {
    return NextResponse.json({ error: 'Code not found in callback.' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Agora você tem os tokens (access_token, refresh_token).
    // O access_token é usado para fazer chamadas de API.
    // O refresh_token deve ser armazenado de forma segura no backend
    // e usado para obter novos access_tokens quando o atual expirar.

    // Redirecione o usuário de volta para sua aplicação, talvez passando o access_token
    // via cookie ou um redirecionamento para uma página que possa usá-lo.
    // Para simplificar no desenvolvimento, você pode redirecionar para uma página
    // que capture esse token (CUIDADO EM PROD COM ISSO)
    // Ou, idealmente, você pode armazenar o token na sessão ou em um DB e usar no POST.

    // Exemplo SIMPLES (para teste): redireciona com o token na URL (NÃO RECOMENDADO EM PROD!)
    const redirectBackUrl = new URL(url.origin); // Sua URL principal
    redirectBackUrl.searchParams.set('accessToken', tokens.access_token || '');
    // Se você tiver refresh_token, também deve salvá-lo de forma segura no backend
    // para uso futuro sem precisar pedir consentimento novamente.

    return NextResponse.redirect(redirectBackUrl);

  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Google.' }, { status: 500 });
  }
}
*/