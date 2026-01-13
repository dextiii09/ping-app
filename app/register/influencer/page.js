"use client";
import Link from 'next/link';
import { useState } from 'react';
import styles from '../../auth.module.css';
import Toast from '../../components/Toast';

export default function InfluencerRegister() {
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState("");
    const [platform, setPlatform] = useState("Instagram");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    // File State


    const totalSteps = 3;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        username: '',
        followers: '',
        engagement: '',
        bio: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };



    const nextStep = (e) => {
        e.preventDefault();
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };



    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {


            // 2. Submit Registration
            const res = await fetch('/api/register/influencer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                ...formData,
                niche,
                platform,
                images: null
            });

            if (res.ok) {
                setShowModal(true);
            } else {
                const data = await res.json();
                setError(data.error || "Registration Failed");
            }
        } catch (err) {
            setError("Connection Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.splitContainer}>
            <Toast message={error} type="error" onClose={() => setError(null)} />
            {/* Introduction Side */}
            <div className={styles.formSide}>
                <div className={styles.wizardContainer}>
                    <div className={styles.stepIndicator}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`} />
                        ))}
                    </div>

                    <div className={styles.header} style={{ textAlign: 'left' }}>
                        <h2 className="gradient-text">Creator Sign Up</h2>
                        <p>Step {step} of {totalSteps}: {step === 1 ? 'Profile' : step === 2 ? 'Stats' : 'Socials'}</p>
                    </div>

                    <form className={styles.form} onSubmit={step === totalSteps ? handleSubmit : nextStep}>

                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        type="text"
                                        className={styles.input}
                                        required
                                        placeholder="Jane Doe"
                                        autoFocus
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email Address</label>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className={styles.input}
                                        required
                                        placeholder="jane@creator.com"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Create Password</label>
                                    <input
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        type="password"
                                        className={styles.input}
                                        required
                                        placeholder="••••••••"
                                    />
                                </div>

                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Primary Niche</label>
                                    <select
                                        className={styles.select}
                                        required
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="fashion">Fashion & Modeling</option>
                                        <option value="tech">Tech & Reviews</option>
                                        <option value="travel">Travel & Vlogs</option>
                                        <option value="fitness">Fitness & Health</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {niche === 'other' && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Specify Niche</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Gaming" autoFocus />
                                    </div>
                                )}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Bio / Pitch</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows={3}
                                        placeholder="Tell brands about your audience..."
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Select Platform</label>
                                    <div className={styles.platformGrid}>
                                        {['Instagram', 'Facebook', 'YouTube', 'X (Twitter)'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                className={`${styles.platformBtn} ${platform === p ? styles.platformBtnActive : ''}`}
                                                onClick={() => setPlatform(p)}
                                            >
                                                <span style={{ fontSize: '1.2rem' }}>
                                                    {p === 'Instagram' ? '📸' : p === 'Facebook' ? '📘' : p === 'YouTube' ? '▶️' : '🐦'}
                                                </span>
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>{platform} Username</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>@</span>
                                        <input
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            type="text"
                                            className={styles.input}
                                            required
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>Followers</label>
                                        <input
                                            name="followers"
                                            value={formData.followers}
                                            onChange={handleChange}
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. 10k"
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1 }}>
                                        <label className={styles.label}>Engagement</label>
                                        <input
                                            name="engagement"
                                            value={formData.engagement}
                                            onChange={handleChange}
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. 5%"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={styles.buttonGroup}>
                            {step > 1 && (
                                <button type="button" className={styles.backBtn} onClick={prevStep}>
                                    Back
                                </button>
                            )}
                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? 'Submitting...' : (step === totalSteps ? 'Apply Now' : 'Continue')}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <span className={styles.successIcon}>🎉</span>
                        <h3>Application Submitted!</h3>
                        <p>
                            Your profile is under review by our admin team.
                            You will receive a notification once you are verified.
                        </p>
                        <Link href="/login" className={styles.modalBtn}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
