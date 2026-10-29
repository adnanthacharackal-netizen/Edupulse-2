// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database,
} from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, isLive } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [major, setMajor] = useState('B.S. Computer Science');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Logged in successfully!');
          setTimeout(() => navigate('/'), 800);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Full name is required to create an account.');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          role: selectedRole,
          student_id: selectedRole === 'student' ? studentId || 'STU-2024' : null,
          major: selectedRole === 'student' ? major : 'Faculty Staff',
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage(
            isLive
              ? 'Account created! Please check your email to confirm registration or sign in.'
              : 'Account registered successfully!'
          );
          setTimeout(() => navigate('/'), 1200);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Supabase Connection Status Banner */}
      <div className={`connection-status-card ${isLive ? 'status-live' : 'status-demo'}`}>
        <div className="status-icon-box">
          <Database size={18} />
        </div>
        <div className="status-text-box">
          <h4>
            {isLive ? '🟢 Connected to Live Supabase' : '🟡 Offline / Demo Mode Active'}
          </h4>
          <p>
            {isLive
              ? 'Your app is authenticated directly with your remote PostgreSQL Supabase database using Row Level Security (RLS).'
              : 'Add your real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable cloud synchronization. In the meantime, you can test student and staff roles right here!'}
          </p>
        </div>
      </div>

      <div className="auth-card">
        {/* Card Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome back to EduPulse' : 'Create EduPulse Account'}
          </h2>
          <p className="auth-desc">
            {mode === 'login'
              ? 'Sign in with your university credentials'
              : 'Register as a Student or Authorized Staff member'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
          >
            Register
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="form-error-banner" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="feedback-toast" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Select Your Role</label>
                <div className="radio-pill-group">
                  <label className={`radio-pill ${selectedRole === 'student' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={selectedRole === 'student'}
                      onChange={() => setSelectedRole('student')}
                    />
                    <GraduationCap size={16} />
                    <span>Student</span>
                  </label>

                  <label className={`radio-pill ${selectedRole === 'staff' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={selectedRole === 'staff'}
                      onChange={() => setSelectedRole('staff')}
                    />
                    <ShieldCheck size={16} />
                    <span>Authorized Staff</span>
                  </label>
                </div>
                <p className="auth-role-hint">
                  {selectedRole === 'student'
                    ? '🔒 Students can only view their own private records, attendance, and coursework submissions.'
                    : '🛡️ Authorized staff can record attendance, manage timetables, and publish announcements.'}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">
                  Full Name <span className="required-star">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    className="form-input auth-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {selectedRole === 'student' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-stu-id">
                      Student ID
                    </label>
                    <input
                      id="auth-stu-id"
                      type="text"
                      placeholder="e.g. STU-2024-8842"
                      className="form-input"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="auth-major">
                      Degree Major
                    </label>
                    <input
                      id="auth-major"
                      type="text"
                      placeholder="e.g. B.S. Computer Science"
                      className="form-input"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="name@university.edu"
                className="form-input auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                className="form-input auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-action auth-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Helper Hint */}
        {!isLive && (
          <div className="auth-demo-hint-box">
            <p className="demo-hint-title">💡 Quick Testing Tip in Demo Mode:</p>
            <p className="demo-hint-text">
              Type any email containing <code>staff</code> (e.g. <code>staff@university.edu</code>) to sign in as <strong>Authorized Staff</strong>, or any other email for <strong>Student</strong> mode.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
