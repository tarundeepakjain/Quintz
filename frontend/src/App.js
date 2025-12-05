import {BrowserRouter,Routes,Route} from "react-router-dom";
import QuintzAuth from "./components/Auth";
import Profile from "./components/Profile";
import Home from "./components/Home";
import GiveQuiz from "./components/GiveQuiz";
import CreateQuiz from "./components/CreateQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<QuintzAuth/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/" element={<Home/>} />
        <Route path="give-quiz/:quizID" element={<GiveQuiz/>} />
        <Route path="/create-quiz" element={<CreateQuiz/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
