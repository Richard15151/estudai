import Botaogerarlista from "./Botaogerarlista"
import Inputs from "./Inputs"

export default function Container(){
    return(
         <section id="formulario" className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-2xl">
            <h2 className="text-2xl font-semibold mb-6 text-sky-600 text-center">
                Crie sua Lista de Exercícios Personalizada
            </h2>
            <Inputs/>
            <Botaogerarlista/>
         </section>
    )
}