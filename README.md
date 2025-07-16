# EstudAI - Gerador de Listas de Exercícios com IA


### Curso Técnico de Desenvolvimento de Sistemas - Senai

![Imagem de capa do projeto](./public/images/EstudAI.gif)

**Descrição:**

O "EstudAI" é uma **aplicação web completa** que revoluciona a criação de provas e listas de exercícios. Composta por um **frontend interativo** desenvolvido em Next.js (React/TypeScript) e um **backend robusto** em Flask (Python), esta solução permite aos usuários gerar listas de exercícios personalizadas sobre qualquer tema e matéria, consumindo a poderosa inteligência artificial **Google Gemini**.

Após a geração, o usuário possui controle total para **editar** cada detalhe dos exercícios e suas alternativas, **ajustar o gabarito** e até **remover** questões. Finalmente, a lista editada pode ser **exportada em formato PDF** de forma limpa e profissional, pronta para uso. O backend é responsável pela comunicação segura com a API Gemini, garantindo a validação de conteúdo e a formatação padronizada das respostas.

Leia mais sobre o projeto na documentação técnica no notion: https://exclusive-battery-9a7.notion.site/Projeto-estudAI-com-next-js-documenta-o-t-cnica-2036b903337f800c8a3fe2aacd54f739?source=copy_link

## Índice

* [Visão Geral do Projeto](#visão-geral-do-projeto)
* [Funcionalidades](#funcionalidades)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Arquitetura do Sistema](#arquitetura-do-sistema)
* [Endpoints da API (Backend)](#endpoints-da-api-backend)
* [Configuração da API Gemini](#configuração-da-api-gemini)
* [Instalação](#instalação)
* [Execução](#execução)
* [Melhorias Futuras](#melhorias-futuras)
* [Autor](#autor)
* [Licença](#licença)

---

## Visão Geral do Projeto

Este projeto tem como objetivo principal otimizar o processo de criação de listas de exercícios, automatizando a geração de conteúdo e oferecendo ferramentas de personalização e exportação. É uma solução completa para educadores e estudantes que buscam eficiência e flexibilidade na elaboração de materiais didáticos.

## Funcionalidades

### Funcionalidades do Frontend (Aplicação Web)

* **Geração Personalizada:** Preenchimento de formulário para gerar listas de exercícios por matéria, tema e quantidade desejada.
* **Visualização Interativa:** Exibição clara e organizada da lista de exercícios gerada, incluindo gabarito.
* **Edição Completa:** Permite editar enunciados, texto das alternativas e a resposta correta de cada exercício.
* **Remoção Dinâmica:** Capacidade de remover exercícios individuais da lista, com reindexação automática dos números e ajuste do gabarito.
* **Download em PDF:** Exportação da lista de exercícios (com ou sem gabarito visível) para um arquivo PDF, pronto para impressão ou compartilhamento.
* **Feedback ao Usuário:** Mensagens claras para informar o status da geração, sucesso do download ou erros.

### Funcionalidades do Backend (API Flask)

* **Geração Automática de Conteúdo:** Interage com a Google Gemini API para criar exercícios baseados em parâmetros fornecidos.
* **Validação:** Valida os parâmetros de entrada e o conteúdo gerado pela IA.
* **Formato Padronizado:** Retorna as listas de exercícios e gabaritos em formato JSON padronizado para consumo pelo frontend.
* **Segurança da API Key:** Gerencia a chave da API Gemini de forma segura, sem expô-la ao cliente.

## Tecnologias Utilizadas

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![html2canvas](https://img.shields.io/badge/html2canvas-FF6F00?style=for-the-badge&logo=html5&logoColor=white) 
![jsPDF](https://img.shields.io/badge/jsPDF-007BFF?style=for-the-badge&logo=adobeacrobatreader&logoColor=white) 

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Google Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Flask-CORS](https://img.shields.io/badge/Flask--CORS-003545?style=for-the-badge)

### Ferramentas de Desenvolvimento
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

---

## Arquitetura do Sistema

A arquitetura do projeto segue um modelo cliente-servidor distribuído, com total separação entre o frontend e o backend.

* **Frontend (Camada de Apresentação):** Desenvolvido com Next.js (React/TypeScript), é responsável pela interface do usuário, lógica de interação e pela funcionalidade de download de PDF. Comunica-se com o backend via requisições HTTP.
* **Backend (Camada de Negócios e IA):** Implementado em Python com Flask, atua como uma API RESTful. Recebe as requisições do frontend, intermedia a comunicação com a Google Gemini API (mantendo a chave de API segura) e retorna os dados processados para o frontend.

## Endpoints da API (Backend)

O backend expõe um endpoint principal para a geração de listas de exercícios:

* **POST `/estudar`**: Gera uma lista de exercícios personalizada com base nos parâmetros fornecidos.

    * **Request Body:**
        ```json
        {
            "materia": "Matemática",
            "tema": "Funções Quadráticas",
            "quantidade": 5,
            "dificuldade": "Médio"
        }
        ```

    * **Resposta (200 OK - Sucesso):** Lista de exercícios no formato JSON.
        ```json
        {
            "titulo": "Lista de Exercícios sobre Funções Quadráticas",
            "materia": "Matemática",
            "tema": "Funções Quadráticas",
            "quantidade": 5,
            "exercicios": [
                {
                    "enunciado": "Qual a solução da equação x^2 - 4x + 4 = 0?",
                    "alternativas": ["a) x=1", "b) x=2", "c) x=4", "d) x=0"],
                    "respostaCorreta": "b"
                }
                // ... outros exercícios
            ],
            "gabarito": {
                "1": "b",
                "2": "a"
                // ...
            }
        }
        ```

    * **Resposta (400 Bad Request):** Caso falte algum dado obrigatório ou JSON inválido.
        ```json
        {
            "error": "Requisição JSON inválida. Está faltando informações"
        }
        ```

    * **Resposta (500 Internal Server Error):** Em caso de falha na comunicação com a API ou erro interno no servidor.
        ```json
        {
            "error": "Não foi possível gerar a lista de exercícios. Tente novamente ou revise os parâmetros."
        }
        ```

## Configuração da API Gemini

Para que o backend possa se comunicar com a API do Google Gemini, é necessário configurar sua chave de API.

1.  Obtenha sua chave de API no [Google AI Studio](https://aistudio.google.com/app/apikey) ou no Google Cloud.
2.  No diretório **`backend/`** do projeto, crie um arquivo chamado `.env`.
3.  Adicione a seguinte linha ao arquivo `.env`, substituindo `SUACHAVEAQUI` pela sua chave real:
    ```
    GEMINI_API_KEY="SUACHAVEAQUI"
    ```
    * Certifique-se de que o `.env` esteja listado no `.gitignore` para não expor sua chave.

## Instalação

Para configurar e instalar o projeto, siga os passos neste repositório para instalar o backend: https://github.com/Richard15151/backendestudai

Para instalar o frontend siga estes passos:

### 1. Clonar o Repositório

```bash
git clone https://github.com/Richard15151/estudai.git
cd estudai
```


### 3. Instalação do Frontend

1.  Navegue para o diretório do frontend:
    ```bash
    cd ../estudai
    ```
2.  Instale as dependências Node.js/npm:
    ```bash
    npm install
    ```
3.  **Configuração da URL do Backend (CORS):**
    * No diretório **`estudai/`**, crie um arquivo chamado `.env.local`.
    * Adicione a seguinte linha, apontando para a URL padrão do seu backend Flask (se estiver rodando localmente):
        ```
        NEXT_PUBLIC_BACKEND_URL="[http://127.0.0.1:5000](http://127.0.0.1:5000)"
        ```

## Execução

Certifique-se de que ambos os serviços (Backend e Frontend) estejam rodando simultaneamente.

### 1. Executar o Backend (Servidor Flask)

1.  Abra um terminal e navegue até o diretório **`backendestudai/`**.
2.  Ative seu ambiente virtual (se criou um):
    ```bash
    # No Windows: .\venv\Scripts\activate
    # No macOS/Linux: source venv/bin/activate
    ```
3.  Inicie o servidor Flask:
    ```bash
    python app.py
    ```
    * O servidor Flask será executado em `http://127.0.0.1:5000` por padrão.

### 2. Executar o Frontend (Aplicação Next.js)

1.  Abra um **novo terminal** e navegue até o diretório **`estudai/`**.
2.  Inicie a aplicação Next.js em modo de desenvolvimento:
    ```bash
    npm run dev
    ```
    * A aplicação Next.js será executada em `http://localhost:3000` por padrão.
3.  Acesse a aplicação em seu navegador: `http://localhost:3000`

---

## Melhorias Futuras

O projeto possui um vasto potencial para expansões e aprimoramentos, incluindo:

* **Autenticação de Usuários:** Para salvar listas, histórico e configurações.
* **Diversificação de Tipos de Exercício:** Gerar verdadeiro/falso, questões discursivas, etc.
* **Otimização de Geração:** Técnicas avançadas de prompt engineering para resultados mais precisos.
* **UI/UX:** Aprimoramentos na interface, indicadores de progresso mais visuais e responsividade robusta.
* **Testes Automatizados:** Implementação de testes unitários e de integração para maior estabilidade.

## Autor

* **Richard de Oliveira Ribeiro** - https://github.com/Richard15151 

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
