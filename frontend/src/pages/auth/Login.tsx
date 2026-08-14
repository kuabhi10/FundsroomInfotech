import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import api from '../../api/axios';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, token, setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', width: '100%' }} 
      className="flex items-center justify-center font-sans p-4"
    >
      <div 
        style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#161616' }} 
        className="p-8 border rounded-sm shadow-md max-w-md w-full"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <span 
            style={{ color: '#0f62fe', fontVariationSettings: "'FILL' 1" }} 
            className="material-symbols-outlined text-4xl mb-2"
          >
            dataset
          </span>
          <h1 style={{ color: '#161616' }} className="text-2xl font-bold tracking-tight">
            Carbon ERP
          </h1>
          <p style={{ color: '#525252' }} className="text-sm mt-1">
            Sign in to your account
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label style={{ color: '#525252' }} className="block text-xs font-semibold uppercase tracking-wider">
              Email
            </label>
            <input 
              type="email" 
              required
              style={{ backgroundColor: '#ffffff', color: '#161616', borderColor: '#e0e0e0' }}
              className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@erp.local"
            />
          </div>
          <div className="space-y-1">
            <label style={{ color: '#525252' }} className="block text-xs font-semibold uppercase tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              required
              style={{ backgroundColor: '#ffffff', color: '#161616', borderColor: '#e0e0e0' }}
              className="w-full border px-3 py-2 text-sm rounded focus:outline-none focus:border-[#0f62fe] focus:ring-1 focus:ring-[#0f62fe]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ backgroundColor: '#0f62fe', color: '#ffffff' }}
            className="w-full font-medium px-5 py-2.5 rounded hover:opacity-90 transition-opacity flex items-center justify-center h-10 mt-6 shadow-sm disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
