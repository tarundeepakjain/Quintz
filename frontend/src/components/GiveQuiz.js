import { useParams } from "react-router-dom";

export default function GiveQuiz() {
  const { quizID } = useParams();

  return (
    <div>
      <h1>Giving Quiz ID: {quizID}</h1>
    </div>
  );
}
