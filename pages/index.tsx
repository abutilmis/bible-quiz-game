import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { Question } from '../types';

const questions: Question[] = [
  { id: 1, text: "በአንጾኪያ ስንጸልይ እና ስናመልክ መንፈስ ቅዱስ ለስራዬ ለዩልኝ ያለን ሰዎች ነን እኛ እነማን ነን? ", options: ["ጳውሎስ እና ጤሞቲዎስ", "ጳውሎስ እና ሲላስ", "ጤሞቲዎስ እና ቲቶ", "ጳውሎስ እና በርናባስ"], correctAnswer: 3 },
  { id: 2, text: "ሊቀ ካህን ሆኜ ሳገለግል ሳላውቅ ስለ ኢየሱስ ሞት ትንቢት የተናገርኩ እኔ ማን ነኝ?", options: ["አናስ", "ቀያፋ", "መልከ ጼዴቅ", "ኤሊ"], correctAnswer: 1 },
  { id: 3, text: "በመጽሐፍ ቅዱስ ውስጥ “ራጉኤል” ተብዬ የምጠራ እና  የሲፓራ (የሙሴ ሚስት) አባት ነኝ እኔ ማን ነኝ?", options: ["ሆባብ", "ዮቶር", "አምራም", "ቆሬ"], correctAnswer: 1 },
  { id: 4, text: "የእስራኤል የመጀመሪያው ንጉሥ ነኝ እኔ ማን ነኝ?", options: ["ዳዊት", "ሳውል", "ሰለሞን", "ሮብዓም"], correctAnswer: 1 },
  { id: 5, text: "እስራኤላዊ ባልሆንም ኢየሱስ በታላቅ እምነቴ ያመሰገነኝ አህዛብ ሴት ነኝ እኔ ማን ነኝ?", options: ["መግደላዊት ማርያም", "ሳምራዊቷ ሴት", "ከነዓናዊት  ሴት", "ሊዲያ"], correctAnswer: 2 },
  { id: 6, text: "የራሴን ልጅ ለጣኦት የሚቃጠል መስዋዕት አድርጌ ያቀረብኩ የይሁዳ ንጉሥ ነኝ እኔ ማን ነኝ?", options: ["ምናሴ", "አካዝ", "ኢዮራም", "አሞን"], correctAnswer: 1 },
  { id: 7, text: "ከንቱ ከንቱ፣ ሁሉ ከንቱ ነው” ስል የጻፍኩ ነኝ  እኔ ማን ነኝ?", options: ["ሰለሞን", "ዳዊት", "ዮሴፍ", "ኢዮብ"], correctAnswer: 0 },
  { id: 8, text: "በመጽሐፍ ቅዱስ ውስጥ የመጀመሪያውን ግድያ የፈፀመኩ ሰው ነኝ እኔ ማን ነኝ?", options: ["ሙሴ", "አቤል", "አዳም", "ቃየን"], correctAnswer: 3 },
  { id: 9, text: "የፈርዖንን ሕልም የተረጎምኩ ሰው ነኝ እኔ ማን ነኝ?", options: ["ዳንኤል", "ዮሴፍ", "ሙሴ", "ኤልያስ"], correctAnswer: 1 },
  { id: 10, text: "በ ትንቢተ ሚልክያስ  ጌታ  ቃል ኪዳን ከእኔ ጋር እንዳደረገ የተፃፈልኝ ነኝ እኔ ማን ነኝ?", options: ["ሌዊ", "አብርሃም", "ሙሴ", "ያዕቆብ"], correctAnswer: 0 },
];

export default function Home() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'description' | 'playing' | 'finished'>('start');
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
  const [userRank, setUserRank] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [publicLeaderboard, setPublicLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  // 1. Device ID Generation (PERSISTENT)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('deviceId')) {
      const cryptoObj = window.crypto || (window as any).msCrypto;
      const newId = (cryptoObj && cryptoObj.randomUUID) 
        ? cryptoObj.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', newId);
    }
  }, []);

  // 2. Main Completion Check
  useEffect(() => {
    const storedName = localStorage.getItem('ventName');
    const storedPhone = localStorage.getItem('phone');
    const deviceId = localStorage.getItem('deviceId');

    if (!storedName || !storedPhone || !deviceId) {
      router.push('/login');
      return;
    }

    setVentName(storedName);
    setPhone(storedPhone);

    const checkCompletion = async () => {
      try {
        const res = await fetch(`/api/check-completed?userId=${deviceId}&phone=${storedPhone}`);
        const data = await res.json();
        if (data.completed) {
          setIsBlocked(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Check failed:', err);
        setIsLoading(false);
      }
    };
    checkCompletion();
  }, [router]);

  // Competition Timer logic (untouched)
  useEffect(() => {
    fetch('/api/competition')
      .then(res => res.json())
      .then(data => {
        if (data.start && data.end) {
          const start = Number(data.start);
          const end = Number(data.end);
          const updateStatus = () => {
            const now = Date.now();
            if (now < start) {
              setCompetitionActive(false);
              const diff = start - now;
              const days = Math.floor(diff / 86400000);
              const hours = Math.floor((diff % 86400000) / 3600000);
              const minutes = Math.floor((diff % 3600000) / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              setTimeRemaining(`⏳ Countdown until start: ${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else if (now > end) {
              setCompetitionActive(false);
              setTimeRemaining('⛔ Competition has ended');
            } else {
              setCompetitionActive(true);
              const diff = end - now;
              const days = Math.floor(diff / 86400000);
              const hours = Math.floor((diff % 86400000) / 3600000);
              const minutes = Math.floor((diff % 3600000) / 60000);
              const seconds = Math.floor((diff % 60000) / 1000);
              setTimeRemaining(`🔥 Competition ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
            }
          };
          updateStatus();
          const interval = setInterval(updateStatus, 1000);
          setCompetitionLoading(false);
          return () => clearInterval(interval);
        } else {
          setCompetitionActive(true);
          setTimeRemaining('📖 Open competition (no schedule)');
          setCompetitionLoading(false);
        }
      })
      .catch(() => {
        setCompetitionActive(true);
        setTimeRemaining('📖 Open competition');
        setCompetitionLoading(false);
      });
  }, []);

  // Quiz Timer logic (untouched)
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
              if (currentIndex + 1 < questions.length) {
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
  }, [gameState, currentIndex, feedback, selectedOption, isBlocked]);

  // Save Result logic
  const saveResult = async () => {
    if (saved || isBlocked) return;
    try {
      const startTime = localStorage.getItem('quizStartTime');
      let duration = 0;
      if (startTime) {
        duration = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      }
      
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ventName,
          phone: phone,
          telegramUsername: localStorage.getItem('telegramUsername') || '',
          userId: localStorage.getItem('deviceId'),
          score,
          totalQuestions: questions.length,
          duration,
          answers: questions.map(q => q.correctAnswer)
        })
      });

      if (res.ok) {
        setSaved(true);
        const lRes = await fetch('/api/leaderboard');
        const lData = await lRes.json();
        setLeaderboard(lData);
      } else {
        const errData = await res.json();
        if (errData.error === 'ALREADY_TAKEN') setIsBlocked(true);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  useEffect(() => {
    if (gameState === 'finished' && !saved && !isBlocked) {
      saveResult();
    }
  }, [gameState, saved, isBlocked]);

  // UI RENDERING - PRIORITY: BLOCKED SCREEN
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white/10 p-8 rounded-2xl text-center border border-yellow-500/30 backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-yellow-500 mb-4">Quiz Already Taken</h2>
          <p className="text-white/70 mb-8">You have already completed this quiz. Please contact admin if this is an error.</p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            className="px-8 py-3 bg-yellow-500 text-black rounded-full font-bold shadow-lg hover:scale-105 transition"
          >
            Reset All Data (Admin Only)
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="spinner" /></div>;

  // Game UI logic below ... (same as before)
  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center p-4">
        <div className="text-center">
          <img src="/vent logo.png" className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-yellow-500" />
          <h1 className="text-4xl font-bold text-yellow-500 mb-6">Bible Quiz</h1>
          <p className="text-white/60 mb-8">{timeRemaining}</p>
          <button onClick={() => setGameState('description')} disabled={!competitionActive} className="px-12 py-4 bg-yellow-500 text-black rounded-full font-bold text-xl disabled:opacity-50">Start Quiz</button>
        </div>
      </div>
    );
  }

  if (gameState === 'description') {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center p-4">
        <div className="bg-white/5 p-8 rounded-2xl max-w-md w-full border border-white/10">
          <h2 className="text-2xl text-yellow-500 mb-6 font-bold">📖 Bible Quiz Challenge</h2>
          <ul className="text-white/80 space-y-4 text-left mb-8">
            <li>✨ 10 challenging questions</li>
            <li>⏱️ 30 seconds per question</li>
            <li>🔒 Only ONE attempt allowed</li>
          </ul>
          <button onClick={() => { localStorage.setItem('quizStartTime', Date.now().toString()); setGameState('playing'); }} className="w-full py-4 bg-yellow-500 text-black rounded-full font-bold">Accept & Start</button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between text-white/50 mb-4"><span>Time: {timeLeft}s</span><span>{currentIndex+1}/{questions.length}</span></div>
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <h3 className="text-2xl text-white font-medium mb-8">{q.text}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => setSelectedOption(i)} className={`w-full text-left p-5 rounded-2xl border transition ${selectedOption === i ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}>
                  {opt}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                const isCorrect = selectedOption === q.correctAnswer;
                if (isCorrect) { setScore(s => s + 1); confetti(); }
                setFeedback(isCorrect ? 'correct' : 'wrong');
                setTimeout(() => {
                  setFeedback(null);
                  setSelectedOption(null);
                  if (currentIndex + 1 < questions.length) setCurrentIndex(c => c + 1);
                  else setGameState('finished');
                }, 1000);
              }}
              disabled={selectedOption === null || feedback !== null}
              className="w-full mt-8 py-4 bg-yellow-500 text-black rounded-full font-bold disabled:opacity-50"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center bg-white/5 p-12 rounded-3xl border border-white/10 max-w-md w-full">
        <h2 className="text-3xl text-yellow-500 font-bold mb-4">Quiz Finished!</h2>
        <div className="text-7xl font-black text-white mb-4">{score}/{questions.length}</div>
        <p className="text-white/60 mb-8">{saved ? '✅ Result saved successfully' : '💾 Saving result...'}</p>
        <div className="space-y-4">
          <button onClick={() => window.location.reload()} className="w-full py-3 bg-white/10 text-white rounded-full">Finish</button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-white/30 text-xs">Reset Local Storage (Debug)</button>
        </div>
      </div>
    </div>
  );
}