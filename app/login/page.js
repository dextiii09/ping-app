"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../auth.module.css';
import Toast from '../components/Toast';

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect based on role
                if (data.role === 'BUSINESS') {
                    router.push('/dashboard/business');
                } else if (data.role === 'INFLUENCER') {
                    router.push('/dashboard/influencer');
                } else if (data.role === 'ADMIN') {
                    router.push('/dashboard/admin');
                } else {
                    router.push('/dashboard/matching'); // Fallback
                }
            } else {
                setError(data.error || "Invalid Credentials");
            }
        } catch (err) {
            console.error("Login Client Error:", err);
            setError("Login Failed: " + (err.message || "Network Error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.splitContainer}>
            <Toast message={error} type="error" onClose={() => setError(null)} />

            <div className={styles.formSide} style={{ maxWidth: '450px' }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access the workspace.</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup} style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s backwards' }}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            className={styles.input}
                            required
                            placeholder="you@company.com"
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup} style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards' }}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            className={styles.input}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                        style={{
                            marginTop: '1.5rem',
                            animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s backwards'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className={styles.footer} style={{
                    marginTop: '2rem',
                    animation: 'fadeIn 0.8s ease-out 0.5s backwards',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <span style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OR REGISTER</span>
                        <span style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="/register/business" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Business Account</Link>
                        <Link href="/register/influencer" style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Creator Account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
