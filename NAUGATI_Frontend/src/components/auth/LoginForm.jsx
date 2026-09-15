import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setIsLoading(true);
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError("Incorrect email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error("Google login failed:", error);
      setAuthError("Could not authenticate with Google.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setAuthError("Please enter your email above to reset password.");
      return;
    }
    try {
      setAuthError('');
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (error) {
      console.error("Reset failed:", error);
      setAuthError("Failed to send reset email. Verify your email address.");
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '0.5rem'
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Welcome back</h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Sign in to continue to NAUGATI</p>
      </div>

      {authError && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {authError}
        </div>
      )}

      {resetSent && (
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          Password reset link sent to your email!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Email</label>
          <input 
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            type="email"
            placeholder="Enter your email"
            style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              {...register("password", { required: "Password is required" })}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              style={{ ...inputStyle, borderColor: errors.password ? '#ef4444' : '#e2e8f0', paddingRight: '3rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>{errors.password.message}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <button 
            type="button" 
            onClick={handleForgotPassword}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Forgot password?
          </button>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s ease',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
        </button>

      </form>

      <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        <span style={{ padding: '0 1rem' }}>or log in with</span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button 
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '0.875rem',
            backgroundColor: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'background-color 0.2s ease'
          }}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
          Continue with Google
        </button>
        
        <button 
          type="button"
          onClick={() => alert("LinkedIn OAuth requires developer portal setup and Firebase Functions. Configure in production.")}
          style={{
            width: '100%',
            padding: '0.875rem',
            backgroundColor: 'white',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            transition: 'background-color 0.2s ease'
          }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" style={{ width: '20px', height: '20px' }} />
          Continue with LinkedIn
        </button>
      </div>

    </div>
  );
}
