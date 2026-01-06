"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';
import { useSubscription } from '../../context/SubscriptionContext';

export default function LikesPage() {
    const router = useRouter();
    const { hasAccess } = useSubscription();
    const canSeeLikes = hasAccess('gold');

    // Mock Data for Likes
    const likes = [
        { id: 1, name: "Zara Clothing", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Zara", time: "2h ago", verified: true },
        { id: 2, name: "TechGear", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Tech", time: "5h ago", verified: false },
        { id: 3, name: "Urban Kicks", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Urban", time: "1d ago", verified: true },
        { id: 4, name: "Glow Cosmetics", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Glow", time: "1d ago", verified: false },
        { id: 5, name: "FitLife Pro", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Fit", time: "2d ago", verified: true },
        { id: 6, name: "Travel Buddy", type: "Brand", image: "https://api.dicebear.com/7.x/initials/svg?seed=Travel", time: "3d ago", verified: false },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <button
                    onClick={() => router.push('/dashboard/influencer')}
                    style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: 'pointer', flexShrink: 0
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className={styles.greeting}>Who Liked Me <span style={{ fontSize: '1rem', color: '#fbbf24' }}>({likes.length})</span></h1>
                    <p className={styles.subtext} style={{ marginTop: '5px' }}>
                        See the brands interested in collaborating with you.
                    </p>
                </div>
            </header>

            <motion.div
                className={styles.likesGrid}
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {likes.map((profile, i) => (
                    <motion.div
                        key={profile.id}
                        className={styles.likeCard}
                        variants={itemVariants}
                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        style={{ position: 'relative', overflow: 'hidden' }}
                        onClick={() => !canSeeLikes && router.push('/dashboard/premiums')}
                    >
                        {/* Blur Filter Overlay if not premium */}
                        {!canSeeLikes && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(251, 191, 36, 0.1) 100%)',
                                backdropFilter: 'blur(15px)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '1px solid rgba(251, 191, 36, 0.3)'
                            }}>
                                <div style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '10px',
                                    border: '1px solid #fbbf24',
                                    boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'
                                }}>
                                    <span style={{ fontSize: '2rem' }}>🔒</span>
                                </div>
                                <span style={{
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    fontSize: '0.9rem',
                                    color: '#fbbf24',
                                    letterSpacing: '1px',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    Upgrade to See
                                </span>
                            </div>
                        )}

                        <div className={styles.timeBadge}>{profile.time}</div>

                        <div
                            className={styles.likeAvatar}
                            style={{
                                backgroundImage: `url(${profile.image})`,
                                filter: canSeeLikes ? 'none' : 'blur(5px)' // Extra blur on image
                            }}
                        ></div>

                        <div className={styles.likeInfo}>
                            <h3 className={styles.likeName}>
                                {canSeeLikes ? profile.name : 'Unknown Brand'}
                                {profile.verified && <span className={styles.verifiedIconSmall}>✓</span>}
                            </h3>
                            <p className={styles.likeType}>{profile.type}</p>
                        </div>

                        <button
                            className={styles.matchBtn}
                            style={{
                                background: canSeeLikes ? 'linear-gradient(90deg, #ec4899, #8b5cf6)' : '#333',
                                color: canSeeLikes ? 'white' : '#666',
                            }}
                        >
                            {canSeeLikes ? 'Match Now' : 'Locked'}
                        </button>
                    </motion.div>
                ))}
            </motion.div>

            {/* Upsell Banner (Only show if not Gold) */}
            {!canSeeLikes && (
                <motion.div
                    className={styles.upsellBanner}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => router.push('/dashboard/premiums')}
                    style={{ cursor: 'pointer' }}
                >
                    <div className={styles.goldLogo}>👑 Ping GOLD</div>
                    <p>Upgrade to reveal {likes.length} people who liked you!</p>
                </motion.div>
            )}
        </div>
    );
}
