"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '../auth.module.css';

function VerifyOtpContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email');

    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState(emailParam || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (data.success) {
                alert("Account Verified! Please login.");
                router.push('/login');
            } else {
                setError(data.error || "Verification failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '2rem',
                    background: '#111',
                    borderRadius: '20px',
                    border: '1px solid #333'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '0.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Verify Code</h1>
                    <p style={{ color: '#666' }}>Enter the code sent to your email.</p>
                </div>

                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Email Field */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9rem' }}>Email Account</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                background: '#222',
                                color: 'white'
                            }}
                        />
                    </div>

                    {/* OTP Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9rem' }}>6-Digit Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="123456"
                            maxLength={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                background: '#222',
                                color: 'white',
                                fontSize: '1.5rem',
                                letterSpacing: '0.5rem',
                                textAlign: 'center'
                            }}
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        style={{
                            padding: '14px',
                            marginTop: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(to right, #6366f1, #a855f7)',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                        Didn't get code? <span style={{ color: '#a855f7', cursor: 'pointer' }}>Resend</span>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div style={{ color: 'white', textAlign: 'center', paddingTop: 50 }}>Loading...</div>}>
            <VerifyOtpContent />
        </Suspense>
    );
}
