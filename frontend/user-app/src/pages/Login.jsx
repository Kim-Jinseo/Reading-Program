import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, pin })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        navigate('/map');
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to server.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sky-100 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-sky-400 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Sparkles size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Stepping Stones</h1>
        <p className="text-slate-500 font-medium mb-8">Welcome! 欢迎!</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <input 
            type="text" value={username} onChange={e => setUsername(e.target.value)} required
            placeholder="Name (名字)" 
            className="w-full text-center text-lg p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:outline-none"
          />
          <input 
            type="text" style={{ WebkitTextSecurity: 'disc' }} value={pin} onChange={e => setPin(e.target.value)} required
            placeholder="PIN Code (密码)" maxLength={4} pattern="\d*"
            className="w-full text-center text-2xl tracking-widest p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-400 focus:outline-none"
          />
          <button disabled={loading} type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xl py-4 rounded-2xl transition-all shadow-md active:scale-95 mt-4">
            {loading ? 'Loading...' : 'Start Learning!'}
          </button>
        </form>
      </div>
    </div>
  );
}