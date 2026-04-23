import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { Question } from '../types';

const questions: Question[] = [
  { id: 1, text: "Who was the first man created by God?", options: ["Adam", "Eve", "Moses", "Abraham"], correctAnswer: 0 },
  { id: 2, text: "How many days did God take to create the heavens and the earth?", options: ["5", "6", "7", "8"], correctAnswer: 1 },
  { id: 3, text: "Who was thrown into the lions' den?", options: ["Daniel", "David", "Jonah", "Joseph"], correctAnswer: 0 },
  { id: 4, text: "What is the first commandment?", options: ["Do not kill", "Honor your parents", "No other gods before Me", "Keep the Sabbath"], correctAnswer: 2 },
];

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [ventName, setVentName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const totalQuestions = questions.length;

  // Check login and load leaderboard if needed
  useEffect(() => {
    const storedName = localStorage.getItem('ventName');
    const storedPhone = localStorage.getItem('phone');
    if (!storedName || !storedPhone) {
      router.push('/login');
      return;
    }
    setVentName(storedName);
    setPhone(storedPhone);
  }, [router]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null) return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (selectedOption === null) {
            // Auto-submit by faking a wrong answer
            const isCorrect = false;
            setFeedback(isCorrect ? 'correct' : 'wrong');
            setTimeout(() => {
              if (currentIndex + 1 < totalQuestions) {
                setCurrentIndex(currentIndex + 1);
                setSelectedOption(null);
                setFeedback(null);
              } else {
                setGameState('finished');
              }
            }, 1500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentIndex, feedback, selectedOption, totalQuestions]);

  const startGame = () => {
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback(null);
    setSaved(false);
    setLeaderboard([]);
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === questions[currentIndex].correctAnswer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(score + 1);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < totalQuestions) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const saveResult = async () => {
    if (saved) return;
    try {
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ventName,
          phone,
          score,
          totalQuestions,
          answers: questions.map(q => q.correctAnswer)
        })
      });
      if (res.ok) {
        setSaved(true);
        const leaderboardRes = await fetch('/api/leaderboard');
        const data = await leaderboardRes.json();
        setLeaderboard(data);
      } else {
        console.error('Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  useEffect(() => {
    if (gameState === 'finished' && !saved && ventName && phone) {
      saveResult();
    }
  }, [gameState, saved, ventName, phone]);

  // Start screen
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] flex items-center justify-center p-4">
        <div className="text-center">
          <img src="/vent logo.png" alt="Christian Vent Logo" className="w-28 h-28 mx-auto mb-4 rounded-full shadow-lg border-2 border-[#FFD966] object-cover" />
          <h1 className="text-5xl font-bold text-[#FFD966] mb-4">Bible Quiz</h1>
          <p className="text-white/80 mb-8">Test your knowledge of the Bible</p>
          <button onClick={startGame} className="bg-[#FFD966] text-[#1e3c2c] px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center text-white/70 mb-2">⏱️ Time left: {timeLeft}s</div>
          <div className="text-center text-white/70 mb-2">Question {currentIndex+1} of {totalQuestions}</div>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-[#FFD966]/30 shadow-xl"
          >
            <div className="text-white text-2xl font-semibold mb-6">{q.text}</div>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl transition ${
                    selectedOption === idx
                      ? 'bg-[#FFD966] text-[#1e3c2c] font-bold'
                      : 'bg-black/30 text-white hover:bg-black/50'
                  }`}
                  disabled={feedback !== null}
                >
                  {String.fromCharCode(65+idx)}. {opt}
                </button>
              ))}
            </div>
            <button
              onClick={handleAnswer}
              disabled={selectedOption === null || feedback !== null}
              className="w-full mt-6 bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-bold disabled:opacity-50 transition hover:scale-105"
            >
              Submit
            </button>
          </motion.div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className={`text-center mt-4 text-2xl font-bold ${
                  feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {feedback === 'correct' ? '🎉 Correct! 🎉' : '😢 Wrong! Better luck next time.'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Finished screen (score + leaderboard + retake option)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md w-full text-center border border-[#FFD966]/30">
        <h2 className="text-3xl font-bold text-[#FFD966] mb-2">Your Score</h2>
        <div className="text-6xl font-bold text-white my-4">{score} / {totalQuestions}</div>
        <div className="text-white/70 mb-6">{Math.round(score/totalQuestions*100)}%</div>
        {!saved ? (
          <p className="text-white/70">Saving your score...</p>
        ) : (
          <>
            <p className="text-green-400 mb-4">✅ Your score has been recorded!</p>
            <button
              onClick={startGame}
              className="bg-[#FFD966] text-[#1e3c2c] px-6 py-3 rounded-full font-bold w-full mb-6"
            >
              Play Again
            </button>
            {leaderboard.length > 0 && (
              <div className="mt-4 text-left">
                <h3 className="text-[#FFD966] font-bold text-xl mb-2">🏆 Top Players</h3>
                {leaderboard.map((user, idx) => (
                  <div key={idx} className="text-white/80 flex justify-between py-1">
                    <span>{idx+1}. {user.name}</span>
                    <span>{user.score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}