export default function Tema(){
    return(
        <div>
            <label htmlFor="tema" className="block text-sm font-medium text-slate-700 mb-1">💭 Tema Específico</label>
            <input type="text" id="tema" name="tema" className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-700 placeholder-slate-400 transition-colors" placeholder="Ex: Bhaskara, Revolução Francesa, Moral e Ética"/>
        </div>
    )
}