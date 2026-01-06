"use client";
import Link from 'next/link';
import { useState } from 'react';
import styles from '../../auth.module.css';

export default function BusinessRegister() {
    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [kycFile, setKycFile] = useState(null);
    const totalSteps = 3;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setKycFile(e.target.files[0]);
        }
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

        try {
            // Collect visible inputs dynamically for now or use refs in real app
            // Assuming simple flow for demo
            // In a real app we would gather data from all steps properly.

            const res = await fetch('/api/register/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: "demo@business.com",
                    password: "password123",
                    companyName: "Demo Corp"
                })
            });

            if (res.ok) {
                setShowModal(true);
            } else {
                alert("Registration Failed");
            }
        } catch (err) {
            alert("Error connecting to server");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.splitContainer}>
            {/* Introduction Side */}
            <div className={styles.formSide}>
                <div className={styles.wizardContainer}>
                    <div className={styles.stepIndicator}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''}`} />
                        ))}
                    </div>

                    <div className={styles.header} style={{ textAlign: 'left' }}>
                        <h2 className="gradient-text">Business Sign Up</h2>
                        <p>Step {step} of {totalSteps}: {step === 1 ? 'Account' : step === 2 ? 'Details' : 'Verification'}</p>
                    </div>

                    <form className={styles.form} onSubmit={step === totalSteps ? handleSubmit : nextStep}>

                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Company Name</label>
                                    <input type="text" className={styles.input} required placeholder="Acme Inc." autoFocus />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Work Email</label>
                                    <input type="email" className={styles.input} required placeholder="contact@business.com" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Password</label>
                                    <input type="password" className={styles.input} required placeholder="••••••••" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Niche</label>
                                    <select
                                        className={styles.select}
                                        required
                                        defaultValue=""
                                        onChange={(e) => setNiche(e.target.value)}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="tech">Technology</option>
                                        <option value="fashion">Fashion & Lifestyle</option>
                                        <option value="food">Food & Beverage</option>
                                        <option value="finance">Finance</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {niche === 'other' && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Specify Niche</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Aerospace" autoFocus />
                                    </div>
                                )}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Location</label>
                                    <input type="text" className={styles.input} placeholder="City, Country" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Budget Range ($)</label>
                                    <input type="text" className={styles.input} placeholder="e.g. 1000 - 5000" />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>KYC Documents (Government ID/Reg)</label>
                                    <div className={styles.fileInput} onClick={() => document.getElementById('kyc-upload').click()}>
                                        <span>{kycFile ? `📄 ${kycFile.name}` : '📂 Click to Upload (PDF, JPG, PNG)'}</span>
                                        <input
                                            id="kyc-upload"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <small style={{ color: 'var(--text-muted)' }}>We verify every business manually.</small>
                                </div>
                                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                    <label className={styles.label}>Collaboration Requirements</label>
                                    <textarea className={styles.textarea} rows={3} placeholder="Describe what you are looking for..."></textarea>
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
                                {loading ? 'Processing...' : (step === totalSteps ? 'Complete Registration' : 'Continue')}
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
                        <h3>Registration Submitted!</h3>
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
