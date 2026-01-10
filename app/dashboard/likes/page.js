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

    // Skeleton Loader Component
    const SkeletonCard = () => (
        <div className={styles.likeCard} style={{ height: 320, background: 'var(--surface-glass)', border: '1px solid var(--card-border)', animation: 'pulse 1.5s infinite ease-in-out' }}>
            <div style={{ height: '70%', background: 'rgba(255,255,255,0.05)' }}></div>
            <div style={{ padding: 15 }}>
                <div style={{ height: 20, width: '60%', background: 'rgba(255,255,255,0.1)', marginBottom: 10, borderRadius: 4 }}></div>
                <div style={{ height: 15, width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}></div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={styles.dashboardContainer} style={{ paddingBottom: 100 }}>
                <header className={styles.header} style={{ marginBottom: 30 }}>
                    <div style={{ height: 40, width: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                    <div style={{ marginLeft: 15 }}>
                        <div style={{ height: 30, width: 200, background: 'rgba(255,255,255,0.1)', marginBottom: 10, borderRadius: 6 }}></div>
                        <div style={{ height: 20, width: 300, background: 'rgba(255,255,255,0.05)', borderRadius: 6 }}></div>
                    </div>
                </header>
                <div className={styles.likesGrid}>
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer} style={{ background: 'radial-gradient(circle at top center, rgba(168, 85, 247, 0.15), transparent 70%)' }}>
            <header className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 40 }}>
                <button
                    onClick={() => router.push('/dashboard/influencer')}
                    style={{
                        background: 'var(--surface-glass)', border: '1px solid var(--card-border)', borderRadius: '50%',
                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-main)', cursor: 'pointer', flexShrink: 0, backdropFilter: 'blur(10px)',
                        transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className={styles.greeting} style={{ fontSize: '2rem' }}>
                        Who Liked Me
                        <span style={{
                            marginLeft: 10, fontSize: '1rem', background: '#fbbf24', color: 'black',
                            padding: '2px 10px', borderRadius: 20, verticalAlign: 'middle', fontWeight: 800
                        }}>
                            {likes.length}
                        </span>
                    </h1>
                    <p className={styles.subtext} style={{ marginTop: '5px', opacity: 0.8 }}>
                        {likes.length > 0 ? "You're popular! These brands want to work with you." : "Your fans will appear here."}
                    </p>
                </div>
            </header>

            {likes.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '10vh', color: 'var(--text-muted)' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: '6rem', marginBottom: '1rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }}
                    >
                        👀
                    </motion.div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: 10, color: 'var(--text-main)' }}>No likes yet</h3>
                    <p style={{ maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                        Don't worry! Keep your profile updated and swipe on brands to increase your visibility.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/matching')}
                        style={{
                            marginTop: 30, padding: '12px 30px', borderRadius: 24,
                            background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600,
                            cursor: 'pointer', boxShadow: '0 10px 25px -5px var(--primary)'
                        }}
                    >
                        Start Matching
                    </button>
                </div>
            ) : (
                <motion.div
                    className={styles.likesGrid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    style={{ paddingBottom: 100 }}
                >
                    {likes.map((profile) => (
                        <motion.div
                            key={profile.id}
                            className={styles.likeCard}
                            variants={itemVariants}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
                            style={{
                                position: 'relative', overflow: 'hidden', border: '1px solid var(--card-border)',
                                background: 'var(--surface)', borderRadius: 24
                            }}
                            onClick={() => !canSeeLikes && router.push('/dashboard/premiums')}
                        >
                            {/* Blur Filter Overlay if not premium */}
                            {!canSeeLikes && (
                                <div style={{
                                    position: 'absolute', inset: 0, zIndex: 10,
                                    background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{
                                        background: 'rgba(251, 191, 36, 0.2)', borderRadius: '50%',
                                        width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '15px', border: '2px solid #fbbf24',
                                        boxShadow: '0 0 30px rgba(251, 191, 36, 0.4)'
                                    }}>
                                        <span style={{ fontSize: '2rem' }}>🔒</span>
                                    </div>
                                    <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '0.85rem', color: '#fbbf24', letterSpacing: '2px' }}>
                                        Gold Feature
                                    </span>
                                </div>
                            )}

                            <div className={styles.timeBadge} style={{ top: 15, right: 15, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', padding: '4px 10px', borderRadius: 12 }}>
                                {profile.time}
                            </div>

                            <div
                                className={styles.likeAvatar}
                                style={{
                                    height: '65%',
                                    backgroundImage: `url(${profile.image})`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    filter: canSeeLikes ? 'none' : 'blur(8px)' // Stronger blur
                                }}
                            ></div>

                            <div className={styles.likeInfo} style={{ padding: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                <h3 className={styles.likeName} style={{ fontSize: '1.2rem', marginBottom: 4 }}>
                                    {canSeeLikes ? profile.name : 'Secret Brand'}
                                    {profile.verified && <span className={styles.verifiedIconSmall} style={{ marginLeft: 6 }}>✓</span>}
                                </h3>
                                <p className={styles.likeType} style={{ opacity: 0.7 }}>{profile.type}</p>
                            </div>

                            <button
                                className={styles.matchBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMatchBack(profile.id);
                                }}
                                style={{
                                    bottom: 15, left: 15, right: 15, width: 'calc(100% - 30px)',
                                    background: canSeeLikes ? 'linear-gradient(90deg, #ec4899, #8b5cf6)' : '#333',
                                    color: canSeeLikes ? 'white' : '#777',
                                    border: 'none', borderRadius: 12, padding: 12, fontWeight: 700,
                                    cursor: canSeeLikes ? 'pointer' : 'default',
                                    boxShadow: canSeeLikes ? '0 10px 20px -5px rgba(236, 72, 153, 0.4)' : 'none'
                                }}
                            >
                                {canSeeLikes ? 'Match Back' : 'Unlock to See'}
                            </button>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Floating Upsell Banner (Only show if not Gold) */}
            {!canSeeLikes && likes.length > 0 && (
                <motion.div
                    className={styles.upsellBanner}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    onClick={() => router.push('/dashboard/premiums')}
                    style={{
                        position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(20,20,20,0.95)', border: '1px solid #fbbf24',
                        padding: '15px 30px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 15,
                        cursor: 'pointer', zIndex: 100, width: 'calc(100% - 40px)', maxWidth: 450,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{ fontSize: '2rem' }}>👑</div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#fbbf24', margin: 0, fontSize: '1rem' }}>Upgrade to Ping GOLD</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#ccc' }}>Reveal {likes.length} people who liked you</p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </motion.div>
            )}
        </div>
    );
}
