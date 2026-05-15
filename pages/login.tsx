import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter(); 
  const [ventName, setVentName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');

  // Ensure deviceId is generated on first load with robust fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('deviceId')) {
      const cryptoObj = window.crypto || (window as any).msCrypto;
      const newId = (cryptoObj && cryptoObj.randomUUID) 
        ? cryptoObj.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', newId);
    }
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

    // Double check deviceId exists before proceeding
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      const cryptoObj = window.crypto || (window as any).msCrypto;
      deviceId = (cryptoObj && cryptoObj.randomUUID) 
        ? cryptoObj.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', deviceId);
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        localStorage.setItem('telegramId', user.id.toString());
      }
    }
    
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
            className="w-full bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition"
          >
            Login
          </motion.button>
        </form>

        <p className="text-center text-white/30 text-xs mt-6 font-light">
          Your information is safe and only used for prize notification
        </p>
      </motion.div>
    </div>
  );
}