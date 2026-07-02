import React, { useState } from 'react'
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react'
import axios from 'axios'

const API_URL = 'https://niveshcapital-backend.onrender.com'
const DASHBOARD_URL = 'https://niveshcapital-dashboard.vercel.app'

export default function AuthModal({ type, onClose, prefillEmail, prefillPassword }) {
  const [mode, setMode] = useState(type || 'signin')
  const [email, setEmail] = useState(prefillEmail || '')
  const [password, setPassword] = useState(prefillPassword || '')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  })

  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  const [showResendButton, setShowResendButton] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/
    return regex.test(username)
  }

  const validatePassword = (password) => {
    return password.length >= 8
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return null
    if (password.length < 8) return 'weak'
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[@#$%^&*!]/.test(password)
    if (password.length >= 10 && hasNumber && hasSpecial) return 'strong'
    if (password.length >= 8 && hasNumber) return 'medium'
    return 'weak'
  }

  const strength = getPasswordStrength(password)

  const handleUsernameChange = (e) => {
    const val = e.target.value
    setFullName(val)
    setErrors(prev => ({ ...prev, fullName: '' }))
    setError('')
  }

  const handleUsernameBlur = () => {
    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrors(prev => ({ ...prev, fullName: "Username is required" }))
      } else if (!validateUsername(fullName.trim())) {
        setErrors(prev => ({ ...prev, fullName: "Username must be 3-20 characters, letters and numbers only" }))
      }
    }
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    setErrors(prev => ({ ...prev, email: '' }))
    setError('')
  }

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: "Email is required" }))
    } else if (!validateEmail(email.trim())) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
    }
  }

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    setErrors(prev => ({ ...prev, password: '' }))
    setError('')
  }

  const handlePasswordBlur = () => {
    if (mode === 'signup') {
      if (!password) {
        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }))
      } else if (!validatePassword(password)) {
        setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }))
      }
    } else if (mode === 'signin') {
      if (!password) {
        setErrors(prev => ({ ...prev, password: "Password is required" }))
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setResendMsg('')
    const newErrors = {}

    if (mode === 'signup') {
      if (!validateUsername(fullName.trim())) {
        newErrors.fullName =
          "Username must be 3-20 characters, letters and numbers only"
      }
      if (!validateEmail(email.trim())) {
        newErrors.email = "Please enter a valid email address"
      }
      if (!validatePassword(password)) {
        newErrors.password = "Password must be at least 8 characters"
      }
    }

    if (mode === 'signin') {
      if (!email.trim()) {
        newErrors.email = "Email is required"
      } else if (!validateEmail(email.trim())) {
        newErrors.email = "Please enter a valid email address"
      }
      if (!password.trim()) {
        newErrors.password = "Password is required"
      }
    }

    if (mode === 'forgot') {
      if (!validateEmail(email.trim())) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)

    if (mode === 'signup') {
      axios.post(`${API_URL}/signup`, {
        username: fullName.trim(),
        email: email.trim(),
        password
      })
        .then(res => {
          setSignupEmail(email.trim())
          const token = res.data.token || res.data.accessToken
          if (token) {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify({
              id: res.data.id,
              name: res.data.name,
              email: res.data.email
            }))
            onClose()
            const redirectUrl = `${DASHBOARD_URL}/?id=${res.data.id}&name=${encodeURIComponent(res.data.name)}&email=${encodeURIComponent(res.data.email)}&token=${token}`
            window.location.href = redirectUrl
          } else {
            setSignupSuccess(true)
            setLoading(false)
          }
        })
        .catch(err => {
          setError(err.response?.data?.message || err.message || 'Signup failed')
          setLoading(false)
        })
    } else if (mode === 'signin') {
      axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password
      })
        .then(res => {
          const token = res.data.token || res.data.accessToken
          if (token) {
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify({
              id: res.data.id,
              name: res.data.name,
              email: res.data.email
            }))
            onClose()
            const redirectUrl = `${DASHBOARD_URL}/?id=${res.data.id}&name=${encodeURIComponent(res.data.name)}&email=${encodeURIComponent(res.data.email)}&token=${token}`
            window.location.href = redirectUrl
          }
        })
        .catch(err => {
          const msg = err.response?.data?.message || 'Login failed'
          const resendAvailable = err.response?.data?.resendAvailable
          setError(msg)
          if (resendAvailable) {
            setShowResendButton(true)
            setUnverifiedEmail(email.trim())
          }
          setLoading(false)
        })
    } else if (mode === 'forgot') {
      axios.post(`${API_URL}/forgot-password`, {
        email: email.trim()
      })
        .then(() => {
          setMode('forgot-success')
          setLoading(false)
        })
        .catch(err => {
          setError(err.response?.data?.message || err.message || 'Reset request failed')
          setLoading(false)
        })
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendMsg('')
    try {
      const res = await axios.post(`${API_URL}/resend-verification`, {
        email: signupEmail
      })
      setResendMsg(res.data.message || 'Verification email sent!')
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend email.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleResendFromSignin = async () => {
    setResendLoading(true)
    setResendMsg('')
    try {
      const res = await axios.post(`${API_URL}/resend-verification`, {
        email: unverifiedEmail
      })
      setResendMsg(res.data.message || 'Verification email sent!')
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend email.')
    } finally {
      setResendLoading(false)
    }
  }

  if (signupSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-navy-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center animate-fade-in-up">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 hover:bg-gray-800/80 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-white mb-2">Account Created!</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            We sent a verification email to{' '}
            <span className="text-emerald-400 font-semibold">
              your email address
            </span>
            <br />
            Click the link in the email to activate your account
            and access your dashboard.
          </p>
          <div className="bg-navy-950 border border-gray-800 rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-gray-400 text-xs">📧 Check your spam folder if you don't see it</p>
            <p className="text-gray-400 text-xs">⏱ Link expires in 24 hours</p>
            <p className="text-gray-400 text-xs">🔒 Only verified accounts can access the platform</p>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resendLoading}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm rounded-xl transition-colors mb-3 disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
          {resendMsg && (
            <p className="text-emerald-400 text-xs mb-3">{resendMsg}</p>
          )}
          <button
            onClick={() => {
              setSignupSuccess(false)
              setMode('signin')
              setErrors({ fullName: '', email: '', password: '' })
              setError('')
              setResendMsg('')
            }}
            className="text-gray-500 text-sm hover:text-gray-300 bg-transparent border-0 cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'forgot-success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-navy-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center animate-fade-in-up">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 hover:bg-gray-800/80 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-6xl mb-4">📩</div>
          <h3 className="text-2xl font-bold text-white mb-2">Check Your Email</h3>
          <p className="text-gray-300 text-sm mb-6">
            If that email exists, a reset link has been sent.
          </p>
          <button
            onClick={() => {
              setMode('signin')
              setError('')
              setEmail('')
              setPassword('')
            }}
            className="block w-full text-center text-xs text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md bg-navy-900 border border-gray-800 rounded-3xl p-8 shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 hover:bg-gray-800/80 text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-left">
          <h3 className="text-2xl font-heading font-extrabold text-white">
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to access your custom portfolio metrics.'
              : mode === 'signup'
                ? 'Join NiveshCapital to simulate, learn, and grow.'
                : 'Enter your email to request a reset link.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  placeholder="johndoe"
                  className={`w-full pl-11 pr-4 py-3 bg-navy-950 border ${errors.fullName ? 'border-rose-500' : 'border-gray-800'} hover:border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.fullName && (
                <p className="text-rose-400 text-xs font-medium mt-1">{errors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
                className={`w-full pl-11 pr-4 py-3 bg-navy-950 border ${errors.email ? 'border-rose-500' : 'border-gray-800'} hover:border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm focus:outline-none transition-all duration-200`}
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-navy-950 border ${errors.password ? 'border-rose-500' : 'border-gray-800'} hover:border-gray-700 focus:border-emerald-500 rounded-xl text-white text-sm focus:outline-none transition-all duration-200`}
                />
              </div>
              {errors.password && (
                <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password}</p>
              )}
              {mode === 'signup' && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full transition-all ${strength === 'weak' || strength === 'medium' || strength === 'strong'
                        ? strength === 'weak' ? 'bg-red-500'
                          : strength === 'medium' ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        : 'bg-gray-700'
                      }`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all ${strength === 'medium' || strength === 'strong'
                        ? strength === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                        : 'bg-gray-700'
                      }`}></div>
                    <div className={`h-1 flex-1 rounded-full transition-all ${strength === 'strong' ? 'bg-emerald-500' : 'bg-gray-700'
                      }`}></div>
                  </div>
                  {strength && (
                    <p className={`text-xs font-medium ${strength === 'weak' ? 'text-red-400'
                        : strength === 'medium' ? 'text-yellow-400'
                          : 'text-emerald-400'
                      }`}>
                      {strength === 'weak' ? '⚠ Weak password'
                        : strength === 'medium' ? '● Medium strength'
                          : '✓ Strong password'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot')
                  setError('')
                  setErrors({ fullName: '', email: '', password: '' })
                }}
                className="text-xs text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {mode === 'signin' && showResendButton && (
            <button
              type="button"
              onClick={handleResendFromSignin}
              disabled={resendLoading}
              className="w-full py-2 mt-2 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
            >
              {resendLoading ? 'Resending...' : 'Resend Verification Email'}
            </button>
          )}

          {resendMsg && (
            <p className="text-center text-emerald-400 text-xs mt-2">{resendMsg}</p>
          )}

          <div className="pt-2 text-center text-xs text-gray-400">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError('')
                    setErrors({ fullName: '', email: '', password: '' })
                  }}
                  className="text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer font-semibold"
                >
                  Create one
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setError('')
                    setErrors({ fullName: '', email: '', password: '' })
                  }}
                  className="text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer font-semibold"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}