import {BrowserRouter,Routes,Route} from "react-router-dom";
import QuintzAuth from "./components/Auth";
import Profile from "./components/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<QuintzAuth/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
