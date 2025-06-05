// src/app/api/gerar-google-form/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Exercicio, Alternativa } from '../../components/Resposta';


/**
 * Método GET: Inicia o fluxo de autenticação do Google para obter a URL de autorização.
 * Chamado pelo frontend quando o usuário clica em "Gerar Google Forms" e ainda não tem token.
 */
export async function GET(request: Request) {
  // Inicialize o OAuth2Client AQUI DENTRO da função GET
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

  // Adicione verificações de existência (opcional, mas boa prática)
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing Google API credentials for GET /api/gerar-google-form.');
    return NextResponse.json({ error: 'Server configuration error: Missing Google API credentials.' }, { status: 500 });
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Você precisará armazenar um "state" para evitar ataques CSRF
  // e verificar esse state no callback de redirecionamento.
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // Em uma aplicação real, armazene 'state' na sessão do usuário ou cookies para validação.

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Para obter um refresh_token (necessário para renovar access_token)
    scope: [
      'https://www.googleapis.com/auth/forms.body', // Permissão para criar e editar formulários
      'https://www.googleapis.com/auth/forms.responses.readonly', // Opcional: para ler respostas
      'https://www.googleapis.com/auth/drive.file' // Permissão para criar arquivos no Google Drive do usuário
    ],
    state: state,
    prompt: 'consent', // Garante que o usuário sempre veja a tela de consentimento para novos scopes
  });

  // Retorna a URL de autenticação do Google para o frontend.
  // O frontend irá redirecionar o navegador do usuário para esta URL.
  return NextResponse.json({ authUrl });
}

/**
 * Método POST: Cria o formulário no Google Forms usando o token de acesso.
 * Chamado pelo frontend APÓS a autenticação bem-sucedida e com o accessToken.
 */
export async function POST(request: Request) {
  try {
    const { exercicios, titulo, materia, tema, accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token não fornecido.' }, { status: 401 });
    }

    if (!exercicios || !Array.isArray(exercicios) || !titulo) {
      return NextResponse.json({ error: 'Dados da prova incompletos.' }, { status: 400 });
    }

    // Inicialize o OAuth2Client AQUI DENTRO da função POST também
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      console.error('Missing Google API credentials for POST /api/gerar-google-form.');
      return NextResponse.json({ error: 'Server configuration error: Missing Google API credentials.' }, { status: 500 });
    }

    const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    
    // Define o access token no cliente OAuth para fazer as chamadas da API
    oauth2Client.setCredentials({ access_token: accessToken });

    const forms = google.forms({ version: 'v1', auth: oauth2Client });

    // 1. Cria o formulário inicial no Google Forms
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

    // 2. Constrói as requisições em lote para adicionar as questões
    const requests: any[] = [];

    exercicios.forEach((exercicio: Exercicio, index: number) => {
      const choices = exercicio.alternativas.map((alt: Alternativa) => ({
        value: `${alt.letra.toUpperCase()}) ${alt.texto}`,
      }));

      const correctAnswers = exercicio.respostaCorreta ? {
        answers: [{ value: `${exercicio.respostaCorreta.toUpperCase()}) ${exercicio.alternativas.find(a => a.letra === exercicio.respostaCorreta)?.texto || ''}` }]
      } : undefined;

      requests.push({
        createItem: {
          item: {
            title: `Questão ${index + 1}: ${exercicio.enunciado}`,
            questionItem: {
              question: {
                choiceQuestion: {
                  type: 'RADIO',
                  options: choices,
                  shuffleOptions: false,
                },
                grading: correctAnswers ? {
                    pointValue: 1,
                    correctAnswers: correctAnswers,
                    feedback: {
                        correct: { text: "Resposta correta!" },
                        incorrect: { text: "Resposta incorreta. Revise o conteúdo." }
                    }
                } : undefined,
                required: true,
              },
            },
          },
          location: {
            index: index, // Onde inserir a questão (começa do índice 0 após o título/descrição)
          },
        },
      });
    });

    // 3. Atualiza o formulário recém-criado com todas as questões
    await forms.forms.batchUpdate({
      formId: formId,
      requestBody: {
        requests: requests,
      },
    });

    const finalFormUrl = `https://docs.google.com/forms/d/${formId}/edit`; // URL para editar o formulário
    const viewFormUrl = `https://docs.google.com/forms/d/${formId}/view`; // URL para visualizar o formulário (para alunos)

    return NextResponse.json({ success: true, formUrl: finalFormUrl, viewUrl: viewFormUrl, formId: formId });

  } catch (error: any) {
    console.error('Erro ao gerar formulário do Google Forms:', error.message || error);
    if (error.code === 401 || error.code === 403) {
        return NextResponse.json({ error: 'Erro de autenticação com o Google Forms API. Verifique as credenciais ou permissões.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erro ao gerar formulário do Google Forms.' }, { status: 500 });
  }
}