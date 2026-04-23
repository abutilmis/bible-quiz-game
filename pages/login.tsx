import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [ventName, setVentName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('ventName');
    const savedPhone = localStorage.getItem('phone');
    if (savedName && savedPhone) {
      router.push('/');
    }
  }, [router]);

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
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-md w-full border border-[#FFD966]/30 shadow-xl">
        <div className="text-center mb-8">
          <img
            src="/vent logo.png"
            alt="Christian Vent Logo"
            className="w-28 h-28 mx-auto mb-4 rounded-full shadow-lg border-2 border-[#FFD966] object-cover"
          />
          <div className="text-5xl mb-2">📖</div>
          <h1 className="text-3xl font-bold text-[#FFD966]">Christian Vent</h1>
          <p className="text-white/70 mt-2">Test your Bible knowledge</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white/80 mb-1 text-sm font-medium">Vent Name</label>
            <input
              type="text"
              value={ventName}
              onChange={(e) => setVentName(e.target.value)}
              placeholder="e.g., FaithfulServant"
              className="w-full p-3 rounded-xl bg-black/30 text-white placeholder-white/50 border border-white/10 focus:border-[#FFD966] focus:outline-none transition"
            />
            <p className="text-white/50 text-xs mt-1">This is how you will appear anonymously</p>
          </div>

          <div>
            <label className="block text-white/80 mb-1 text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., +251912345678"
              className="w-full p-3 rounded-xl bg-black/30 text-white placeholder-white/50 border border-white/10 focus:border-[#FFD966] focus:outline-none transition"
            />
            <p className="text-white/50 text-xs mt-1">We'll contact you if you win a prize</p>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#FFD966] text-[#1e3c2c] py-3 rounded-full font-bold text-lg hover:scale-105 transition"
          >
            Start Quiz
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          Your information is safe and only used for prize notification
        </p>
      </div>
    </div>
  );
}