import Header from "./components/Header";
import Container from "./components/Inputs"

export default function Home(){
  return(
    <div>
      <Header></Header>
      <main className="w-full flex flex-col items-center space-y-10">
      <Container/>
      </main>
    </div>
  )
}