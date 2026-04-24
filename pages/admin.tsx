import { useState, useEffect } from 'react';
import { UserResult } from '../types';

const ADMIN_SECRET = 'wOUR/4426/11'; // same as in API

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [competitionStart, setCompetitionStart] = useState('');
  const [competitionEnd, setCompetitionEnd] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchResults();
      fetch('/api/competition')
        .then(res => res.json())
        .then(data => {
          if (data.start) setCompetitionStart(new Date(Number(data.start)).toISOString().slice(0,16));
          if (data.end) setCompetitionEnd(new Date(Number(data.end)).toISOString().slice(0,16));
        })
        .catch(console.error);
    }
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

  const deleteUser = async (name: string, phone: string) => {
    if (!confirm(`Delete ${name} (${phone})?`)) return;
    setDeleting(name);
    try {
      const res = await fetch(`/api/admin/delete-user?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&secret=${ADMIN_SECRET}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert(`Deleted ${name}`);
        fetchResults();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setDeleting(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur p-8 rounded-2xl text-center">
          <h1 className="text-[#FFD966] text-2xl mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 rounded bg-black/50 text-white mb-4 w-full"
            placeholder="Password"
          />
          <button onClick={handleLogin} className="bg-[#FFD966] text-[#1e3c2c] px-4 py-2 rounded w-full">Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  const sorted = [...(results || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sorted.length > 0 ? sorted[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090909] to-[#151515] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#FFD966] mb-6">Admin Dashboard</h1>
        {winner && (
          <div className="bg-white/10 backdrop-blur p-4 md:p-6 rounded-2xl mb-8 border border-[#FFD966]/50">
            <h2 className="text-2xl text-[#FFD966] mb-2">🏆 Winner</h2>
            <p><strong>Name:</strong> {winner.name}</p>
            <p><strong>Phone:</strong> {winner.phone}</p>
            <p><strong>Score:</strong> {winner.score}/{winner.totalQuestions}</p>
            <button onClick={() => window.location.href = `tel:${winner.phone}`} className="mt-4 bg-green-600 px-4 py-2 rounded text-white">📞 Call Winner</button>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur p-6 rounded-2xl mb-8">
          <h2 className="text-xl text-[#FFD966] mb-4">Competition Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 mb-1">Start Time (UTC)</label>
              <input
                type="datetime-local"
                value={competitionStart}
                onChange={(e) => setCompetitionStart(e.target.value)}
                className="w-full p-2 rounded bg-black/50 text-white"
              />
            </div>
            <div>
              <label className="block text-white/80 mb-1">End Time (UTC)</label>
              <input
                type="datetime-local"
                value={competitionEnd}
                onChange={(e) => setCompetitionEnd(e.target.value)}
                className="w-full p-2 rounded bg-black/50 text-white"
              />
            </div>
          </div>
          <button onClick={async () => {
            const secret = 'your-admin-secret'; // must match ADMIN_SECRET in competition.ts
            const res = await fetch('/api/competition', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                secret,
                start: new Date(competitionStart).getTime(),
                end: new Date(competitionEnd).getTime()
              })
            });
            if (res.ok) alert('Competition times saved!');
            else alert('Failed to save');
          }} className="mt-4 bg-[#FFD966] text-[#1e3c2c] px-4 py-2 rounded">
            Save Competition Period
          </button>
        </div>
        {sorted.length === 0 ? (
          <div className="text-white/70 text-center p-8">No results yet. Share the quiz link with users!</div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-xl">
            <table className="w-full text-white border-collapse bg-black/30 rounded-xl overflow-hidden">
              <thead className="bg-black/50">
                <tr>
                  <th className="p-3 border border-white/20">Rank</th>
                  <th className="p-3 border border-white/20">Name</th>
                  <th className="p-3 border border-white/20">Phone</th>
                  <th className="p-3 border border-white/20">Score</th>
                  <th className="p-3 border border-white/20">%</th>
                  <th className="p-3 border border-white/20">Date</th>
                  <th className="p-3 border border-white/20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((user, idx) => (
                  <tr key={user.id} className={idx === 0 ? 'bg-yellow-900/30' : 'hover:bg-white/5'}>
                    <td className="p-3 border border-white/10">{idx + 1}</td>
                    <td className="p-3 border border-white/10">{user.name}</td>
                    <td className="p-3 border border-white/10">{user.phone}</td>
                    <td className="p-3 border border-white/10">{user.score}/{user.totalQuestions}</td>
                    <td className="p-3 border border-white/10">{user.percentage}%</td>
                    <td className="p-3 border border-white/10">{new Date(user.timestamp).toLocaleString()}</td>
                    <td className="p-3 border border-white/10">
                      <button
                        onClick={() => deleteUser(user.name, user.phone)}
                        disabled={deleting === user.name}
                        className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {deleting === user.name ? '...' : '🗑 Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}