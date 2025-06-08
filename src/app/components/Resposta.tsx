"use client";

import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ExercicioEditavel from './ExercicioEditavel';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [listaExercicios, setListaExercicios] = useState<Exercicio[]>([]);
  const [gabaritoLocal, setGabaritoLocal] = useState<Gabarito>({});
  const [tituloLocal, setTituloLocal] = useState<string>('');
  const [materiaLocal, setMateriaLocal] = useState<string>('');
  const [temaLocal, setTemaLocal] = useState<string>('');
  const [quantidadeLocal, setQuantidadeLocal] = useState<number | string>(0);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfReadyToGenerate, setPdfReadyToGenerate] = useState(false);
  const isGeneratingRef = useRef(false); // Referência para controlar se a geração está em andamento


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

  // NOVO useEffect para lidar com a lógica de geração do PDF
  useEffect(() => {
    const generatePdf = async () => {
      // Impede múltiplas execuções se já estiver gerando ou se não for para gerar
      if (!pdfReadyToGenerate || isGeneratingRef.current) {
        return;
      }

      isGeneratingRef.current = true; // Sinaliza que a geração começou

      const input = document.getElementById('response-container');

      if (!input) {
        console.error("Elemento para PDF não encontrado!");
        alert("Não foi possível gerar o PDF. Elemento principal não encontrado.");
        setIsGeneratingPdf(false);
        setPdfReadyToGenerate(false);
        isGeneratingRef.current = false; // Libera a flag
        return;
      }

      try {
        const canvas = await html2canvas(input, {
          scale: 2, // Aumenta a resolução para melhor qualidade
          useCORS: true, // Importante se tiver imagens de domínios diferentes
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210; // Largura do A4 em mm
        const pageHeight = 297; // Altura do A4 em mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Lida com conteúdo que excede uma única página
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const fileName = `${tituloLocal || 'Lista_de_Exercicios'}.pdf`;
        pdf.save(fileName);

        alert("PDF gerado com sucesso!");

      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para detalhes.");
      } finally {
        setIsGeneratingPdf(false); // Reseta o estado visual (mostra os botões novamente)
        setPdfReadyToGenerate(false); // Reseta o estado para que não dispare novamente
        isGeneratingRef.current = false; // Libera a flag para futuras gerações
      }
    };

    if (pdfReadyToGenerate) {
      // AUMENTAR O TEMPO DO ATRASO AQUI!
      // Um valor entre 300ms e 500ms é geralmente mais seguro para garantir a renderização.
      const timer = setTimeout(() => {
        generatePdf();
      }, 500); // Aumentado para 500ms para maior garantia
      return () => clearTimeout(timer); // Limpa o timer se o componente desmontar
    }
  }, [pdfReadyToGenerate, listaExercicios, tituloLocal, materiaLocal, temaLocal]); // Dependências corrigidas para states locais


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

  // handleDownloadPdf CORRIGIDO: APENAS ATIVA OS ESTADOS, NÃO GERA O PDF DIRETAMENTE
  const handleDownloadPdf = () => {
    // Apenas define os estados. A lógica real de geração de PDF está no useEffect.
    setIsGeneratingPdf(true); // Isso fará com que os elementos sejam ocultados no DOM
    setPdfReadyToGenerate(true); // Isso disparará o useEffect após a próxima renderização
  };

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
    <div id="response-container" className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left w-full">
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
                isGeneratingPdf={isGeneratingPdf} // Passa a prop
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

      {/* Botões de controle condicionalmente ocultos durante a geração do PDF */}
      {!isGeneratingPdf && (
        <div className="mt-6 text-center flex justify-center space-x-4">
          <button
            onClick={onGerarOutra}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Gerar Outra Lista
          </button>

          <button
            onClick={handleDownloadPdf}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            Baixar como PDF
          </button>
        </div>
      )}
    </div>
  );
}