// Resposta.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ExercicioEditavel from './ExercicioEditavel';

// Interfaces para tipagem dos dados (certifique-se de que correspondem ao seu backend)
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
  tema?: string;     // Tornando opcional
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

export default function Resposta({ resposta, isLoading, onGerarOutra }: RespostaProps) {
  const [listaExercicios, setListaExercicios] = useState<Exercicio[]>([]);
  const [gabaritoLocal, setGabaritoLocal] = useState<Gabarito>({});
  const [tituloLocal, setTituloLocal] = useState<string>('');
  const [materiaLocal, setMateriaLocal] = useState<string>('');
  const [temaLocal, setTemaLocal] = useState<string>('');
  const [quantidadeLocal, setQuantidadeLocal] = useState<number | string>(0);


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

  // Função para atualizar um exercício na lista
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

  // Função para remover um exercício da lista
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

  // Renderização de estado de carregamento
  if (isLoading) {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center max-w-xl mx-auto">
        <p className="text-xl text-sky-600 font-semibold animate-pulse">Gerando sua lista de exercícios...</p>
        <p className="text-gray-500 text-sm mt-2">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  // Se a resposta for nula ou uma string (erro/validação)
  if (!resposta || typeof resposta === 'string') {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto text-red-600 font-semibold">
        {resposta || 'Nenhuma lista para exibir. Por favor, preencha o formulário acima.'}
      </div>
    );
  }

  // Se for um alerta
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

  // Renderização da lista de exercícios principal
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

      <div className="mt-6 text-center">
        <button
          onClick={onGerarOutra}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          Gerar Outra Lista
        </button>
      </div>
    </div>
  );
}