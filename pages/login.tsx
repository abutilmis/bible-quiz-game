import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const [ventName, setVentName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [competitionActive, setCompetitionActive] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [telegramUsername, setTelegramUsername] = useState('');
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
        // Immediately update status
        updateStatus();
        // Then set up the interval to update every second
        const interval = setInterval(updateStatus, 1000);
        // Clear interval and stop loading
        setCompetitionLoading(false);
        return () => clearInterval(interval);
      } else {
        // No competition period set – always active
        setCompetitionActive(true);
        setTimeRemaining('📖 Open competition');
        setCompetitionLoading(false);
      }
    })
    .catch(err => {
      console.error('Failed to fetch competition:', err);
      setCompetitionActive(true);
      setTimeRemaining('📖 Open competition (no schedule)');
      setCompetitionLoading(false);
    });
}, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventName.trim() || !phone.trim()) {
      setError('Please fill in both fields');
      return;
    }
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid phone number');
      return;
    }
    localStorage.setItem('ventName', ventName.trim());
    localStorage.setItem('phone', phone.trim());
    localStorage.setItem('telegramUsername', telegramUsername.trim());
    router.push('/');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <img
            src="/vent logo.png"
            alt="Christian Vent Logo"
            className="w-24 h-24 mx-auto mb-4 rounded-full shadow-lg border-2 border-[#FFD966] object-cover"
          />
          <h1 className="text-3xl font-bold text-[#FFD966] tracking-tight">Christian Vent</h1>
          <p className="text-white/50 text-sm mt-1 font-light">Test your Bible knowledge</p>
        </div>
        {competitionLoading ? (
          <div className="flex justify-center my-6">
            <div className="spinner w-10 h-10 border-4 border-[#FFD966]/30 border-t-[#FFD966] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className={`text-center mb-6 p-3 rounded-xl backdrop-blur-sm ${
            !competitionActive 
              ? 'bg-red-500/20 border border-red-500/30 text-red-200' 
              : 'bg-[#FFD966]/10 border border-[#FFD966]/30 text-[#FFD966]'
          }`}>
            <p className="font-mono text-sm md:text-base tracking-wide">
              {timeRemaining || (competitionActive ? '✅ Competition is active! Good luck!' : '❌ No active competition')}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Vent Name</label>
            <input
              type="text"
              value={ventName}
              onChange={(e) => setVentName(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:border-[#FFD966] focus:outline-none transition text-sm font-normal"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:border-[#FFD966] focus:outline-none transition text-sm font-normal"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-1">Telegram Username</label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="@username"
              className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/30 border border-white/20 focus:border-[#FFD966] focus:outline-none transition text-sm font-normal"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-2 rounded text-sm text-center font-light">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!competitionActive}
            className="w-full bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Quiz
          </motion.button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6 font-light">
          Your information is safe and only used for prize notification
        </p>
      </motion.div>
    </div>
  );
}
