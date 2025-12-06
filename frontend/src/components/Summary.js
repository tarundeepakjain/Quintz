import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Summary = () =>{
    const { quizId,username } = useParams();
    useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
           window.location.href = `${window.location.origin}/auth`;
           return;
        }

        const res = await axios.get(`http://localhost:5001/quiz-results/${quizId}`, {
            headers: { Authorization: "Bearer " + token },
        });
        
      } catch (err) {
        console.log(err);
      }
    };

    fetchResults();
  }, [quizId]);
};

export default Summary;