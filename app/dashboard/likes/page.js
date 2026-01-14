"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css'; // Preserving for layout container if needed, but mostly overriding
import { useSubscription } from '../../context/SubscriptionContext';

export default function LikesPage() {
    const router = useRouter();
    const { hasAccess } = useSubscription();
    // const canSeeLikes = hasAccess('gold');
    // For demo/visual purposes, you might want to toggle this or leave as logic
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

    async function handleMatchBack(profileId) {
        if (!canSeeLikes) return;
        try {
            await fetch('/api/match/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ swipedOnId: profileId, direction: 'right' })
            });
            // Remove locally
            setLikes(prev => prev.filter(p => p.id !== profileId));
        } catch (error) {
            console.error("Match failed", error);
        }
    }

    // --- Components ---

    const LoadingSkeleton = () => (
        <div className={styles.likesGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    style={{
                        height: 350,
                        borderRadius: 24,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'shimmer 2s infinite' }}></div>
                </div>
            ))}
            <style jsx>{`
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
            `}</style>
        </div>
    );

    const EmptyRadar = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '10vh auto',
                color: 'var(--text-muted)'
            }}
        >
            <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 40 }}>
                {/* Radar Rings */}
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute', inset: 0, border: '1px solid var(--primary)', borderRadius: '50%',
                            opacity: 0.3
                        }}
                        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
                    />
                ))}
                {/* Center Dot */}
                <div style={{ position: 'absolute', inset: 0, margin: 'auto', width: 20, height: 20, background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 20px var(--primary)' }}></div>

                {/* Rotating Scanner */}
                <motion.div
                    style={{
                        position: 'absolute', top: '50%', left: '50%', width: '50%', height: 2,
                        background: 'linear-gradient(90deg, var(--primary), transparent)',
                        transformOrigin: 'left center'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: 10 }}>Scanning for Matches...</h2>
            <p style={{ maxWidth: 350, textAlign: 'center', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                Your profile is visible! Check back soon to see who wants to collaborate with you.
            </p>
        </motion.div>
    );

    return (
        <div style={{ padding: '30px', minHeight: '100vh', background: 'var(--background)' }}>

            {/* --- Hero Header --- */}
            <header style={{ marginBottom: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                <div>
                    <h1 style={{
                        fontSize: '3rem', fontWeight: 800, margin: 0,
                        background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-muted) 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Liked You
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginTop: 8 }}>
                        {loading ? 'Updating...' : `${likes.length} people want to match`}
                    </p>
                </div>

                {!canSeeLikes && likes.length > 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)',
                            padding: '12px 24px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 12,
                            boxShadow: '0 10px 30px -10px rgba(251, 191, 36, 0.3)'
                        }}
                    >
                        <div style={{ width: 10, height: 10, background: '#fbbf24', borderRadius: '50%', boxShadow: '0 0 10px #fbbf24' }}></div>
                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', letterSpacing: 0.5 }}>
                            {likes.length} GOLD LIKES HIDDEN
                        </span>
                    </motion.div>
                )}
            </header>

            {/* --- Main Content --- */}
            {loading ? (
                <LoadingSkeleton />
            ) : likes.length === 0 ? (
                <EmptyRadar />
            ) : (
                <motion.div
                    className={styles.likesGrid} // Using grid layout from module
                    initial="hidden" animate="show"
                    variants={{
                        show: { transition: { staggerChildren: 0.1 } }
                    }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}
                >
                    {likes.map((profile) => (
                        <motion.div
                            key={profile.id}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20 } }
                            }}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            style={{
                                height: 400,
                                borderRadius: 32,
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                background: 'var(--surface)',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                            onClick={() => !canSeeLikes && router.push('/dashboard/premiums')}
                        >
                            {/* Full Image Background */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url(${profile.image})`,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                transition: 'filter 0.3s ease',
                                filter: canSeeLikes ? 'none' : 'blur(20px) contrast(1.2)'
                            }}></div>

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)'
                            }}></div>

                            {/* Locked Overlay (Glass) */}
                            {!canSeeLikes && (
                                <div style={{
                                    position: 'absolute', inset: 10,
                                    borderRadius: 22,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.02)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                                        marginBottom: 20
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 17a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M6 8V6a6 6 0 1112 0v2h2a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h2zm6-4a4 4 0 00-4 4v2h8V6a4 4 0 00-4-4z" clipRule="evenodd" /></svg>
                                    </div>
                                    <h3 style={{ color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.9rem', fontWeight: 700 }}>Locked Profile</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginTop: 5 }}>Upgrade to reveal</p>
                                </div>
                            )}

                            {/* Info Content (Bottom) */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 25, zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <h3 style={{
                                        color: 'white', margin: 0, fontSize: '1.4rem', fontWeight: 700,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                        filter: canSeeLikes ? 'none' : 'blur(5px)'
                                    }}>
                                        {canSeeLikes ? profile.name : 'Secret Brand'}
                                    </h3>
                                    {canSeeLikes && profile.verified && (
                                        <div style={{ width: 20, height: 20, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(59,130,246,0.6)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                                        </div>
                                    )}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.95rem', filter: canSeeLikes ? 'none' : 'blur(3px)' }}>
                                    {profile.type}
                                </p>

                                {canSeeLikes && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => { e.stopPropagation(); handleMatchBack(profile.id); }}
                                        style={{
                                            marginTop: 20, width: '100%', padding: '14px', borderRadius: 16,
                                            background: 'white', color: 'black', border: 'none',
                                            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            boxShadow: '0 10px 20px rgba(255,255,255,0.2)'
                                        }}
                                    >
                                        <span>Accept Match</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </motion.button>
                                )}
                            </div>

                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Sticky Upgrade Banner for Free Users */}
            {!canSeeLikes && likes.length > 0 && (
                <motion.div
                    initial={{ y: 200 }} animate={{ y: 0 }}
                    style={{
                        position: 'fixed', bottom: 40, left: 0, right: 0, margin: 'auto', width: '90%', maxWidth: 500,
                        background: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(20px)',
                        borderRadius: 24, padding: 8, border: '1px solid rgba(251, 191, 36, 0.3)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100
                    }}
                >
                    <div style={{ padding: '0 20px' }}>
                        <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.9rem', marginBottom: 2 }}>UNLOCK ALL</div>
                        <div style={{ color: 'white', fontSize: '0.85rem', opacity: 0.8 }}>See {likes.length} people who liked you</div>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/premiums')}
                        style={{
                            background: '#fbbf24', color: 'black', border: 'none', padding: '14px 28px',
                            borderRadius: 18, fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        Upgrade
                    </button>
                </motion.div>
            )}
        </div>
    );
}
