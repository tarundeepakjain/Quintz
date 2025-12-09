import {BrowserRouter,Routes,Route} from "react-router-dom";
import QuintzAuth from "./components/Auth";
import Profile from "./components/Profile";
import Home from "./components/Home";
import GiveQuiz from "./components/GiveQuiz";
import CreateQuiz from "./components/CreateQuiz";
import PastQuizzes from "./components/PastQuizzes";
import ResultsPage from "./components/Results";
import Summary from "./components/Summary";
import EditQuiz from "./components/EditQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<QuintzAuth/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/" element={<Home/>} />
        <Route path="give-quiz/:quizId" element={<GiveQuiz/>} />
        <Route path="/create-quiz" element={<CreateQuiz/>} />
        <Route path="/past-quizzes" element={<PastQuizzes/>} />
        <Route path="/view-results/:quizId" element={<ResultsPage/>} />
        <Route path="/summary/:quizId/:username" element={<Summary />} />
        <Route path="/edit-quiz/:quizId" element={<EditQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
