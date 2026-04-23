import { useState, useEffect } from 'react';

interface UserResult {
  id: string;
  name: string;
  phone: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: number;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authenticated) fetchResults();
  }, [authenticated]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/get-results');
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (password === 'admin123') setAuthenticated(true);
    else alert('Wrong password');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur p-8 rounded-2xl text-center">
          <h1 className="text-[#FFD966] text-2xl mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-black/50 text-white"
            placeholder="Password"
          />
          <button onClick={handleLogin} className="ml-2 bg-[#FFD966] text-[#1e3c2c] px-4 py-2 rounded">Login</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-white p-8 text-center">Loading results...</div>;

  const sorted = [...(results || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted.length > 0 ? sorted[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c2c] to-[#2a4a35] p-8">
      <h1 className="text-3xl font-bold text-[#FFD966] mb-6">Admin Dashboard</h1>
      {winner && (
        <div className="bg-white/10 backdrop-blur p-6 rounded-2xl mb-8 border border-[#FFD966]/50">
          <h2 className="text-2xl text-[#FFD966] mb-2">🏆 Winner</h2>
          <p><strong>Name:</strong> {winner.name}</p>
          <p><strong>Phone:</strong> {winner.phone}</p>
          <p><strong>Score:</strong> {winner.score}/{winner.totalQuestions}</p>
          <button onClick={() => window.location.href = `tel:${winner.phone}`} className="mt-4 bg-green-600 px-4 py-2 rounded text-white">📞 Call Winner</button>
        </div>
      )}
      {sorted.length === 0 ? (
        <div className="text-white/70 text-center p-8">No results yet. Share the quiz link with users!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-white border-collapse">
            <thead className="bg-black/30">
              <tr>
                <th className="p-3 border">Rank</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Score</th>
                <th className="p-3 border">%</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((user, idx) => (
                <tr key={user.id} className={idx === 0 ? 'bg-yellow-900/30' : ''}>
                  <td className="p-3 border">{idx + 1}</td>
                  <td className="p-3 border">{user.name}</td>
                  <td className="p-3 border">{user.phone}</td>
                  <td className="p-3 border">{user.score}/{user.totalQuestions}</td>
                  <td className="p-3 border">{user.percentage}%</td>
                  <td className="p-3 border">{new Date(user.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
