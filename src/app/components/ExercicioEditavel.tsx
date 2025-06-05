'use client';

import React, { useEffect, useState } from 'react';
import type { Exercicio, Alternativa } from './Resposta';

interface ExercicioEditavelProps {
  exercicio: Exercicio;
  index: number;
  onUpdateExercicio: (id: string, novoExercicio: Exercicio) => void;
  onRemoverExercicio: (id: string) => void;
}

export default function ExercicioEditavel({
  exercicio,
  index,
  onUpdateExercicio,
  onRemoverExercicio,
}: ExercicioEditavelProps) {
  const [estaEditando, setEstaEditando] = useState(false);
  const [exercicioEditavel, setExercicioEditavel] = useState<Exercicio>(exercicio);

  // --- FUNÇÃO AUXILIAR PARA DETERMINAR A RESPOSTA CORRETA INICIAL ---
  const getInitialCorrectAnswer = (currentExercicio: Exercicio): string => {
    // 1. Tenta usar a respostaCorreta diretamente da prop 'exercicio' se ela existir e for válida
    if (currentExercicio.respostaCorreta) {
      // Verifica se a letra da resposta correta realmente existe entre as alternativas
      const foundAlt = currentExercicio.alternativas.find(
        (alt) => alt.letra === currentExercicio.respostaCorreta
      );
      if (foundAlt) {
        return foundAlt.letra;
      }
    }

    // 2. Se a respostaCorreta não foi encontrada ou não estava definida,
    // tenta usar a letra da primeira alternativa se houver alguma
    if (currentExercicio.alternativas.length > 0) {
      return currentExercicio.alternativas[0].letra;
    }

    // 3. Caso contrário, retorna uma string vazia
    return '';
  };
  // --- FIM DA FUNÇÃO AUXILIAR ---

  // Inicialização do estado de respostaCorretaEditavel usando a função auxiliar
  const [respostaCorretaEditavel, setRespostaCorretaEditavel] = useState<string>(
    () => getInitialCorrectAnswer(exercicio)
  );

  // useEffect para sincronizar o estado interno com a prop 'exercicio' quando ela muda
  useEffect(() => {
    setExercicioEditavel(exercicio);
    // Atualiza o estado de respostaCorretaEditavel usando a função auxiliar
    setRespostaCorretaEditavel(getInitialCorrectAnswer(exercicio));
  }, [exercicio]);


  const handleEnunciadoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExercicioEditavel({ ...exercicioEditavel, enunciado: e.target.value });
  };

  const handleAlternativaChange = (e: React.ChangeEvent<HTMLInputElement>, altIndex: number) => {
    const novasAlternativas = exercicioEditavel.alternativas.map((alt, i) =>
      i === altIndex ? { ...alt, texto: e.target.value } : alt
    );
    setExercicioEditavel({ ...exercicioEditavel, alternativas: novasAlternativas });
  };

  const handleRespostaCorretaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRespostaCorretaEditavel(e.target.value);
  };

  const handleSalvar = () => {
    // Ao salvar, atualize o objeto do exercício com a resposta correta antes de enviar
    const exercicioAtualizado: Exercicio = {
      ...exercicioEditavel,
      respostaCorreta: respostaCorretaEditavel, // Adiciona a resposta correta ao objeto
    };
    onUpdateExercicio(exercicioAtualizado.id, exercicioAtualizado);
    setEstaEditando(false);
  };

  const handleCancelar = () => {
    setEstaEditando(false);
    setExercicioEditavel(exercicio); // Volta para o estado original
    // Recalcula a resposta correta com base no exercicio original ao cancelar
    setRespostaCorretaEditavel(getInitialCorrectAnswer(exercicio));
  };

  const handleRemover = () => {
    onRemoverExercicio(exercicio.id);
  };

  // Se a estrutura da alternativa não tiver a letra, vamos adicionar temporariamente para o select
  const letrasDisponiveis = exercicioEditavel.alternativas.map(alt => alt.letra || '');


  return (
    <li className="mb-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">Questão {index + 1}</h3>
        <div className="flex space-x-2">
          {!estaEditando ? (
            <button
              onClick={() => setEstaEditando(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={handleSalvar}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                Salvar
              </button>
              <button
                onClick={handleCancelar}
                className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
              >
                Cancelar
              </button>
            </>
          )}
          <button
            onClick={handleRemover}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Remover
          </button>
        </div>
      </div>

      {!estaEditando ? (
        <>
          <p className="mb-2 text-gray-900">{exercicio.enunciado}</p>
          {Array.isArray(exercicio.alternativas) && (
            <ul className="list-none ml-4 space-y-1">
              {exercicio.alternativas.map((alt, altIndex) => (
                <li key={altIndex} className="text-gray-800">
                  <span className={alt.letra === exercicio.respostaCorreta ? 'font-bold text-green-700' : ''}>
                    {alt.letra.toUpperCase()}) {alt.texto}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-blue-700">
            Resposta Correta: <span className="font-bold">{exercicio.respostaCorreta?.toUpperCase()}</span>
          </p>
        </>
      ) : (
        <div className="space-y-3">
          <div>
            <label htmlFor={`enunciado-${exercicio.id}`} className="block text-sm font-medium text-gray-700 mb-1">
              Enunciado:
            </label>
            <textarea
              id={`enunciado-${exercicio.id}`}
              value={exercicioEditavel.enunciado}
              onChange={handleEnunciadoChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          {exercicioEditavel.alternativas.map((alt, altIndex) => (
            <div key={altIndex}>
              <label
                htmlFor={`alt-${exercicio.id}-${alt.letra}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Alternativa {alt.letra.toUpperCase()}:
              </label>
              <input
                type="text"
                id={`alt-${exercicio.id}-${alt.letra}`}
                value={alt.texto}
                onChange={(e) => handleAlternativaChange(e, altIndex)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          ))}
          <div>
            <label
              htmlFor={`resposta-correta-${exercicio.id}`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Resposta Correta:
            </label>
            <select
              id={`resposta-correta-${exercicio.id}`}
              value={respostaCorretaEditavel}
              onChange={handleRespostaCorretaChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {letrasDisponiveis.map((letra) => (
                <option key={letra} value={letra}>
                  {letra.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </li>
  );
}