import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignUpForm() {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm();
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [countries, setCountries] = useState([]);
  
  // Custom states for dropdowns
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const selectedCountry = watch('country');

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const selectedRole = watch('organizationType');

  const agreedToTerms = watch('terms');

  const roles = [
    "Small/Medium Forwarder",
    "Enterprise Forwarder",
    "Small/Medium Shipper",
    "Enterprise Shipper",
    "Airline/GSA",
    "Ocean Carrier",
    "Tracking/Rail Carrier",
    "Software Provider",
    "Other"
  ];

  useEffect(() => {
    // Fetch countries for the dropdown
    fetch('https://restcountries.com/v3.1/all?fields=name,flag')
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sorted);
      })
      .catch(err => console.error("Failed to load countries", err));
  }, []);

  useEffect(() => {
    if (countrySearch && countries.length > 0) {
      const exactMatch = countries.find(c => c.name.common.toLowerCase() === countrySearch.toLowerCase().trim());
      if (exactMatch) {
        setValue('country', `${exactMatch.flag} ${exactMatch.name.common}`, { shouldValidate: true });
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    }
  }, [countrySearch, countries, setValue]);

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setIsLoading(true);
      
      // Register with Firebase
      await signup(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        country: data.country,
        organizationType: data.organizationType
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError("An account with this email already exists. Please log in.");
      } else {
        setAuthError(error.message || "Failed to create account.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '0.5rem'
  };

  const errorStyle = { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Create your NAUGATI account</h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Join NAUGATI to make smarter shipping and chartering decisions.</p>
      </div>

      {authError && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input 
              {...register("firstName", { required: "First name is required" })}
              placeholder="Enter your first name"
              style={{ ...inputStyle, borderColor: errors.firstName ? '#ef4444' : '#e2e8f0' }}
            />
            {errors.firstName && <span style={errorStyle}>{errors.firstName.message}</span>}
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input 
              {...register("lastName", { required: "Last name is required" })}
              placeholder="Enter your last name"
              style={{ ...inputStyle, borderColor: errors.lastName ? '#ef4444' : '#e2e8f0' }}
            />
            {errors.lastName && <span style={errorStyle}>{errors.lastName.message}</span>}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Business Email</label>
          <input 
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Please enter a valid email address." }
            })}
            type="email"
            placeholder="Enter your business email"
            style={{ ...inputStyle, borderColor: errors.email ? '#ef4444' : '#e2e8f0' }}
          />
          {errors.email && <span style={errorStyle}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Password</label>
          <input 
            {...register("password", { 
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" }
            })}
            type="password"
            placeholder="Create a password"
            style={{ ...inputStyle, borderColor: errors.password ? '#ef4444' : '#e2e8f0' }}
          />
          {errors.password && <span style={errorStyle}>{errors.password.message}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input 
              {...register("phone", { required: "Phone is required" })}
              placeholder="+1 (555) 000-0000"
              style={{ ...inputStyle, borderColor: errors.phone ? '#ef4444' : '#e2e8f0' }}
            />
            {errors.phone && <span style={errorStyle}>{errors.phone.message}</span>}
          </div>
          <div>
            <label style={labelStyle}>Company</label>
            <input 
              {...register("company", { required: "Please enter your company name." })}
              placeholder="Enter your company name"
              style={{ ...inputStyle, borderColor: errors.company ? '#ef4444' : '#e2e8f0' }}
            />
            {errors.company && <span style={errorStyle}>{errors.company.message}</span>}
          </div>
        </div>

        {/* CUSTOM COUNTRY DROPDOWN */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <label style={labelStyle}>Country</label>
          
          <input type="hidden" {...register("country", { required: "Please select your country." })} />
          
          <div 
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            style={{ ...inputStyle, borderColor: errors.country ? '#ef4444' : '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {selectedCountry ? <span>{selectedCountry}</span> : <span style={{ color: '#94a3b8' }}>Select a country</span>}
          </div>
          
          {showCountryDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '0.5rem', zIndex: 50, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ padding: '0.5rem', position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
                <input 
                  type="text" 
                  placeholder="Search countries..." 
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', outline: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {countries.filter(c => c.name.common.toLowerCase().includes(countrySearch.toLowerCase())).map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => { setValue('country', `${c.flag} ${c.name.common}`, { shouldValidate: true }); setShowCountryDropdown(false); }}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                  className="hover:bg-slate-50"
                >
                  <span>{c.flag}</span>
                  <span>{c.name.common}</span>
                </div>
              ))}
            </div>
          )}
          {errors.country && <span style={errorStyle}>{errors.country.message}</span>}
        </div>

        {/* CUSTOM I'M A DROPDOWN */}
        <div style={{ marginBottom: '2rem', position: 'relative' }}>
          <label style={labelStyle}>I'm a</label>
          
          <input type="hidden" {...register("organizationType", { required: "Please select what type of organization you are." })} />
          
          <div 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{ ...inputStyle, borderColor: errors.organizationType ? '#ef4444' : '#e2e8f0', cursor: 'pointer' }}
          >
            {selectedRole ? <span>{selectedRole}</span> : <span style={{ color: '#94a3b8' }}>Select organization type</span>}
          </div>

          {showRoleDropdown && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '0.5rem', zIndex: 40, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              {roles.map((r, i) => (
                <div 
                  key={i}
                  onClick={() => { setValue('organizationType', r, { shouldValidate: true }); setShowRoleDropdown(false); }}
                  style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: i === roles.length - 1 ? 'none' : '1px solid #f1f5f9' }}
                  className="hover:bg-slate-50"
                >
                  {r}
                </div>
              ))}
            </div>
          )}
          {errors.organizationType && <span style={errorStyle}>{errors.organizationType.message}</span>}
        </div>

        {/* TERMS & CONDITIONS */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <input 
            type="checkbox" 
            id="terms"
            {...register("terms", { required: true })}
            style={{ marginTop: '0.25rem', width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
          />
          <label htmlFor="terms" style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, cursor: 'pointer' }}>
            By signing up, I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>NAUGATI agreement</a>, as well as <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>NAUGATI Data Terms & Conditions</a>
          </label>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !agreedToTerms}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: (isLoading || !agreedToTerms) ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            opacity: (isLoading || !agreedToTerms) ? 0.7 : 1
          }}
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
        </button>

      </form>
    </div>
  );
}
