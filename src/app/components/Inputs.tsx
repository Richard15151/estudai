// Inputs.tsx
"use client";

import { useState } from "react";
import type { DadosLista, RespostaAPI } from "./Resposta"; // Ajuste o caminho se necessário

interface InputsProps {
  setResposta: (valor: RespostaAPI) => void; // << Tipo atualizado
  setIsLoading: (loading: boolean) => void; // << Para controlar o estado de loading
}

export default function Inputs({ setResposta, setIsLoading }: InputsProps) {
  const [materia, setMateria] = useState("");
  const [tema, setTema] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dificuldade, setDificuldade] = useState("facil");
  // O estado de carregando pode ser movido para o componente pai (page.tsx)
  // para que Resposta.tsx também saiba quando está carregando.
  // const [carregando, setCarregando] = useState(false); // Removido daqui, será gerenciado em page.tsx

  const limparFormulario = () => {
    setMateria("");
    setTema("");
    setQuantidade("");
    setDificuldade("facil");
  };

  const enviarFormulario = async () => {
    if (!materia || !tema || !quantidade || !dificuldade) {
      setResposta("Por favor, preencha todos os campos.");
      return;
    }

    if (materia.length < 3 || tema.length < 3) {
      setResposta(
        "Por favor, informe pelo menos 3 caracteres para matéria e tema."
      );
      return;
    }

    const numQuantidade = parseInt(quantidade);
    if (isNaN(numQuantidade) || numQuantidade <= 0 || numQuantidade > 20) {
      setResposta("Por favor, informe uma quantidade válida (1 a 20).");
      return;
    }

    const dados = { materia, tema, quantidade, dificuldade };

    setIsLoading(true); // << Atualiza estado de loading no pai
    setResposta("Carregando..."); // << Mensagem de carregamento

    try {
      const res = await fetch("https://backendestudai.vercel.app/estudar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const resultado = await res.json();

      if (res.ok) {
        // Verifica se é um alerta antes de tratar como DadosLista
        if (resultado.titulo && typeof resultado.titulo === 'string' && resultado.titulo.toLowerCase() === "alerta") {
            let mensagemAlerta = "Por favor, reveja as informações fornecidas e utilize a plataforma com respeito e responsabilidade.";
            if (typeof resultado.materia === 'string' && resultado.materia.length > 5 && resultado.materia.toLowerCase() !== "alerta") {
                 mensagemAlerta = resultado.materia;
            } else if (Array.isArray(resultado.exercicios) && resultado.exercicios.length > 0 && resultado.exercicios[0] && typeof resultado.exercicios[0].enunciado === 'string') {
                 mensagemAlerta = resultado.exercicios[0].enunciado;
            }
            // Passa um objeto especial ou uma string formatada para o alerta
            setResposta({ titulo: "ALERTA", mensagemAlerta } as DadosLista);
        } else {
            setResposta(resultado as DadosLista);
        }
        limparFormulario();
      } else {
        setResposta(resultado.error || "Erro ao processar a requisição.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setResposta("Erro na conexão com servidor: " + err.message);
      } else {
        setResposta("Ocorreu um erro desconhecido na conexão.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div>
        <label htmlFor="materia" className="block text-sm font-medium text-slate-700 mb-1">📚 Matéria</label>
        <input
          id="materia"
          type="text"
          placeholder="Ex: Matemática, História, Filosofia..."
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="tema" className="block text-sm font-medium text-slate-700 mb-1">💭 Tema Específico</label>
        <input
          id="tema"
          type="text"
          placeholder="Ex: Bhaskara, Revolução Francesa, Moral e Ética"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700 mb-1">📝 Quantidade de Exercícios</label>
          <input
            id="quantidade"
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="dificuldade" className="block text-sm font-medium text-slate-700 mb-1">🧠 Nível de Dificuldade</label>
          <select
            id="dificuldade"
            value={dificuldade}
            onChange={(e) => setDificuldade(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white transition-colors"
          >
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
            <option value="misto">Misto</option>
          </select>
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={enviarFormulario}
          // disabled={carregando} // Será controlado pelo estado `isLoading` do pai
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-md shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {/* {carregando ? "Gerando lista..." : "Gerar Lista"} // Será controlado pelo estado `isLoading` do pai */}
          Gerar Lista
        </button>
      </div>
    </div>
  );
}