export default function Quantidade(){
    return(
        <div>
            <label htmlFor="quantidade" className="block text-sm font-medium text-slate-700 mb-1">📝 Quantidade de Exercícios</label>
            <input type="number" id="quantidade" name="quantidade" className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-colors" placeholder="Ex: 5"/>
        </div>
    )
}