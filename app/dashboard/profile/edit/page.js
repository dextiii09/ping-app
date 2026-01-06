"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../dashboard.module.css';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function EditProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
    const [smartPhotos, setSmartPhotos] = useState(true);
    const [previewImgIndex, setPreviewImgIndex] = useState(0);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [formData, setFormData] = useState({
        about: "Let's make our 'how we met' story better than just 'on Ping'.",
        jobTitle: "Content Creator",
        company: "Self Employed",
        college: "Chandigarh University",
        gradYear: "2026",
        lookingFor: "Long-term partnership",
        interests: ["Tech", "Travel", "Photography", "Coding", "Startups"], // Example tags
        instagram: "",
        youtube: "",
        tiktok: "",
        twitter: "",
        linkedin: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles.dashboardContainer} style={{ padding: 0, minHeight: '100vh', background: '#000' }}>
            {/* STICKY HEADER WITH TABS */}
            <div className={styles.editTabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'edit' ? styles.active : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit
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
                    color: 'white',
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
                            {/* MEDIA & PORTFOLIO */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    Media & Portfolio
                                </div>
                                <div className={styles.settingItem}>
                                    <div className={styles.settingInfo}>
                                        <h4>Smart Selection</h4>
                                        <p>Auto-optimize best photos</p>
                                    </div>
                                    <div
                                        className={`${styles.toggleSwitch} ${smartPhotos ? styles.active : ''}`}
                                        onClick={() => setSmartPhotos(!smartPhotos)}
                                    >
                                        <div className={styles.toggleKnob}></div>
                                    </div>
                                </div>

                                <div className={styles.photoGrid} style={{ marginTop: '1.5rem' }}>
                                    <div className={styles.photoUploadBox} style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/avataaars/svg?seed=Felix)' }}>
                                        <div className={styles.photoLabel}>Main</div>
                                    </div>
                                    <div className={styles.photoUploadBox} style={{ borderColor: '#ef4444', borderStyle: 'solid' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.5rem' }}>▶️</span>
                                            <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>15s Reel</span>
                                        </div>
                                        <input type="file" accept="video/*" style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                                    </div>
                                    <div className={styles.photoUploadBox} style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka)' }}></div>
                                    <div className={styles.photoUploadBox}>+</div>
                                    <div className={styles.photoUploadBox}>+</div>
                                </div>
                            </motion.section>

                            {/* ABOUT ME */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    About Me
                                </div>
                                <div className={styles.glassInput} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px' }}>
                                    <textarea
                                        name="about"
                                        value={formData.about}
                                        onChange={handleChange}
                                        style={{ width: '100%', background: 'none', border: 'none', color: 'white', resize: 'none', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' }}
                                        rows="4"
                                    />
                                    <div className={styles.charCount}>{formData.about.length} / 500</div>
                                </div>
                            </motion.section>

                            {/* DETAILS */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Professional Info
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Job Title</h4></div>
                                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={styles.inputField} />
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>Company</h4></div>
                                    <input type="text" name="company" value={formData.company} onChange={handleChange} className={styles.inputField} />
                                </div>
                                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <div className={styles.settingInfo}><h4>College / University</h4></div>
                                    <input type="text" name="college" value={formData.college} onChange={handleChange} className={styles.inputField} />
                                </div>
                            </motion.section>

                            {/* SOCIALS */}
                            <motion.section className={styles.settingsSection} variants={itemVariants}>
                                <div className={styles.sectionTitle}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    Social Links
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>Instagram</span>
                                    <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="@username" />
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>YouTube</span>
                                    <input type="text" name="youtube" value={formData.youtube} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="Channel URL" />
                                </div>
                                <div className={styles.settingItem}>
                                    <span style={{ minWidth: 100 }}>TikTok</span>
                                    <input type="text" name="tiktok" value={formData.tiktok} onChange={handleChange} className={styles.inputField} style={{ marginTop: 0 }} placeholder="@username" />
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
                                        <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'white' }}>Dhruv</h2>
                                        <span style={{ fontSize: '1.4rem', fontWeight: 400, opacity: 0.9, color: 'white' }}>22</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', opacity: 0.8, marginBottom: 16, color: 'white' }}>
                                        <span>📍 Chandigarh, IN</span>
                                    </div>

                                    {/* Action Button Lookalike */}
                                    <div
                                        style={{ pointerEvents: 'auto', background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                                        onClick={() => setShowPreviewModal(true)}
                                    >
                                        VIEW PROFILE <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l7-7 7-7" /></svg>
                                    </div>
                                </div>
                            </div>
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
                            style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 100, overflowY: 'auto' }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 40, height: 40, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Large Image */}
                            <div style={{ height: '50vh', position: 'relative' }}>
                                <img src={mockImages[previewImgIndex]} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className={styles.overlay}></div>
                                <div className={styles.premiumInfo} style={{ bottom: 40 }}>
                                    <div className={styles.nameRow}>
                                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Dhruv</h1>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 400, opacity: 0.9 }}>22</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Scroll */}
                            <div style={{ padding: '20px', background: '#111', minHeight: '50vh', position: 'relative', top: -20, borderRadius: '24px 24px 0 0' }}>
                                <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>About Me</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#fff', marginBottom: '2rem' }}>{formData.about}</p>

                                <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Interests</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2rem' }}>
                                    {formData.interests.map((tag, i) => (
                                        <span key={i} style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}>{tag}</span>
                                    ))}
                                </div>

                                <h3 style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Socials</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {formData.instagram && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}><span>Instagram</span><span style={{ color: '#3b82f6' }}>{formData.instagram}</span></div>}
                                    {formData.youtube && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}><span>YouTube</span><span style={{ color: '#ef4444' }}>{formData.youtube}</span></div>}
                                    {formData.tiktok && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}><span>TikTok</span><span style={{ color: '#ec4899' }}>{formData.tiktok}</span></div>}
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
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack'
];
