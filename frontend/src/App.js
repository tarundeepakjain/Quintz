import {BrowserRouter,Routes,Route} from "react-router-dom";
import QuintzAuth from "./components/Auth";
import HomePage from "./components/home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<QuintzAuth/>} />
        <Route path="/homepage" element={<HomePage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
