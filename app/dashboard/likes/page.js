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

    const [likes, setLikes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchLikes() {
            try {
                const res = await fetch('/api/match/likes');
                const data = await res.json();
                if (data.likes) {
                    setLikes(data.likes);
                }
            } catch (error) {
                console.error("Failed to fetch likes", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLikes();
    }, []);

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

    async function handleMatchBack(profileId) {
        if (!canSeeLikes) return;
        try {
            await fetch('/api/match/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ swipedOnId: profileId, direction: 'right' })
            });
            // Remove from list or show success state?
            // For now, let's just alert or refresh. A match notification will happen via socket/polling elsewhere.
            // Ideally we remove them from the "Likes" list because they are now a "Match".
            setLikes(prev => prev.filter(p => p.id !== profileId));
            // Redirect to messages/match?
            // router.push('/dashboard/messages'); 
        } catch (error) {
            console.error("Match failed", error);
        }
    }

    if (loading) {
        return (
            <div className={styles.dashboardContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <div style={{ color: 'var(--text-muted)' }}>Loading likes...</div>
            </div>
        );
    }

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

            {likes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '10vh', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍃</div>
                    <h3>No likes yet</h3>
                    <p>Optimizing your profile can help you get more visibility!</p>
                </div>
            ) : (
                <motion.div
                    className={styles.likesGrid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {likes.map((profile) => (
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMatchBack(profile.id);
                                }}
                                style={{
                                    background: canSeeLikes ? 'linear-gradient(90deg, #ec4899, #8b5cf6)' : '#333',
                                    color: canSeeLikes ? 'white' : '#666',
                                    cursor: canSeeLikes ? 'pointer' : 'default'
                                }}
                            >
                                {canSeeLikes ? 'Match Now' : 'Locked'}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Upsell Banner (Only show if not Gold) */}
            {!canSeeLikes && likes.length > 0 && (
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
