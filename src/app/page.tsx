'use client';

import Header from "./components/Header";
import Inputs from "./components/Inputs";
import Resposta from "./components/Resposta";
import Footer from "./components/Footer";

import { useState } from 'react';

import type { RespostaAPI } from './components/Resposta'; 

export default function Home() {
  const [resposta, setResposta] = useState<RespostaAPI>(null); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleGerarOutra = () => {
    setResposta(null);
    setIsLoading(false);
    document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="container w-full max-w-5xl mx-auto flex flex-col items-center space-y-10 min-h-screen py-8">
      <Header />
      <main className="w-full flex flex-col items-center space-y-10 flex-grow">
        <section id="formulario" className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-sky-600 text-center">
            Crie sua Lista de Exercícios Personalizada
          </h2>
          {/* Passa setIsLoading para Inputs também */}
          <Inputs setResposta={setResposta} setIsLoading={setIsLoading} />
        </section>
        
        {/* Só renderiza a seção de Resposta se houver algo para mostrar ou se estiver carregando */}
        {(resposta || isLoading) && (
          <section id="resposta-container" className="w-full flex flex-col items-center">
             <Resposta resposta={resposta} isLoading={isLoading} onGerarOutra={handleGerarOutra} />
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}