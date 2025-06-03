import Materia from "./Materia"
import Tema from "./Tema"
import Quantidade from "./Quantidade"
import Dificuldade from "./Dificuldade"

export default function Inputs(){
    return(
        <div id="inputs" className="space-y-6 mb-8">
            <Materia/>
            <Tema/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Quantidade/>
                <Dificuldade/>
            </div>
        </div>
    )
}