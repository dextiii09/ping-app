"use client";
import Link from 'next/link';
import { useState } from 'react';
import styles from '../../auth.module.css';
import Toast from '../../components/Toast';

export default function BusinessRegister() {
    const [step, setStep] = useState(1);

    // Form States
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: '',
        niche: '',
        location: '',
        budget: '',
        requirements: ''
    });

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    // File States
    const [logoFile, setLogoFile] = useState(null);
    const [kycFile, setKycFile] = useState(null);

    const totalSteps = 3;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'logo') setLogoFile(e.target.files[0]);
            if (type === 'kyc') setKycFile(e.target.files[0]);
        }
    };

    const nextStep = (e) => {
        e.preventDefault();
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    async function uploadFile(file) {
        if (!file) return null;
        const data = new FormData();
        data.set('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });
            if (!res.ok) throw new Error('Upload failed');
            const blob = await res.json();
            return blob.url;
        } catch (err) {
            console.error("Upload Error:", err);
            return null;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Upload Files First
            const logoUrl = await uploadFile(logoFile);
            const kycUrl = await uploadFile(kycFile);

            // 2. Submit Registration
            const res = await fetch('/api/register/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    logo: logoUrl || "",
                    verificationDocs: kycUrl || ""
                })
            });

            if (res.ok) {
                setShowModal(true);
            } else {
                const data = await res.json();
                setError(data.error || "Registration Failed");
            }
        } catch (err) {
            setError("Error connecting to server");
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
                        <h2 className="gradient-text">Business Sign Up</h2>
                        <p>Step {step} of {totalSteps}: {step === 1 ? 'Account' : step === 2 ? 'Details' : 'Verification'}</p>
                    </div>

                    <form className={styles.form} onSubmit={step === totalSteps ? handleSubmit : nextStep}>

                        {step === 1 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Company Name</label>
                                    <input
                                        name="companyName"
                                        type="text"
                                        className={styles.input}
                                        required
                                        placeholder="Acme Inc."
                                        autoFocus
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Work Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className={styles.input}
                                        required
                                        placeholder="contact@business.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        className={styles.input}
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Company Logo</label>
                                    <div className={styles.fileInput} onClick={() => document.getElementById('logo-upload').click()}>
                                        <span>{logoFile ? `🖼️ ${logoFile.name}` : '📷 Upload Logo (PNG/JPG)'}</span>
                                        <input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Niche</label>
                                    <select
                                        name="niche"
                                        className={styles.select}
                                        required
                                        value={formData.niche}
                                        onChange={handleInputChange}
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="tech">Technology</option>
                                        <option value="fashion">Fashion & Lifestyle</option>
                                        <option value="food">Food & Beverage</option>
                                        <option value="finance">Finance</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {formData.niche === 'other' && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Specify Niche</label>
                                        <input type="text" className={styles.input} placeholder="e.g. Aerospace" />
                                    </div>
                                )}
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Location</label>
                                    <input
                                        name="location"
                                        type="text"
                                        className={styles.input}
                                        placeholder="City, Country"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Budget Range ($)</label>
                                    <input
                                        name="budget"
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. 1000 - 5000"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className={styles.stepContent}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>KYC Documents (Government ID/Reg)</label>
                                    <div className={styles.fileInput} onClick={() => document.getElementById('kyc-upload').click()}>
                                        <span>{kycFile ? `📄 ${kycFile.name}` : '📂 Click to Upload (PDF/IMG)'}</span>
                                        <input
                                            id="kyc-upload"
                                            type="file"
                                            accept=".pdf,image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileChange(e, 'kyc')}
                                        />
                                    </div>
                                    <small style={{ color: 'var(--text-muted)' }}>We verify every business manually.</small>
                                </div>
                                <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                                    <label className={styles.label}>Collaboration Requirements</label>
                                    <textarea
                                        name="requirements"
                                        className={styles.textarea}
                                        rows={3}
                                        placeholder="Describe what you are looking for..."
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                    ></textarea>
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
                                {loading ? 'Uploading & Creating...' : (step === totalSteps ? 'Complete Registration' : 'Continue')}
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
                            Your profile and documents are under review.
                            You can login now to explore (Limited Access).
                        </p>
                        <Link href="/login" className={styles.modalBtn}>
                            Go to Login
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
