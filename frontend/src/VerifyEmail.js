import React, { useEffect, useState } from 'react'
import axios from 'axios'

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }

    
    axios.get(`http://localhost:3005/verify-email?token=${token}`)
      .then(res => {
        
        
        setStatus('success')
        setMessage('Email verified! Redirecting to dashboard...')
      })
      .catch(err => {
        setStatus('error')
        setMessage(
          err.response?.data?.message || 
          'Verification link is invalid or has expired.'
        )
      })
  }, [])

  const handleResend = async () => {
    if (!email) {
      setResendMsg('Please enter your email address.')
      return
    }
    setResendLoading(true)
    try {
      const res = await axios.post(
        'http://localhost:3005/resend-verification',
        { email }
      )
      setResendMsg(res.data.message)
    } catch (err) {
      setResendMsg(
        err.response?.data?.message || 'Failed to resend. Try again.'
      )
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050814',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: '#0a0f1d',
        border: '1px solid #1f2937',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center'
      }}>

        {status === 'loading' && (
          <>
            <div style={{
              width: '60px', height: '60px',
              border: '4px solid #1f2937',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px'
            }}></div>
            <h2 style={{ color: 'white', fontSize: '22px' }}>
              Verifying your email...
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>
              Please wait a moment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
              Email Verified!
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '12px' }}>
              Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ color: '#f43f5e', fontSize: '22px', fontWeight: 'bold' }}>
              Verification Failed
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '12px', marginBottom: '32px' }}>
              {message}
            </p>

            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
              Enter your email to resend the verification link:
            </p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '14px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleResend}
              disabled={resendLoading}
              style={{
                width: '100%',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: resendLoading ? 0.6 : 1
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            {resendMsg && (
              <p style={{ 
                color: '#10b981', 
                fontSize: '13px', 
                marginTop: '12px' 
              }}>
                {resendMsg}
              </p>
            )}

            <a
              href="http://localhost:3001"
              style={{
                display: 'block',
                color: '#6b7280',
                fontSize: '13px',
                marginTop: '20px',
                textDecoration: 'none'
              }}
            >
              ← Back to Sign In
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VerifyEmail
