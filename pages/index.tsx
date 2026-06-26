import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { Question } from '../types';

const questions: Question[] = [
  {
    id: 31,
    text: "ዮናስ እግዚአብሔር ወደ የትኛው ከተማ ሄደህ ስበክ ብሎ ሲያዘው ነው ኮብልሎ የሸሸው?",
    options: ["ወደ ባቢሎን", "ወደ ነነዌ", "ወደ ይሁዳ", "ወደ ቆሮንቶስ"],
    correctAnswer: 1
  },
  {
    id: 32,
    text: "ሳምሶን የናዝራዊነት ምስጢሩንና የኃይሉን መገኛ ፀጉሩን አሳልፎ የነገራት  ሴት ማን ናት?",
    options: ["ሬቤካ", "ኤልዛቤል", "ደሊላ", "ሩት"],
    correctAnswer: 2
  },
  {
    id: 33,
    text: "ኢየሱስ ክርስቶስ መጀመሪያ ተአምራት ያደረገው በየትኛው መንደር ሰርግ ቤት ላይ ነበር?",
    options: ["በቃና ዘገሊላ", "በናዝሬት", "በቤተልሔም", "በኢያሪኮ"],
    correctAnswer: 0
  },
  {
    id: 34,
    text: "ነቢዩ ኤልያስ በሕይወት እያለ ወደ ሰማይ የተወሰደው በምን ክስተት ውስጥ ነበር?",
    options: ["በእሳት ሰረገላና ማዕበል", "በታላቅ ደመና", "በብርሃን ኃይል", "በመልአክ ክንፍ"],
    correctAnswer: 0
  },
  {
    id: 35,
    text: "እስራኤላውያን ከግብፅ ወጥተው በምድረ በዳ ሲጓዙ በቀን ይመራቸው የነበረው ምን  ነበር?",
    options: ["የእሳት አምድ", "የብርሃን አምድ", "የደመና አምድ", "የጭጋግ አምድ"],
    correctAnswer: 2
  },
  {
    id: 36,
    text: "የእስራኤል ልጆች ተስፋይቱን ምድር ለመውረስ መጀመሪያ የተሻገሩት ታዋቂው ወንዝ የትኛው ነው?",
    options: ["የኤፍራጥስ ወንዝ", "የዮርዳኖስ ወንዝ", "የአባይ ወንዝ", "የአባና ወንዝ"],
    correctAnswer: 1
  },
  {
    id: 37,
    text: "ሐዋርያው ጳውሎስ ወደ ደማስቆ ሲጓዝ በታላቅ ብርሃን ተመትቶ የወደቀው ማንን ለማሳደድ ሲሄድ ነበር?",
    options: ["የሮሜ ወታደሮችን", "ፈሪሳውያንን", "የክርስቶስን አማኞች", "አረማውያንን"],
    correctAnswer: 2
  },
  {
    id: 38,
    text: "ለእስማኤል እናት የሆነችው ግብፃዊት ባሪያ ማን ትባላለች?",
    options: ["ኬጡራ", "ሐጋር", "ሊያ", "ሬቤካ"],
    correctAnswer: 1
  },
  {
    id: 39,
    text: "በግድግዳ ላይ የተጻፈውን ምስጢራዊ ጽሕፈት (ማኔ ቴቄል ፋሬስ) የፈታው ነቢይ ማን ነው?",
    options: ["ነቢዩ ኢሳይያስ", "ነቢዩ ኤርምያስ", "ነቢዩ ዳንኤል", "ነቢዩ ሕዝቅኤል"],
    correctAnswer: 2
  },
  {
    id: 40,
    text: "ጴጥሮስ ኢየሱስን ሦስት ጊዜ መካዱን ለማረጋገጥ የጮኸው እንስሳ ምንድን ነው?",
    options: ["እርግብ", "ዶሮ", "አንበሳ", "ንስር"],
    correctAnswer: 1
  }
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

  // Robust Device ID generation
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('deviceId')) {
      const cryptoObj = window.crypto || (window as any).msCrypto;
      const newId = (cryptoObj && cryptoObj.randomUUID) 
        ? cryptoObj.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', newId);
    }
  }, []);

  const totalQuestions = questions.length;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.2;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
      oscillator.stop(audioCtx.currentTime + 0.2);
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  };  

  // On mount: check login and completion status (Redis lock)
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
        const res = await fetch(`/api/check-completed?userId=${encodeURIComponent(deviceId.trim())}&phone=${encodeURIComponent(storedPhone.trim())}`);
        const data = await res.json();
        if (data.completed) {
          setIsBlocked(true);
          setGameState('finished');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Completion check failed:', err);
        setIsLoading(false);
      }
    };

    checkCompletion();
  }, [router]);

  // Fetch competition status for start screen
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

  // Timer effect (only if not blocked)
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null || isBlocked) return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (selectedOption === null) {
            playBeep();   // sound when time runs out
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
    localStorage.setItem('quizStartTime', Date.now().toString());
    if (isBlocked) return;
    setGameState('playing');
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFeedback(null);
    setSaved(false);
    setLeaderboard([]);
  };

  const fetchPublicLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch('/api/leaderboard-public');
      const data = await res.json();
      setPublicLeaderboard(data);
      setShowLeaderboardModal(true);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
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

  const fetchUserRank = async (playerName: string) => {
    try {
      const res = await fetch(`/api/user-rank?name=${encodeURIComponent(playerName)}`);
      const data = await res.json();
      if (data.rank) setUserRank(data.rank);
      else setUserRank(null);
    } catch (err) {
      console.error('Rank fetch error:', err);
    }
  };

  const saveResult = async () => {
    if (saved || isBlocked) return;
    try {
      const telegramUsername = localStorage.getItem('telegramUsername') || '';
      const telegramId = localStorage.getItem('telegramId') || '';
      const deviceId = localStorage.getItem('deviceId') || '';
      const startTime = localStorage.getItem('quizStartTime');
      let duration = 0;
      if (startTime) {
        duration = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        localStorage.removeItem('quizStartTime');
      }
      
      const res = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ventName,
          phone: phone.trim(),
          telegramUsername,
          telegramId,
          userId: deviceId.trim(), // deviceId sent as userId for Redis locks
          score,
          totalQuestions,
          duration,
          answers: questions.map(q => q.correctAnswer)
        })
      });

      if (res.ok) {
        setSaved(true);
        await fetchUserRank(ventName);
        const leaderboardRes = await fetch('/api/leaderboard');
        const data = await leaderboardRes.json();
        setLeaderboard(data);
      } else {
        const errorData = await res.json();
        console.error('Failed to save score:', errorData.error);
        if (errorData.error?.toLowerCase().includes('already taken')) {
          setIsBlocked(true);
        }
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('ventName');
              localStorage.removeItem('phone');
              localStorage.removeItem('telegramUsername');
              localStorage.removeItem('telegramId');
              localStorage.removeItem('quizStartTime');
              router.push('/login');
            }}
            className="mt-6 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300"
          >
            🔄 Logout
          </motion.button>

          {/* View Leaderboard button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchPublicLeaderboard}
            className="mt-2 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300"
          >
            🏆 View Leaderboard
          </motion.button>

          {/* Leaderboard Modal */}
          {showLeaderboardModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-[#090909] to-[#151515] rounded-2xl p-6 max-w-md w-full border border-[#FFD966]/30 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#FFD966]">🏆 Leaderboard</h2>
                  <button onClick={() => setShowLeaderboardModal(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
                </div>
                {loadingLeaderboard ? (
                  <div className="spinner mx-auto my-8"></div>
                ) : publicLeaderboard.length === 0 ? (
                  <p className="text-white/60 text-center py-4">No results yet. Be the first!</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {publicLeaderboard.map((user, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FFD966] font-mono w-6">{idx + 1}</span>
                          <span className="text-white/90">{user.name}</span>
                        </div>
                        <div className="flex gap-4 text-right">
                          <span className="text-[#FFD966] font-bold">
                            {user.score}/{totalQuestions}
                          </span>
                          <span className="text-white/50 text-sm">{formatDuration(user.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
          <div className="spinner mx-auto my-8"></div>
        ) : (
          <div className={`relative mb-8 p-6 rounded-2xl backdrop-blur-sm overflow-hidden ${!competitionActive ? 'bg-red-500/10' : 'bg-[#FFD966]/10'}`}>
            {/* Pulsing background when time is low (less than 10 seconds) */}
            {competitionActive && timeRemaining && parseInt(timeRemaining.match(/\d+/)?.[0] || '999') < 10 && (
              <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
            )}

            <div className="text-center relative z-10">
              <p className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
                {!competitionActive 
                  ? (timeRemaining?.includes('ended') ? 'COMPETITION CLOSED' : 'COUNTDOWN TO START')
                  : 'TIME REMAINING'}
              </p>
              <div className="font-mono font-black text-4xl sm:text-6xl md:text-7xl tracking-tighter text-[#FFD966] drop-shadow-[0_0_15px_rgba(255,217,102,0.5)]">
                {(() => {
                  // Extract the time part (digits, d, h, m, s) from timeRemaining
                  const match = timeRemaining?.match(/[\d\s]*(?:[dhm])?[\d\s]*(?:[dhm])?[\d\s]*(?:[dhm])?/);
                  return match && match[0] ? match[0].trim() : (competitionActive ? 'ACTIVE' : 'INACTIVE');
                })()}
              </div>
              <p className="text-white/40 text-xs mt-3 font-mono">
                {timeRemaining}
              </p>
            </div>
          </div>
        )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('description')}
            disabled={!competitionActive}
            className="bg-[#FFD966] text-[#1e3c2c] px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('ventName');
              localStorage.removeItem('phone');
              localStorage.removeItem('telegramUsername');
              localStorage.removeItem('telegramId');
              localStorage.removeItem('quizStartTime');
              router.push('/login');
            }}
            className="mt-4 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300"
          >
            🔄 Logout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchPublicLeaderboard}
            className="mt-2 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300"
          >
            🏆 View Leaderboard
          </motion.button>
          {showLeaderboardModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-[#090909] to-[#151515] rounded-2xl p-6 max-w-md w-full border border-[#FFD966]/30 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#FFD966]">🏆 Leaderboard</h2>
                  <button onClick={() => setShowLeaderboardModal(false)} className="text-white/60 hover:text-white text-2xl">&times;</button>
                </div>
                {loadingLeaderboard ? (
                  <div className="spinner mx-auto my-8"></div>
                ) : publicLeaderboard.length === 0 ? (
                  <p className="text-white/60 text-center py-4">No results yet. Be the first!</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {publicLeaderboard.map((user, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[#FFD966] font-mono w-6">{idx+1}</span>
                          <span className="text-white/90">{user.name}</span>
                        </div>
                        <div className="flex gap-4 text-right">
                          <span className="text-[#FFD966] font-bold">{user.score}/{totalQuestions}</span>
                          <span className="text-white/50 text-sm">{formatDuration(user.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }
  // Description screen
  if (gameState === 'description') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4"
      >
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md w-full text-center border border-[#FFD966]/30 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#FFD966] mb-4">📖 Before You Begin</h2>
          <div className="text-white/80 space-y-3 text-left mb-6">
            <p>✨ በዛሬው ውድድር <strong className="text-[#FFD966]">{10} የመጽሃፍ ቅዱስ ጥያቄዎች</strong> ይኖሩናል።</p>
            <p>⏱️ ለእያንዳንዱ ጥያቄ <strong className="text-[#FFD966]">30 ሰከንድ</strong> ጊዜ አለዎት።</p>
            <p>🏆 የሚያገኙት ደረጃ ባስመዘገቡት ውጤት እና ውድድሩን ለመጨረስ የወሰዶቦት ጊዜ ይወሰናል።</p>
            <p>🔒 ይህን ጥያቄ <strong className="text-[#FFD966]">አንድ ጊዜ ብቻ</strong> መውሰድ ይችላሉ።</p>
          </div>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                startGame(); // this now sets gameState to 'playing'
              }}
              className="bg-[#FFD966] text-[#1e3c2c] px-6 py-2 rounded-full font-bold"
            >
              ✅ Agree & Start
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameState('start')}
              className="bg-transparent border border-white/30 text-white/70 px-6 py-2 rounded-full text-sm"
            >
              ← Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }
  // Playing screen
  if (gameState === 'playing') {
    const q = questions[currentIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center text-white/80 mb-2">
            <span className={timeLeft <= 5 ? 'text-red-500 font-bold animate-pulse' : ''}>⏱️ {timeLeft}s</span>
            <span>📋 {currentIndex+1}/{totalQuestions}</span>
          </div>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
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
                  {userRank && (
                    <div className="mt-4 pt-2 border-t border-white/10 text-center">
                      🏆 <span className="text-[#FFD966] font-bold">Your Rank: #{userRank}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Share buttons – inside the card, below leaderboard */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-white/50 text-xs text-center mb-3">📢 Share your result</p>
        <div className="flex flex-row justify-center gap-3">
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
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFD966]/10 text-[#FFD966] border border-[#FFD966]/30 hover:bg-[#FFD966]/20 transition flex items-center gap-1"
          >
            📋 Copy Score
          </button>
          <button
            onClick={() => {
              const text = `🎉 I scored ${score}/${totalQuestions} (${Math.round(score/totalQuestions*100)}%) on the Bible Quiz!`;
              const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
              window.open(url, '_blank');
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition flex items-center gap-1"
          >
            📢 Share on Telegram
          </button>
        </div>
      </div>
    </motion.div>
  );
}