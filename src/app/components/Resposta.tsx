// Resposta.tsx
"use client";

// Importe os tipos se estiverem em um arquivo separado
export interface Exercicio {
  numero?: number;
  enunciado: string;
  alternativas: string[];
}

export interface Gabarito {
  [key: string]: string;
}

export interface DadosLista {
  titulo: string;
  materia: string;
  tema: string;
  quantidade: number | string;
  exercicios: Exercicio[];
  gabarito: Gabarito;
  mensagemAlerta?: string; // Para o caso de alerta
}

export type RespostaAPI = DadosLista | string | null;


interface RespostaProps {
  resposta: RespostaAPI;
  isLoading: boolean; // Para saber se está carregando
  onGerarOutra: () => void; // Função para limpar a resposta e mostrar o formulário
}

export default function Resposta({ resposta, isLoading, onGerarOutra }: RespostaProps) {
  const letrasAlternativas = ['a', 'b', 'c', 'd', 'e']; // Adicione mais se necessário

  // Se estiver carregando, mostra mensagem de carregamento
  if (isLoading) {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center max-w-xl mx-auto">
        Carregando...
      </div>
    );
  }

  // Se a resposta for nula (inicial ou após limpar), não renderiza nada ou uma mensagem
  if (!resposta) {
    return null; // Ou <div className="mt-4 text-center">Sua lista aparecerá aqui.</div>
  }

  // Se a resposta for uma string (mensagem de erro ou validação do formulário)
  if (typeof resposta === 'string') {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto text-red-600 font-semibold">
        {resposta}
      </div>
    );
  }

  // Se for um alerta (identificado pelo título "ALERTA" e mensagemAlerta)
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


  // Validação básica da estrutura (opcional, pode ser mais robusta)
  // Idealmente, a API deveria garantir o formato, ou validar mais a fundo no Inputs.tsx
  if (!resposta.titulo || !Array.isArray(resposta.exercicios) || typeof resposta.gabarito !== 'object') {
    return (
      <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto text-red-600 font-semibold">
        Erro ao renderizar a Lista: formato de dados inválido.
      </div>
    );
  }

  // Renderização da lista de exercícios
  return (
    <div className="response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{resposta.titulo}</h2>

      {(resposta.materia || resposta.tema) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center text-gray-700 mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
          {resposta.materia && (
            <p className="flex items-center">
              <span className="mr-1">📚</span> <strong>Matéria:</strong> {resposta.materia}
            </p>
          )}
          {resposta.tema && (
            <p className="flex items-center">
              <span className="mr-1">🎯</span> <strong>Tema:</strong> {resposta.tema}
            </p>
          )}
        </div>
      )}
      {typeof resposta.quantidade !== 'undefined' && ( // Verifica se quantidade existe
         <p className="text-gray-700 mb-4"><strong>Quantidade de exercícios:</strong> {String(resposta.quantidade)}</p>
      )}


      {resposta.exercicios && resposta.exercicios.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Exercícios:</h3>
          <ul className="list-none text-gray-700 mb-4 space-y-6">
            {resposta.exercicios.map((exercicio, index) => (
              <li key={exercicio.numero || index} className="mb-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                <p className="font-medium mb-2">
                  {exercicio.numero ? `${exercicio.numero}. ` : `${index + 1}. `}
                  {exercicio.enunciado}
                </p>
                {Array.isArray(exercicio.alternativas) && (
                  <ul className="list-none ml-4 space-y-1">
                    {exercicio.alternativas.map((alt, altIndex) => (
                      <li key={altIndex}>
                        <strong>{letrasAlternativas[altIndex]})</strong> {alt}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {resposta.gabarito && Object.keys(resposta.gabarito).length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-2 mt-6 text-gray-700">Gabarito:</h3>
          <ol className="list-none text-gray-700 space-y-1 bg-gray-100 p-3 rounded">
            {Object.keys(resposta.gabarito)
              .sort((a, b) => parseInt(a) - parseInt(b)) // Ordena as chaves numericamente
              .map((numeroQuestao) => (
                <li key={numeroQuestao} className="py-1">
                  <strong>{numeroQuestao}.</strong> {resposta.gabarito[numeroQuestao]}
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