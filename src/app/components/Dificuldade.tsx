export default function Dificuldade(){
    return(
        <div>
            <label htmlFor="dificuldade" className="block text-sm font-medium text-slate-700 mb-1">🧠 Nível de Dificuldade</label>
            <select name="dificuldade" id="dificuldade" className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 bg-white transition-colors">
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
                <option value="misto">Misto</option>
            </select>
        </div>
    )
}