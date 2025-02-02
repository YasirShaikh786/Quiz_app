import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]); // Stores selected answers

  useEffect(() => {
    axios.get("http://localhost:5000/api/quizzes")
      .then(response => {
        console.log("API Response:", response.data);
        const selectedQuestions = response.data.questions.slice(0, 10); // Limit to 10 questions
        setQuiz({ ...response.data, questions: selectedQuestions });
        setLoading(false);
      })
      .catch(error => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      handleAnswerClick(null);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleAnswerClick = (selectedAnswer) => {
    if (!quiz || !quiz.questions[currentQuestionIndex]) {
      console.error("Quiz data is not available yet.");
      return;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.options.find(option => option.is_correct)?.description;

    setAnswers(prev => [...prev, { question: currentQuestion.description, selected: selectedAnswer, correct: isCorrect }]);

    if (isCorrect) setScore(prevScore => prevScore + 1);

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < quiz.questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setTimeLeft(10);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setAnswers([]);
    setTimeLeft(10);
  };

  if (loading) {
    return <div className="text-center text-2xl font-bold text-gray-600">Loading...</div>;
  }

  if (!quiz) {
    return <div className="text-center text-2xl font-bold text-red-500">No quiz data available.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      {showScore ? (
        <motion.div 
          className="bg-white p-8 rounded-lg shadow-xl w-[90%] max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🎉 Your Score: {score}/{quiz.questions.length}</h2>
          
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Quiz Summary:</h3>
          <ul className="text-left space-y-2">
            {answers.map((item, index) => (
              <li key={index} className={`p-2 rounded-lg ${item.correct ? "bg-green-100" : "bg-red-100"}`}>
                <strong>Q{index + 1}:</strong> {item.question}  
                <br />
                <span className={item.correct ? "text-green-700" : "text-red-700"}>
                  {item.correct ? "✅ Correct" : `❌ Incorrect (You chose: ${item.selected || "No Answer"})`}
                </span>
              </li>
            ))}
          </ul>

          <motion.button 
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={restartQuiz}
          >
            Start New Quiz
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900">{quiz.questions[currentQuestionIndex].description}</h2>

          {/* Timer Progress Bar */}
          <div className="w-full bg-gray-300 h-3 rounded-full mt-4 overflow-hidden">
            <motion.div 
              className="bg-blue-500 h-3"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / 10) * 100}%` }}
              transition={{ duration: 1, ease: "linear", repeat: Infinity }}
            />
          </div>

          {/* Question Options */}
          <div className="mt-4 space-y-2">
            {quiz.questions[currentQuestionIndex].options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerClick(option.description)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {option.description}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Quiz;
