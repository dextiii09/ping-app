"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../../dashboard.module.css';
// Dashboard module is at app/dashboard/dashboard.module.css.
// From app/dashboard/business/profile/edit:
// ../ = profile
// ../../ = business
// ../../../ = dashboard
// So path is ../../../dashboard.module.css

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function BusinessEditProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
    const [previewImgIndex, setPreviewImgIndex] = useState(0);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [formData, setFormData] = useState({
        about: "We are a forward-thinking tech company looking to collaborate with creators who share our passion for innovation.",
        company: "Ping Global",
        industry: "SaaS / Technology",
        website: "www.ping.com",
        size: "11-50 Employees",
        lookingFor: "Brand Ambassadors",
        interests: ["Tech", "Startup", "B2B", "SaaS", "Growth"],
        instagram: "@ping_official",
        youtube: "",
        tiktok: "",
        twitter: "@ping",
        linkedin: "linkedin.com/company/ping"
    });

    // Fetch Profile Data
    useEffect(() => {
        fetch('/api/profile/update')
            .then(res => res.json())
            .then(data => {
                if (data.profile) {
                    setFormData(prev => ({
                        ...prev,
                        about: data.profile.about || "",
                        company: data.profile.company || "",
                        industry: data.profile.industry || "",
                        website: data.profile.website || "",
                        size: data.profile.size || "11-50 Employees",
                        lookingFor: data.profile.lookingFor || "",
                        instagram: data.profile.instagram || "",
                        twitter: data.profile.twitter || "",
                        linkedin: data.profile.linkedin || "",
                    }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.dashboardContainer} style={{ padding: 0, minHeight: '100vh', background: 'var(--background)' }}>
            {/* STICKY HEADER WITH TABS */}
            <div className={styles.editTabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'edit' ? styles.active : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Details
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'preview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    Preview
                </button>
            </div>

            {/* BACK BUTTON ABSOLUTE */}
            <button
                onClick={() => router.back()}
                style={{
                    position: 'fixed',
                    top: '15px',
                    left: '15px',
                    zIndex: 20,
                    color: 'var(--text-main)',
                    fontSize: '1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                ←
            </button>


            <div style={{ padding: '0 1rem 4rem 1rem' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'edit' ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* BRAND ASSETS */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Brand Assets
                                </div>
                                <div className={styles.photoGrid} style={{ marginTop: '0.5rem' }}>
                                    <div className={styles.photoUploadBox} style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/shapes/svg?seed=Nxtjn)', backgroundSize: 'cover' }}>
                                        <div className={styles.photoLabel}>Logo</div>
                                    </div>
                                    <div className={styles.photoUploadBox} style={{ borderColor: '#a855f7', borderStyle: 'dashed' }}>
                                        <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Cover<br />Image</span>
                                    </div>
                                    <div className={styles.photoUploadBox}>+</div>
                                </div>
                            </motion.section>

                            {/* COMPANY BIO */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Company Overview
                                </div>
                                <div className={styles.glassInput} style={{ background: 'var(--nav-pill-bg)', padding: '15px' }}>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-main)', resize: 'none', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }}
                                        rows="4"
                                        placeholder="Describe your brand and what you stand for..."
                                    />
                                    <div className={styles.charCount}>{formData.about.length} / 500</div>
                                </div>
                            </motion.section>

                            {/* BUSINESS DETAILS */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Business Details
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Company Name</h4></div>
                                    <input type="text" name="company" value={formData.company} onChange={handleChange} className={styles.inputField} />
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Industry</h4></div>
                                    <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={styles.inputField} placeholder="e.g. Fashion, Tech, Food" />
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Website</h4></div>
                                    <input type="text" name="website" value={formData.website} onChange={handleChange} className={styles.inputField} placeholder="https://" />
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Company Size</h4></div>
                                    <select
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className={styles.inputField}
                                        style={{ appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="11-50">11-50 Employees</option>
                                        <option value="50-250">50-250 Employees</option>
                                        <option value="250+">250+ Employees</option>
                                    </select>
                                </div>
                            </motion.section>

                            {/* SOCIALS */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    Brand Socials
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>Instagram</span>
                                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="@brand" />
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>LinkedIn</span>
                                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="Company Page URL" />
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>Twitter</span>
                                    <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="@brand" />
                                </div>
                            </motion.section>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className={styles.previewContainer}
                        >
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className={styles.previewContainer}
                            >
                                {/* LIVE PREVIEW CARD (Immersive Theme) */}
                                <div style={{
                                    width: '100%',
                                    maxWidth: '340px',
                                    height: '550px',
                                    position: 'relative',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    background: '#1c1c1e',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                    margin: '0 auto'
                                }}>
                                    {/* Story Bars */}
                                    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 20 }}>
                                        {mockImages.map((_, i) => (
                                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= previewImgIndex ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
                                        ))}
                                    </div>

                                    {/* Image Interactions */}
                                    <div
                                        style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex' }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setPreviewImgIndex(prev => Math.max(0, prev - 1))}></div>
                                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setPreviewImgIndex(prev => Math.min(mockImages.length - 1, prev + 1))}></div>
                                    </div>

                                    {/* Image */}
                                    <img
                                        src={mockImages[previewImgIndex]}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))', pointerEvents: 'none' }}></div>

                                    {/* Info Content */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 24, pointerEvents: 'none', zIndex: 15 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'white' }}>{formData.company || 'Brand Name'}</h2>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', opacity: 0.8, marginBottom: 16, color: 'white' }}>
                                            <span>📍 {formData.industry || 'Industry'}</span>
                                        </div>

                                        {/* Action Button Lookalike */}
                                        <div
                                            style={{ pointerEvents: 'auto', background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                                            onClick={() => setShowPreviewModal(true)}
                                        >
                                            VIEW DETAILS <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l7-7 7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FULL PROFILE MODAL (PREVIEW) */}
                <AnimatePresence>
                    {showPreviewModal && (
                        <motion.div
                            className={styles.fullProfileModal}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{ position: 'fixed', inset: 0, background: 'var(--background)', zIndex: 100, overflowY: 'auto' }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'var(--nav-pill-bg)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Large Image */}
                            <div style={{ height: '50vh', position: 'relative' }}>
                                <img src={mockImages[previewImgIndex]} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className={styles.overlay}></div>
                                <div className={styles.premiumInfo} style={{ bottom: 40 }}>
                                    <div className={styles.nameRow}>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{formData.company || 'Brand Name'}</h1>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 400, opacity: 0.9 }}>{formData.industry}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Scroll */}
                            <div style={{ padding: '20px', background: 'var(--surface)', minHeight: '50vh', position: 'relative', top: -20, borderRadius: '24px 24px 0 0' }}>
                                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>About Me</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '2rem' }}>{formData.about}</p>

                                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Interests</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}>
                                    {formData.interests.map((tag, i) => (
                                        <span key={i} style={{ padding: '8px 16px', borderRadius: 20, background: 'var(--nav-pill-bg)', color: 'var(--text-main)', fontSize: '0.9rem' }}>{tag}</span>
                                    ))}
                                </div>

                                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Socials</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {formData.instagram && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--nav-pill-bg)', borderRadius: 12 }}><span>Instagram</span><span style={{ color: '#3b82f6' }}>{formData.instagram}</span></div>}
                                    {formData.youtube && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--nav-pill-bg)', borderRadius: 12 }}><span>YouTube</span><span style={{ color: '#ef4444' }}>{formData.youtube}</span></div>}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Helpers
const mockImages = [
    'https://api.dicebear.com/7.x/shapes/svg?seed=Nxtjn',
    'https://api.dicebear.com/7.x/shapes/svg?seed=Brand',
    'https://api.dicebear.com/7.x/shapes/svg?seed=Logo'
];
