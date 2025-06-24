export default function Footer(){
    return(
        <footer className="relative w-full mb-20">
            <div className="flex flex-col items-center justify-center w-full py-4 mt-12 border-t border-slate-200 md:flex-row md:justify-between">
                <p className="block mb-4 text-ls text-center text-white md:mb-0">
                    Copyright © 2025 - 
                    <a href="https://github.com/Richard15151" target="_blank">Feito por <span className="text-blue-500">Richard Oliveira </span></a>
                     + 
                     <a href="https://ai.google.dev/gemini-api/docs?hl=pt-br" target="_blank"><span className="text-blue-500"> Gemini API </span></a>
                </p>
                <div className="flex gap-4 text-slate-600 sm:justify-center">
                    <a href="https://github.com/Richard15151/estudai.git">
                        <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                        <path d="M12 0C5.37 0 0 5.36 0 12a12 12 0 008.2 11.43c.6.1.82-.26.82-.58v-2.14c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.1-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.23-3.22-.13-.3-.53-1.5.12-3.13 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0C17 3.27 18 3.6 18 3.6c.65 1.63.25 2.83.12 3.13.76.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.61-5.47 5.91.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57A12 12 0 0024 12c0-6.64-5.36-12-12-12z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    )
}