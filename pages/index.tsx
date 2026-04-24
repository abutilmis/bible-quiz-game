import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { Question } from '../types';

const questions: Question[] = [
  { id: 1, text: "ሉሲፈር የሚለው ቃል ምን ማለት ነው?", options: ["የከበረ", "የንጋትልጅ የአጥብያ ኮከብ", "ክፉ", "እሳት"], correctAnswer: 1 },
  { id: 2, text: "ኤልሳዕ ለምጻሙ ንዕማን ስንት ጊዜ እንዲታጠብ አዘዘው?", options: ["5", "6", "7", "8"], correctAnswer: 2 },
  { id: 3, text: "ማርቆስ መጽሐፉን የጀመረው በኢየሱስ ሕይወት ውስጥ በየትኛው ወቅት ላይ ነው?", options: ["ከመወለዱ በፊት", "ጥምቀቱ", "ሲወለድ", "ፈተናው"], correctAnswer: 1 },
  { id: 4, text: "ሊወግሩኝ ድንጋይ ባነሱ ጊዜ ተሰወርኩባቸው እኔ ማን ነኝ?", options: ["እስጢፋኖስ", "አመንዝራዋ ሴት", "ጳውሎስ", "መልስ አልተሰጠም"], correctAnswer: 3 },
  { id: 5, text: "የማቱሳላ አባት ነኝ እኔ  ማን ነኝ?", options: ["ዳዊት", "እስራኤል", "ኖህ", "ሄኖክ"], correctAnswer: 3 },
  { id: 6, text: "በራእይ መጽሐፍ ውስጥ የመጨረሻው ቃል ምንድን ነው?", options: ["ጌታ", "ክርስቶስ", "ኢየሱስ", "አሜን"], correctAnswer: 3 },
  { id: 7, text: "እስራኤላውያን የሞተውን ሰው ወደ መቃብር ጣሉት እና የዚህ ነቢይ አፅም ሲነካው እንደገና ሕያው ሆነ ይህ ነብይ ማነው?", options: ["ኢሳይያስ", "ሳሙኤል", "ኤልሳዕ", "ናታን"], correctAnswer: 2 },
  { id: 8, text: "የፊልሞናን መጽሐፍ የጻፈው ማን ነው?", options: ["ፊልሞና", "ሉቃስ", "ዮሃንስ", "ጳውሎስ"], correctAnswer: 3 },
  { id: 9, text: "የእስራኤል ልጆች በረሃብ ወቅት ከዮሴፍ ምን ሊገዙ መጡ?", options: ["የእርሻ መሳሪያዎች", "እንስሳት", "እህል", "ስጋ"], correctAnswer: 2 },
  { id: 10, text: "ከአሥራ ሁለቱ ደቀ መዛሙርት ኢየሱስ የማንን አማች ፈወሰ?", options: ["ስምዖን ጴጥሮስ", "እንድሪያስ", "ያዕቆብ", "ዮሐንስ"], correctAnswer: 0 },
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
  const [competitionActive, setCompetitionActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const totalQuestions = questions.length;

  // On mount: check login and completion status (Redis lock)
  useEffect(() => {
    const storedName = localStorage.getItem('ventName');
    const storedPhone = localStorage.getItem('phone');
    if (!storedName || !storedPhone) {
      router.push('/login');
      return;
    }
    setVentName(storedName);
    setPhone(storedPhone);

    // Verify completion flag from Redis – this is critical
    fetch(`/api/check-completed?phone=${encodeURIComponent(storedPhone)}`)
      .then(res => res.json())
      .then(data => {
        if (data.completed) {
          setIsBlocked(true);
          setGameState('finished'); // show blocked screen
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Completion check failed:', err);
        setIsLoading(false);
      });
  }, [router]);

  // Timer effect (only if not blocked)
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null || isBlocked) return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (selectedOption === null) {
            setFeedback('wrong');
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
  }, [gameState, currentIndex, feedback, selectedOption, totalQuestions, isBlocked]);

  const startGame = () => {
    if (isBlocked) return;
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback(null);
    setSaved(false);
    setLeaderboard([]);
  };

  const handleAnswer = () => {
    if (selectedOption === null || feedback !== null || isBlocked) return;
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
      const telegramUsername = localStorage.getItem('telegramUsername') || '';
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ventName,
          phone,
          telegramUsername,
          score,
          totalQuestions,
          answers: questions.map(q => q.correctAnswer)
        })
      });
      if (res.ok) {
        setSaved(true);
        // Set completion flag in Redis
        await fetch('/api/set-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
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
    if (gameState === 'finished' && !saved && ventName && phone && !isBlocked) {
      saveResult();
    }
  }, [gameState, saved, ventName, phone, isBlocked]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Blocked screen (already taken) – no start button, no way to play
  if (isBlocked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4"
      >
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md text-center border border-[#FFD966]/30">
          <h2 className="text-2xl text-[#FFD966] mb-4">Quiz Already Taken</h2>
          <p className="text-white/80">You have already completed this quiz. Please contact the admin if you believe this is an error.</p>
          <button
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="mt-6 bg-[#FFD966] text-[#1e3c2c] px-4 py-2 rounded-full text-sm"
          >
            Try Another Number
          </button>
        </div>
      </motion.div>
    );
  }

  // Start screen (only if not blocked)
  if (gameState === 'start') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-center"
        >
          <img src="/vent logo.png" alt="Logo" className="w-28 h-28 mx-auto mb-4 rounded-full shadow-lg border-2 border-[#FFD966] object-cover" />
          <h1 className="text-5xl font-bold text-[#FFD966] mb-4 drop-shadow-lg">Bible Quiz</h1>
          <p className="text-white/80 mb-8 text-lg">Test your knowledge of the Bible</p>
          {competitionLoading ? (
            <div className="spinner mx-auto my-4"></div>
          ) : (
            <>
              {!competitionActive && <p className="text-red-400 mb-4">{timeRemaining}</p>}
              {competitionActive && <p className="text-white/60 mb-2">⏳ {timeRemaining}</p>}
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            disabled={!competitionActive}
            className="bg-[#FFD966] text-[#1e3c2c] px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.clear();
              router.push('/login');
            }}
            className="mt-4 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300"
          >
            🔄 Switch Account
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Playing screen
  if (gameState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center text-white/80 mb-2">
            <span>⏱️ {timeLeft}s</span>
            <span>📋 {currentIndex+1}/{totalQuestions}</span>
          </div>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 border border-[#FFD966]/30 shadow-xl"
          >
            <div className="text-white text-xl md:text-2xl font-semibold mb-6">{q.text}</div>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl transition ${
                    selectedOption === idx
                      ? 'bg-[#FFD966] text-[#1e3c2c] font-bold'
                      : 'bg-black/30 text-white hover:bg-black/50'
                  }`}
                  disabled={feedback !== null}
                >
                  {String.fromCharCode(65+idx)}. {opt}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnswer}
              disabled={selectedOption === null || feedback !== null}
              className="w-full mt-6 bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-bold disabled:opacity-50 transition"
            >
              Submit
            </motion.button>
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

  // Finished screen
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4"
    >
      <div className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 max-w-md w-full text-center border border-[#FFD966]/30">
        <h2 className="text-3xl font-bold text-[#FFD966] mb-2">Your Score</h2>
        <div className="text-6xl font-bold text-white my-4">{score} / {totalQuestions}</div>
        <div className="text-white/70 mb-6">{Math.round(score/totalQuestions*100)}%</div>
        {!saved ? (
          <div className="spinner mx-auto my-4 w-6 h-6 border-2 border-t-2"></div>
        ) : (
          <>
            <p className="text-green-400 mb-4">✅ Your score has been recorded!</p>
            {leaderboard.length > 0 && (
              <div className="mt-6 text-left bg-black/20 rounded-xl p-4">
                <h3 className="text-[#FFD966] font-bold text-xl mb-2 text-center">🏆 Top Players</h3>
                <div className="space-y-1">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="text-white/80 flex justify-between text-sm md:text-base">
                      <span>{idx+1}. {user.name}</span>
                      <span>{user.score} pts</span>
                    </div>

                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => {
            const message = `🎉 I scored ${score}/${totalQuestions} (${Math.round(score/totalQuestions*100)}%) on the Bible Quiz!\n\nTake the challenge: ${window.location.origin}`;
            if (navigator.share) {
              navigator.share({
                title: 'My Bible Quiz Score',
                text: message,
                url: window.location.origin,
              }).catch(() => {
                navigator.clipboard.writeText(message);
                alert('Score copied to clipboard!');
              });
            } else {
              navigator.clipboard.writeText(message);
              alert('Score copied to clipboard!');
            }
          }}
          className="w-full bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition"
        >
          📤 Share My Score
        </button>
        <button
          onClick={() => {
            const text = `🎉 I scored ${score}/${totalQuestions} (${Math.round(score/totalQuestions*100)}%) on the Bible Quiz!`;
            const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
          }}
          className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white px-4 py-2 rounded-full text-sm transition"
        >
          📢 Share on Telegram
        </button>
      </div>
    </motion.div>
  );
}