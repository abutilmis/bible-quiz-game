import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/router';
import { Question } from '../types';
import {
  LogOut, Trophy, BookOpen, Star, Clock, Lock,
  CheckCircle, ChevronLeft, ChevronRight, CheckCircle2,
  XCircle, Lightbulb, Copy, Send, Share2
} from 'lucide-react';

const questions: Question[] = [
  {
    id: 1,
    book: "ዘፍጥረት",
    question: "ያዕቆብ ከኤሳው ፊት ከመድረሱ በፊት ሌሊቱን ሙሉ ከሰው (ከመልአክ) ጋር የታገለበትና ስሙ ወደ 'እስራኤል' የተለወጠበት ቦታ ምን ይባላል?",
    options: ["ቤቴል", "ጵኑኤል", "ሴኬም", "ኬብሮን"],
    correctIndex: 1,
    explanation: "በዘፍጥረት 32:30 መሠረት ያዕቆብ «እግዚአብሔርን ፊት ለፊት አየሁ፥ ነፍሴም ድና ቀረች» ሲል የዚያን ቦታ ስም 'ጵኑኤል' ብሎ ጠራው።"
  },
  {
    id: 2,
    book: "ዘፀአት",
    question: "በግብፅ ላይ ከወረዱት አሥር መቅሠፍቶች መካከል እስራኤላውያን ከሚኖሩበት ከጌሴም ምድር ሳይደርስ የግብፅን ምድር ብቻ መምታት የጀመረው የመጀመሪያው መቅሠፍት የትኛው ነበር?",
    options: ["የደም መቅሠፍት", "የእንቁራሪት መቅሠፍት", "የበረዶና የእሳት መቅሠፍት", "የዝንብ መንጋ መቅሠፍት"],
    correctIndex: 3,
    explanation: "በዘፀአት 8:22-23 መሠረት እግዚአብሔር ከ4ኛው መቅሠፍት ከነበረው የዝንብ መንጋ የጌሴምን ምድር ለይቶ ነበር።"
  },
  {
    id: 3,
    book: "ዘኍልቍ",
    question: "በእስራኤላውያን ማጉረምረም ምክንያት የተላኩትን እባቦች ለመከላከል ሙሴ በዓላማ ላይ የሰቀለው የእባብ ምስል ከምን የተሠራ ነበር?",
    options: ["ከወርቅ", "ከብር", "ከናስ", "ከብረት"],
    correctIndex: 2,
    explanation: "በዘኍልቍ 21:9 መሠረት ሙሴ የናስ እባብ ሠርቶ በዓላማ ላይ ሰቀለ፤ የተነደፈውም ሁሉ የናሱን እባብ ባየ ጊዜ ይድን ነበር።"
  },
  {
    id: 4,
    book: "መጽሐፈ ሩት",
    question: "የሩት ባል የነበረው ቦዔዝ የንጉሥ ዳዊት ምን ነበር?",
    options: ["አባቱ", "አያቱ", "ቅድመ አያቱ", "ታላቅ ወንድሙ"],
    correctIndex: 2,
    explanation: "በሩት 4:21-22 መሠረት ቦዔዝ ኢዮቤድ ወለደ፤ ኢዮቤድም እሴይን ወለደ፤ እሴይም ዳዊትን ወለደ። ስለዚህ ቦዔዝ የዳዊት ቅድመ አያት ነው።"
  },
  {
    id: 5,
    book: "1 ነገሥት",
    question: "ነቢዩ ኤልያስ በቀርሜሎስ ተራራ ላይ ከበኣል ነቢያት ጋር በተፎካከረ ጊዜ ስንት የበኣል ነቢያት ተሰብስበው ነበር?",
    options: ["100", "300", "450", "850"],
    correctIndex: 2,
    explanation: "በ1 ነገሥት 18:19 መሠረት ኤልያስ 450 የበኣል ነቢያትንና 400 የማምለክያ አጸድን ነቢያትን ወደ ቀርሜሎስ ተራራ እንዲሰበሰቡ አዘዘ።"
  },
  {
    id: 6,
    book: "መጽሐፈ ኢዮብ",
    question: "ኢዮብን በመውቀስ ከተናገሩት ሦስት ወዳጆቹ ይልቅ በእድሜ ታናሽ ሆኖ በጽኑ የተናገረው አራተኛው ሰው ማን ነበር?",
    options: ["ኤልፋዝ", "በልዳዶስ", "ሶፋር", "ኤሊሁ"],
    correctIndex: 3,
    explanation: "በኢዮብ 32:2-6 መሠረት ኤሊሁ በዕድሜ ታናሽ ስለነበር ሽማግሌዎቹ ተናግረው እስኪጨርሱ ታግሦ ከቆየ በኋላ በቁጣ ተናገረ።"
  },
  {
    id: 7,
    book: "ሉቃስ",
    question: "ኢየሱስ ወንጌልን እንዲሰብኩና ታምራት እንዲያደርጉ በጥንድ በጥንድ የላካቸው ስንት ደቀ መዛሙርት ነበሩ?",
    options: ["12", "70", "120", "500"],
    correctIndex: 1,
    explanation: "በሉቃስ 10:1 መሠረት ጌታ ሌሎች ሰባ (70) ደቀ መዛሙርትን ደግሞ መረጠ፥ እርሱም ሊሄድበት ባለው ከተማና ስፍራ ሁሉ ሁለት ሁለት አድርጎ በፊቱ ላካቸው።"
  },
  {
    id: 8,
    book: "የሐዋርያት ሥራ",
    question: "በአንጾኪያ ከተማ አማኞች ለመጀመሪያ ጊዜ 'ክርስቲያን' ተብለው በተጠሩበት ጊዜ ጳውሎስና በርናባስ በዚያ ለምን ያህል ጊዜ ቆይተው አስተማሩ?",
    options: ["አንድ ወር", "ሦስት ወር", "አንድ ዓመት", "ሦስት ዓመት"],
    correctIndex: 2,
    explanation: "በየሐዋርያት ሥራ 11:26 መሠረት በቤተ ክርስቲያኒቱ ሙሉ ዓመት ተሰበሰቡ፥ ብዙ ሕዝብንም አስተማሩ፤ ደቀ መዛሙርቱም ለመጀመሪያ ጊዜ በአንጾኪያ 'ክርስቲያን' ተባሉ።"
  },
  {
    id: 9,
    book: "2 ቆሮንቶስ",
    question: "ሐዋርያው ጳውሎስ እንዳይታበይ በሥጋው ላይ የተሰጠው 'የሥጋ መውጊያ' እንዲወገድለት ጌታን ስንት ጊዜ ለመነ?",
    options: ["አንድ ጊዜ", "ሦስት ጊዜ", "ሰባት ጊዜ", "አርባ ጊዜ"],
    correctIndex: 1,
    explanation: "በ2 ቆሮንቶስ 12:8 መሠረት ጳውሎስ «ስለዚህ ነገር ከእኔ እንዲለይ ሦስት ጊዜ ጌታን ለመንሁ» ብሏል።"
  },
  {
    id: 10,
    book: "የዮሐንስ ራእይ",
    question: "በራእይ ምዕራፍ 12 ላይ በሰማይ በተደረገው ጦርነት ዘንዶውን ድል አድርጎ ወደ ምድር የጣለው መላእክት አለቃ ማን ነው?",
    options: ["ገብርኤል", "ሚካኤል", "ሱራፌል", "ሩፋኤል"],
    correctIndex: 1,
    explanation: "በራእይ 12:7-9 መሠረት በሰማይ ጦርነት ሆነ፤ ሚካኤልና መላእክቱ ዘንዶውን ተዋጉት፥ ድልም አደረጉት።"
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
  const [blockedReason, setBlockedReason] = useState<'finished' | 'no-progress'>('finished');
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [startError, setStartError] = useState('');
  // Absolute timestamp (ms) at which the current question's 30s timer
  // expires. Storing an absolute deadline — instead of just a "seconds
  // left" counter — is what lets the timer resume correctly after a
  // refresh: we recompute time left from `deadline - Date.now()` rather
  // than always resetting to 30.
  const [deadline, setDeadline] = useState<number | null>(null);

  const QUESTION_SECONDS = 30;

  type QuizProgress = {
    currentIndex: number;
    score: number;
    deadline: number;
    selectedOption?: number | null;
    feedback?: 'correct' | 'wrong' | null;
  };

  const saveProgress = (progress: QuizProgress) => {
    try {
      localStorage.setItem('quizProgress', JSON.stringify(progress));
    } catch (e) { }
  };

  const clearProgress = () => {
    localStorage.removeItem('quizProgress');
    localStorage.removeItem('quizStartTime');
  };

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

  const countdownParts = (() => {
    const match = timeRemaining?.match(/(\d+)d\s+(\d+)h\s+(\d+)m\s+(\d+)s/);
    if (!match) return null;
    return {
      days: match[1],
      hours: match[2],
      minutes: match[3],
      seconds: match[4],
    };
  })();

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
    } catch (e) { }
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

        if (data.submitted) {
          // Genuinely finished and saved — nothing to resume, block as before.
          setBlockedReason('finished');
          setIsBlocked(true);
          setGameState('finished');
          setIsLoading(false);
          return;
        }

        if (data.started) {
          // The one-time attempt lock was already claimed (quiz was started
          // at some point) but never submitted. If we have saved progress
          // for it in this browser, this is almost certainly the same user
          // refreshing or coming back mid-quiz — resume exactly where they
          // left off instead of locking them out.
          let progress: QuizProgress | null = null;
          try {
            const raw = localStorage.getItem('quizProgress');
            if (raw) progress = JSON.parse(raw);
          } catch (e) { progress = null; }

          if (progress && typeof progress.currentIndex === 'number' && progress.currentIndex < totalQuestions) {
            setScore(progress.score || 0);
            setCurrentIndex(progress.currentIndex);
            setDeadline(progress.deadline);
            const remaining = Math.max(0, Math.ceil((progress.deadline - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (progress.feedback) {
              // Question was already answered before the refresh — restore
              // that answer instead of letting them pick again.
              setSelectedOption(progress.selectedOption ?? null);
              setFeedback(progress.feedback);
            } else {
              setSelectedOption(null);
              // If time had already run out while the tab was closed, show
              // the timeout feedback immediately so the user can hit Next.
              setFeedback(remaining <= 0 ? 'wrong' : null);
            }
            setGameState('playing');
          } else {
            // Attempt was claimed, but this browser/device has no local
            // record of it (e.g. cleared site data, or a genuine second
            // attempt from elsewhere) — we can't safely resume, so fall
            // back to the lockout, with a message that distinguishes this
            // case from "you already finished."
            setBlockedReason('no-progress');
            setIsBlocked(true);
            setGameState('finished');
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Completion check failed:', err);
        setIsLoading(false);
      }
    };

    checkCompletion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Timer effect (only if not blocked). Ticks off the absolute `deadline`
  // timestamp rather than counting down a fixed 30 from scratch, so that a
  // page refresh — which remounts this effect — recomputes the correct
  // remaining time instead of granting a fresh 30s every time.
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null || isBlocked || deadline === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        playBeep();   // sound when time runs out
        setFeedback('wrong');
      }
    };

    tick(); // set immediately so the UI doesn't flash a stale value
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentIndex, feedback, isBlocked, deadline]);

  const nextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      const nextIndex = currentIndex + 1;
      const nextDeadline = Date.now() + QUESTION_SECONDS * 1000;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setFeedback(null);
      setDeadline(nextDeadline);
      saveProgress({ currentIndex: nextIndex, score, deadline: nextDeadline });
    } else {
      clearProgress();
      setGameState('finished');
    }
  };

  const startGame = async () => {
    if (isBlocked || startingQuiz) return;
    setStartingQuiz(true);
    setStartError('');
    try {
      const deviceId = localStorage.getItem('deviceId') || '';
      const res = await fetch('/api/start-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deviceId.trim(), phone: phone.trim() })
      });

      if (!res.ok) {
        // This phone/device already has an attempt in progress or finished
        // (started earlier and refreshed, or genuinely already played) —
        // lock them out the same way a finished quiz would.
        setIsBlocked(true);
        setGameState('finished');
        return;
      }

      const startDeadline = Date.now() + QUESTION_SECONDS * 1000;
      localStorage.setItem('quizStartTime', Date.now().toString());
      saveProgress({ currentIndex: 0, score: 0, deadline: startDeadline });
      setGameState('playing');
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setFeedback(null);
      setDeadline(startDeadline);
      setSaved(false);
      setLeaderboard([]);
    } catch (err) {
      console.error('Failed to start quiz attempt:', err);
      setStartError('Could not start the quiz — check your connection and try again.');
    } finally {
      setStartingQuiz(false);
    }
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
    const isCorrect = selectedOption === questions[currentIndex].correctIndex;
    const newFeedback = isCorrect ? 'correct' : 'wrong';
    setFeedback(newFeedback);
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    if (deadline !== null) {
      saveProgress({ currentIndex, score: newScore, deadline, selectedOption, feedback: newFeedback });
    }
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
      }
      // Quiz is done being played at this point (win, lose, or timed out on
      // the last question) — no more progress to resume, so clear it.
      clearProgress();

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
          answers: questions.map(q => q.correctIndex)
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
          <p className="text-white/80">
            {blockedReason === 'finished'
              ? "You've already completed this quiz. Please contact the admin if you believe this is an error."
              : "It looks like you already started this quiz, but we couldn't find your progress on this browser/device (site data may have been cleared). Please contact the admin if you'd like your attempt reset."}
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('ventName');
              localStorage.removeItem('phone');
              localStorage.removeItem('telegramUsername');
              localStorage.removeItem('telegramId');
              clearProgress();
              router.push('/login');
            }}
            className="mt-6 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>

          {/* View Leaderboard button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchPublicLeaderboard}
            className="mt-2 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" /> View Leaderboard
          </motion.button>

          {/* Leaderboard Modal */}
          {showLeaderboardModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-[#090909] to-[#151515] rounded-2xl p-6 max-w-md w-full border border-[#FFD966]/30 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#FFD966] flex items-center gap-2"><Trophy className="w-5 h-5" /> Leaderboard</h2>
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
            <div className={`relative mb-8 overflow-hidden rounded-[2.2rem] border border-[#FFD966]/40 bg-[radial-gradient(circle_at_top_left,_rgba(255,217,102,0.18),_transparent_40%),linear-gradient(135deg,_#191919_0%,_#0d0d0d_100%)] p-5 shadow-[0_0_45px_rgba(255,217,102,0.2)] backdrop-blur-2xl ${!competitionActive ? 'border-red-500/30 bg-red-500/10' : ''}`}>
              {/* Pulsing background when time is low (less than 10 seconds) */}
              {competitionActive && timeRemaining && parseInt(timeRemaining.match(/\d+/)?.[0] || '999') < 10 && (
                <div className="absolute inset-0 animate-pulse bg-red-500/20" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_50%,transparent_100%)] opacity-70" />
              <div className="absolute -top-14 right-8 h-28 w-28 rounded-full bg-[#FFD966]/20 blur-3xl" />
              <div className="absolute bottom-0 left-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

              <div className="relative z-10 text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FFD966]/20 bg-[#FFD966]/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#FFD966] shadow-[0_0_18px_rgba(255,217,102,0.15)]">
                  <span className="h-2 w-2 rounded-full bg-[#FFD966] animate-pulse" />
                  {!competitionActive
                    ? (timeRemaining?.includes('ended') ? 'Competition Closed' : 'Countdown To Start')
                    : 'Time Remaining'}
                </div>

                {countdownParts ? (
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                    {[
                      { label: 'Days', value: countdownParts.days },
                      { label: 'Hours', value: countdownParts.hours },
                      { label: 'Minutes', value: countdownParts.minutes },
                      { label: 'Seconds', value: countdownParts.seconds },
                    ].map((unit) => (
                      <div key={unit.label} className="min-w-[70px] flex-1 rounded-[1.05rem] border border-[#FFD966]/20 bg-[#0e0e0e]/80 px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:min-w-[90px] sm:px-4 sm:py-5">
                        <div className="font-mono text-3xl font-black leading-none tracking-[0.15em] text-transparent bg-gradient-to-br from-[#fff7d2] via-[#FFD966] to-[#b98200] bg-clip-text drop-shadow-[0_0_22px_rgba(255,217,102,0.35)] sm:text-5xl lg:text-6xl">
                          {unit.value}
                        </div>
                        <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.25em] text-white/55 sm:mt-2 sm:text-[10px]">
                          {unit.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.25rem] border border-[#FFD966]/20 bg-[#0e0e0e]/80 px-6 py-6 text-3xl font-black tracking-[0.2em] text-[#FFD966] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:text-4xl">
                    {competitionActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                )}
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState('description')}
            disabled={!competitionActive}
            className="bg-[#FFD966] text-[#1e3c2c] px-8 py-3 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <BookOpen className="w-6 h-6" /> Start Quiz
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('ventName');
              localStorage.removeItem('phone');
              localStorage.removeItem('telegramUsername');
              localStorage.removeItem('telegramId');
              clearProgress();
              router.push('/login');
            }}
            className="mt-4 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchPublicLeaderboard}
            className="mt-2 w-full md:w-auto px-6 py-2 rounded-full text-sm font-medium bg-transparent border border-[#FFD966]/50 text-[#FFD966] hover:bg-[#FFD966]/10 transition-all duration-300 inline-flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" /> View Leaderboard
          </motion.button>
          {/* Leaderboard Modal */}
          {showLeaderboardModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-[#090909] to-[#151515] rounded-2xl p-6 max-w-md w-full border border-[#FFD966]/30 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#FFD966] flex items-center gap-2"><Trophy className="w-5 h-5" /> Leaderboard</h2>
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
          <h2 className="text-2xl font-bold text-[#FFD966] mb-4 flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" /> Before You Begin
          </h2>
          <div className="text-white/80 space-y-3 text-left mb-6">
            <p className="flex items-start gap-2"><Star className="w-5 h-5 text-[#FFD966] shrink-0 mt-0.5" /> <span>በዛሬው ውድድር <strong className="text-[#FFD966]">{10} የመጽሃፍ ቅዱስ ጥያቄዎች</strong> ይኖሩናል።</span></p>
            <p className="flex items-start gap-2"><Clock className="w-5 h-5 text-[#FFD966] shrink-0 mt-0.5" /> <span>ለእያንዳንዱ ጥያቄ <strong className="text-[#FFD966]">30 ሰከንድ</strong> ጊዜ አለዎት።</span></p>
            <p className="flex items-start gap-2"><Trophy className="w-5 h-5 text-[#FFD966] shrink-0 mt-0.5" /> <span>የሚያገኙት ደረጃ ባስመዘገቡት ውጤት እና ውድድሩን ለመጨረስ የወሰዶቦት ጊዜ ይወሰናል።</span></p>
            <p className="flex items-start gap-2"><Lock className="w-5 h-5 text-[#FFD966] shrink-0 mt-0.5" /> <span>ይህን ጥያቄ <strong className="text-[#FFD966]">አንድ ጊዜ ብቻ</strong> መውሰድ ይችላሉ።</span></p>
          </div>
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: startingQuiz ? 1 : 1.02 }}
              whileTap={{ scale: startingQuiz ? 1 : 0.98 }}
              onClick={() => {
                startGame(); // claims the one-time attempt lock, then sets gameState to 'playing'
              }}
              disabled={startingQuiz}
              className="bg-[#FFD966] text-[#1e3c2c] px-6 py-2 rounded-full font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" /> {startingQuiz ? 'Starting...' : 'Agree & Start'}
            </motion.button>
            {startError && (
              <p className="text-red-400 text-sm">{startError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGameState('start')}
              className="bg-transparent border border-white/30 text-white/70 px-6 py-2 rounded-full text-sm flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back
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
            <span className={`flex items-center gap-1 ${timeLeft <= 5 ? 'text-red-500 font-bold animate-pulse' : ''}`}>
              <Clock className="w-4 h-4" /> {timeLeft}s
            </span>
            <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> {currentIndex + 1}/{totalQuestions}</span>
          </div>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 border border-[#FFD966]/30 shadow-xl"
          >
            <div className="text-[#FFD966] text-sm font-bold mb-2 tracking-wider uppercase">{q.book}</div>
            <div className="text-white text-xl md:text-2xl font-semibold mb-6">{q.question}</div>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition ${feedback !== null
                    ? idx === q.correctIndex
                      ? 'bg-green-500/30 border-green-500 text-white font-bold'
                      : selectedOption === idx
                        ? 'bg-red-500/30 border-red-500 text-white font-bold'
                        : 'bg-black/30 border-transparent text-white'
                    : selectedOption === idx
                      ? 'bg-[#FFD966] border-[#FFD966] text-[#1e3c2c] font-bold'
                      : 'bg-black/30 border-transparent text-white hover:bg-black/50'
                    }`}
                  disabled={feedback !== null}
                >
                  {String.fromCharCode(65 + idx)}. {opt}
                </motion.button>
              ))}
            </div>

            {!feedback && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnswer}
                disabled={selectedOption === null}
                className="w-full mt-6 bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-bold disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Submit
              </motion.button>
            )}
          </motion.div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6"
              >
                <div
                  className={`text-center text-2xl font-bold mb-4 flex items-center justify-center gap-2 ${feedback === 'correct' ? 'text-green-400' : 'text-red-400'
                    }`}
                >
                  {feedback === 'correct' ? <><CheckCircle2 className="w-8 h-8" /> Correct!</> : <><XCircle className="w-8 h-8" /> Wrong!</>}
                </div>

                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 mb-6 shadow-lg backdrop-blur-md">
                  <h3 className="text-[#FFD966] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" /> Explanation
                  </h3>
                  <p className="text-white/90 leading-relaxed text-sm md:text-base">{q.explanation}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextQuestion}
                  className="w-full bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-bold transition shadow-[0_0_15px_rgba(255,217,102,0.3)] hover:shadow-[0_0_25px_rgba(255,217,102,0.5)] flex items-center justify-center gap-2"
                >
                  {currentIndex + 1 < totalQuestions ? <><ChevronRight className="w-5 h-5" /> Next Question</> : <><Trophy className="w-5 h-5" /> View Results</>}
                </motion.button>
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
        <div className="text-white/70 mb-6">{Math.round(score / totalQuestions * 100)}%</div>
        {!saved ? (
          <div className="spinner mx-auto my-4 w-6 h-6 border-2 border-t-2"></div>
        ) : (
          <>
            <p className="text-green-400 mb-4 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Your score has been recorded!</p>
            {leaderboard.length > 0 && (
              <div className="mt-6 text-left bg-black/20 rounded-xl p-4">
                <h3 className="text-[#FFD966] font-bold text-xl mb-2 text-center flex items-center justify-center gap-2"><Trophy className="w-5 h-5" /> Top Players</h3>
                <div className="space-y-1">
                  {leaderboard.map((user, idx) => (
                    <div key={idx} className="text-white/80 flex justify-between text-sm md:text-base">
                      <span>{idx + 1}. {user.name}</span>
                      <span>{user.score} pts</span>
                    </div>

                  ))}
                  {userRank && (
                    <div className="mt-4 pt-2 border-t border-white/10 text-center flex items-center justify-center gap-2">
                      <Trophy className="w-4 h-4 text-[#FFD966]" /> <span className="text-[#FFD966] font-bold">Your Rank: #{userRank}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* Share buttons – inside the card, below leaderboard */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/50 text-xs text-center mb-3 flex items-center justify-center gap-1"><Share2 className="w-3 h-3" /> Share your result</p>
          <div className="flex flex-row justify-center gap-3">
            <button
              onClick={() => {
                const message = `🎉 I scored ${score}/${totalQuestions} (${Math.round(score / totalQuestions * 100)}%) on the Bible Quiz!\n\nTake the challenge: ${window.location.origin}`;
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
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#FFD966]/10 text-[#FFD966] border border-[#FFD966]/30 hover:bg-[#FFD966]/20 transition flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy Score
            </button>
            <button
              onClick={() => {
                const text = `🎉 I scored ${score}/${totalQuestions} (${Math.round(score / totalQuestions * 100)}%) on the Bible Quiz!`;
                const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#0088cc]/10 text-[#0088cc] border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Share on Telegram
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}