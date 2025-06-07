// Resposta.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ExercicioEditavel from './ExercicioEditavel';

// --- INTERFACES: Ficam fora do componente, mas dentro do arquivo ---
export interface Alternativa {
  letra: string; // Ex: "a", "b", "c", "d"
  texto: string; // Ex: "Alternativa de texto"
}

export interface Exercicio {
  id: string; // Adicionado para manipulação no frontend
  numero?: number;
  enunciado: string;
  alternativas: Alternativa[]; // Alterado para array de Alternativa
  respostaCorreta?: string;
}

export interface Gabarito {
  [key: string]: string; // Ex: "1": "a", "2": "c"
}

export interface DadosLista {
  titulo: string;
  materia?: string; // Tornando opcional
  tema?: string;    // Tornando opcional
  quantidade: number | string;
  exercicios: Exercicio[];
  gabarito: Gabarito;
  mensagemAlerta?: string;
}

export type RespostaAPI = DadosLista | string | null;


interface RespostaProps {
  resposta: RespostaAPI;
  isLoading: boolean;
  onGerarOutra: () => void;
}

// --- COMPONENTE FUNCIONAL ---
export default function Resposta({ resposta, isLoading, onGerarOutra }: RespostaProps) {
  // --- HOOKS DE ESTADO: DEVEM FICAR DENTRO DO COMPONENTE ---
  const [isGeneratingForm, setIsGeneratingForm] = useState<boolean>(false); // Novo estado para controlar a geração do forms
  const [formGeneratedSuccess, setFormGeneratedSuccess] = useState<boolean>(false); // Novo estado para sucesso na geração
  const [listaExercicios, setListaExercicios] = useState<Exercicio[]>([]);
  const [gabaritoLocal, setGabaritoLocal] = useState<Gabarito>({});
  const [tituloLocal, setTituloLocal] = useState<string>('');
  const [materiaLocal, setMateriaLocal] = useState<string>('');
  const [temaLocal, setTemaLocal] = useState<string>('');
  const [quantidadeLocal, setQuantidadeLocal] = useState<number | string>(0);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null); // ESTE ESTADO DEVE FICAR AQUI DENTRO!

  // --- PRIMEIRO useEffect: Para processar a resposta da API principal (gerar lista) ---
  useEffect(() => {
    if (typeof resposta === 'object' && resposta !== null && !isLoading) {
      if (resposta.titulo && resposta.titulo.toUpperCase() !== "ALERTA") {
        // Quando a resposta da API chega, adicionamos IDs únicos aos exercícios
        const exerciciosFormatados: Exercicio[] = resposta.exercicios.map((exApi: any, idx: number) => {
          // As alternativas vêm como array de strings, precisamos transformá-las
          const alternativasFormatadas: Alternativa[] = exApi.alternativas.map((altText: string, altIndex: number) => ({
            letra: ['a', 'b', 'c', 'd', 'e'][altIndex], // Garante letras (a, b, c, d, e)
            texto: altText
          }));

          // Pega a resposta correta do gabarito usando o número do exercício
          const respostaCorretaDoGabarito = resposta.gabarito[(idx + 1).toString()]; // Gabarito é 1-baseado

          return {
            ...exApi, // Copia outras propriedades se existirem
            id: uuidv4(), // Adiciona o ID único
            alternativas: alternativasFormatadas,
            respostaCorreta: respostaCorretaDoGabarito, // Adiciona a resposta correta aqui
          };
        });

        setListaExercicios(exerciciosFormatados);
        setGabaritoLocal(resposta.gabarito);
        setTituloLocal(resposta.titulo);
        setMateriaLocal(resposta.materia || '');
        setTemaLocal(resposta.tema || '');
        setQuantidadeLocal(resposta.quantidade);
      } else {
        setListaExercicios([]);
        setGabaritoLocal({});
        setTituloLocal('');
        setMateriaLocal('');
        setTemaLocal('');
        setQuantidadeLocal(0);
      }
    } else if (resposta === null) {
      setListaExercicios([]);
      setGabaritoLocal({});
      setTituloLocal('');
      setMateriaLocal('');
      setTemaLocal('');
      setQuantidadeLocal(0);
    }
  }, [resposta, isLoading]);

  // --- SEGUNDO useEffect: Dedicado a capturar o accessToken da URL ---
  // Este useEffect roda apenas uma vez na montagem do componente para verificar a URL.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('accessToken');
    if (token) {
      setGoogleAccessToken(token);
      // Limpar o token da URL
      urlParams.delete('accessToken');
      window.history.replaceState({}, document.title, `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`);
    }
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem


   // --- NOVO useEffect: Dispara a geração do Forms quando googleAccessToken está disponível ---
  useEffect(() => { 
    const hasAccessToken = !!googleAccessToken; // Converte para booleano
    const hasExercicios = listaExercicios.length > 0;
    
    console.log('NOVO useEffect - Verificando condições:', {
      hasAccessToken,
      listaExerciciosLength: listaExercicios.length,
      isGeneratingForm,
      formGeneratedSuccess
    });
    // Apenas tente gerar o forms se tiver um token e a lista de exercícios não estiver vazia,
    // e se não estiver *já* gerando o forms e se ainda não tiver sido gerado com sucesso.
    if (hasAccessToken && hasExercicios && !isGeneratingForm && !formGeneratedSuccess) {
      console.log("Access Token disponível E lista de exercícios pronta. Disparando handleGerarGoogleForm automaticamente...");
      const timer = setTimeout(() => {
         handleGerarGoogleForm();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [googleAccessToken, listaExercicios, isGeneratingForm, formGeneratedSuccess]);


  // --- FUNÇÃO PARA ATUALIZAR UM EXERCÍCIO NA LISTA ---
  const handleUpdateExercicio = (id: string, novoExercicio: Exercicio) => {
    setListaExercicios(prevExercicios =>
      prevExercicios.map(ex => (ex.id === id ? novoExercicio : ex))
    );
    // Também atualiza o gabarito se a resposta correta mudou
    setGabaritoLocal(prevGabarito => {
      const novoGabarito = { ...prevGabarito };
      // Encontra o número da questão correspondente ao ID
      const numeroQuestaoIndex = listaExercicios.findIndex(ex => ex.id === id);

      if (numeroQuestaoIndex !== -1 && novoExercicio.respostaCorreta !== undefined) {
        // O número da questão é o índice + 1
        const numeroQuestao = (numeroQuestaoIndex + 1).toString();
        // Garante que a resposta correta seja uma string antes de atribuir
        novoGabarito[numeroQuestao] = novoExercicio.respostaCorreta;
      }
      return novoGabarito;
    });
  };

  // --- FUNÇÃO PARA REMOVER UM EXERCÍCIO DA LISTA ---
  const handleRemoverExercicio = (id: string) => {
    setListaExercicios(prevExercicios => {
      const novosExercicios = prevExercicios.filter(ex => ex.id !== id);

      // Reindexa os números dos exercícios e atualiza o gabarito
      const novoGabarito: Gabarito = {};
      novosExercicios.forEach((ex, index) => {
        const numeroAntigo = prevExercicios.findIndex(originalEx => originalEx.id === ex.id) + 1;
        const respostaOriginal = gabaritoLocal[numeroAntigo.toString()];
        if (respostaOriginal) {
          novoGabarito[(index + 1).toString()] = respostaOriginal;
        }
      });
      setGabaritoLocal(novoGabarito);
      return novosExercicios;
    });
  };

  // --- FUNÇÃO PARA GERAR O GOOGLE FORMS (AJUSTADA PARA USAR NOVOS ESTADOS) ---
  const handleGerarGoogleForm = async () => {
    // 1. Verificar se já temos um token de acesso. Se não, iniciar o fluxo OAuth.
    if (!googleAccessToken) {
      try {
        setIsGeneratingForm(true); // Indica que o processo de autenticação foi iniciado
        const authResponse = await fetch('/api/gerar-google-form'); // Chama a API Route GET
        const data = await authResponse.json();
        if (data.authUrl) {
          // Redireciona o usuário para a URL de autenticação do Google
          window.location.href = data.authUrl;
          return; // Para a execução aqui
        } else {
          throw new Error("Não foi possível obter a URL de autenticação.");
        }
      } catch (error) { 
        console.error("Erro ao iniciar autenticação Google:", error);
        alert("Erro ao iniciar autenticação com o Google. Verifique o console.");
      } finally {
        setIsGeneratingForm(false); // Reseta o estado em caso de erro na autenticação inicial
      }
      return;
    }

    // 2. Se já temos um token (ou após o redirecionamento e captura do token),
    // fazer a requisição POST para criar o formulário.
    try {
      setIsGeneratingForm(true); // Indica que a geração do formulário foi iniciada
      const response = await fetch('/api/gerar-google-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercicios: listaExercicios,
          titulo: tituloLocal,
          materia: materiaLocal,
          tema: temaLocal,
          accessToken: googleAccessToken
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
      }

      const result = await response.json();
      alert(`Formulário Google Forms criado com sucesso! URL de Edição: ${result.formUrl}\nURL para Alunos: ${result.viewUrl}`);
      window.open(result.viewUrl, '_blank'); // Abre o formulário em uma nova aba
      setFormGeneratedSuccess(true); // Marca que o formulário foi gerado com sucesso

    } catch (error: any) {
      console.error("Erro ao gerar formulário do Google Forms:", error.message);
      alert(`Erro ao gerar formulário: ${error.message}. Verifique as permissões ou se o token é válido.`);
    } finally {
      setIsGeneratingForm(false); // Sempre reseta o estado de carregamento
    }
  };


  // --- RENDERIZAÇÃO DE ESTADO DE CARREGAMENTO ---
  if (isLoading || isGeneratingForm) {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center max-w-xl mx-auto">
        <p className="text-xl text-sky-600 font-semibold animate-pulse">
          {isGeneratingForm ? "Criando seu Google Forms..." : "Gerando sua lista de exercícios..."}
        </p>
        <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  // --- SE A RESPOSTA FOR NULA OU UMA STRING (ERRO/VALIDAÇÃO) ---
  if (!resposta || typeof resposta === 'string') {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto text-red-600 font-semibold">
        {resposta || 'Nenhuma lista para exibir. Por favor, preencha o formulário acima.'}
      </div>
    );
  }

  // --- SE FOR UM ALERTA ---
  if (resposta.titulo && resposta.titulo.toUpperCase() === "ALERTA" && resposta.mensagemAlerta) {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">{resposta.titulo.toUpperCase()}</h2>
        <p className="text-orange-700">{resposta.mensagemAlerta}</p>
        <div className="mt-6 text-center">
          <button
            onClick={onGerarOutra}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DA LISTA DE EXERCÍCIOS PRINCIPAL ---
  return (
    <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{tituloLocal}</h2>

      {(materiaLocal || temaLocal) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center text-gray-700 mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
          {materiaLocal && (
            <p className="flex items-center">
              <span className="mr-1">📚</span> <strong>Matéria:</strong> {materiaLocal}
            </p>
          )}
          {temaLocal && (
            <p className="flex items-center">
              <span className="mr-1">🎯</span> <strong>Tema:</strong> {temaLocal}
            </p>
          )}
        </div>
      )}
      {typeof quantidadeLocal !== 'undefined' && (
        <p className="text-gray-700 mb-4"><strong>Quantidade de exercícios:</strong> {String(quantidadeLocal)}</p>
      )}

      {listaExercicios && listaExercicios.length > 0 ? (
        <>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Exercícios:</h3>
          <ul className="list-none text-gray-700 mb-4 space-y-6">
            {listaExercicios.map((exercicio, index) => (
              <ExercicioEditavel
                key={exercicio.id} // Use o ID único como key
                exercicio={exercicio}
                index={index}
                onUpdateExercicio={handleUpdateExercicio}
                onRemoverExercicio={handleRemoverExercicio}
              />
            ))}
          </ul>
        </>
      ) : (
        <p className="text-gray-600">Nenhum exercício gerado ainda.</p>
      )}

      {gabaritoLocal && Object.keys(gabaritoLocal).length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-2 mt-6 text-gray-700">Gabarito:</h3>
          <ol className="list-none text-gray-700 space-y-1 bg-gray-100 p-3 rounded">
            {Object.keys(gabaritoLocal)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((numeroQuestao) => (
                <li key={numeroQuestao} className="py-1">
                  <strong>{numeroQuestao}.</strong> {gabaritoLocal[numeroQuestao]}
                </li>
              ))}
          </ol>
        </>
      )}

      <div className="mt-6 text-center flex justify-center space-x-4"> {/* Adicionei flex e space-x-4 */}
        <button
          onClick={onGerarOutra}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Gerar Outra Lista
        </button>

        {/* Botão Gerar Google Forms */}
        <button
          onClick={handleGerarGoogleForm}
          // Desabilita o botão enquanto estiver gerando
          disabled={isGeneratingForm || formGeneratedSuccess} // Desabilita se já gerou ou está gerando
          className={`font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isGeneratingForm || formGeneratedSuccess
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white'
            }`}
        >
          {isGeneratingForm ? "Gerando Forms..." : "Gerar Google Forms"}
        </button>
      </div>
    </div>
  );
}