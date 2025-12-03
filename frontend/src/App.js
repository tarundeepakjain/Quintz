import {BrowserRouter,Routes,Route} from "react-router-dom";
import QuintzAuth from "./components/Auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<QuintzAuth/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
