import Header from "./components/Header";
import Container from "./components/Container"
import Resposta from "./components/Resposta"
import Footer from "./components/Footer"

export default function Home(){
  return(
    <div className="container w-full max-w-5xl mx-auto flex flex-col items-center space-y-10">
      <Header/>
      <main className="w-full flex flex-col items-center space-y-10">
      <Container/>
      <Resposta/>
      </main>
      <Footer/>
    </div>
  )
}