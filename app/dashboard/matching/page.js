"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../dashboard.module.css';
import { useSubscription } from '../../context/SubscriptionContext';

// Extended Data
// Data fetched from API

export default function MatchingPage() {
    const router = useRouter();
    // const searchParams = useSearchParams(); // Not strictly used in snippet but imported

    const { tier, consumeSuperLike, consumeBoost, hasAccess } = useSubscription();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [removedIds, setRemovedIds] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [fullProfileCreator, setFullProfileCreator] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ niche: '', location: '' });

    const [premiumModal, setPremiumModal] = useState({ show: false, title: '', message: '' });
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [reportModal, setReportModal] = useState({ show: false, targetId: null, name: '' });

    // Determine view mode (mock logic or based on Role)
    // For now, let's assume we show "Creators" by default.
    const isBrandView = true;

    const ACTIVE_DATA = candidates;

    useEffect(() => {
        async function fetchCandidates() {
            try {
                const res = await fetch('/api/match/candidates');
                const data = await res.json();
                if (data.success) {
                    setCandidates(data.candidates);
                }
            } catch (err) {
                console.error("Failed to fetch candidates", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCandidates();
    }, []);

    const filteredCreators = useMemo(() => {
        return ACTIVE_DATA.filter(c => {
            if (removedIds.includes(c.id)) return false;
            if (filters.niche && c.niche !== filters.niche) return false;
            if (filters.location && !c.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
            return true;
        });
    }, [removedIds, filters, ACTIVE_DATA]);

    const handleSwipe = async (direction, creator) => {
        setRemovedIds(prev => [...prev, creator.id]);

        try {
            const res = await fetch('/api/match/swipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ swipedOnId: creator.id, direction })
            });
            const data = await res.json();

            if (data.success && data.isMatch) {
                // It's a Mutual Match!
                setMatchData(data.matchData);
            }
        } catch (err) {
            console.error("Swipe failed", err);
        }
    };

    const handleRewind = () => {
        if (!hasAccess('plus')) {
            setPremiumModal({
                show: true,
                title: 'Rewind is Premium',
                message: 'Upgrade to Ping+ to rewind your last swipe.',
            });
            return;
        }
        setRemovedIds(prev => prev.slice(0, -1));
    };

    const handleSuperLike = () => {
        const consumed = consumeSuperLike();
        if (consumed) {
            if (filteredCreators.length > 0) {
                handleSwipe('right', filteredCreators[filteredCreators.length - 1]);
            }
        } else {
            setPremiumModal({
                show: true,
                title: 'Out of Super Likes',
                message: 'You have used all your Super Likes. Top up now!',
            });
        }
    };

    const handleBoost = () => {
        const consumed = consumeBoost();
        if (consumed) {
            setShowBoostModal(true);
        } else {
            setPremiumModal({
                show: true,
                title: 'Out of Boosts',
                message: 'Get a Boost to be the top profile in your area for 30 mins.',
            });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#09090b', color: 'white' }}>

            {/* AMBIENT BACKGROUND */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: '#ec4899', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', background: '#8b5cf6', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
            </div>

            {/* HEADER */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.5px' }}>
                        <span style={{ color: '#ec4899' }}>Find</span> {isBrandView ? 'Brands' : 'Creators'}
                    </h1>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ background: showFilters ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.1)', color: showFilters ? '#ec4899' : 'white', border: showFilters ? '1px solid #ec4899' : 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </button>
            </div>

            {/* MAIN CARD STACK */}
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                <AnimatePresence>
                    {filteredCreators.slice(0, 2).reverse().map((creator, index) => {
                        const isTop = index === filteredCreators.slice(0, 2).length - 1;
                        return (
                            <SwipeCard
                                key={creator.id}
                                data={creator}
                                isTop={isTop}
                                onSwipe={(dir) => handleSwipe(dir, creator)}
                                onOpenProfile={() => setFullProfileCreator(creator)}
                            />
                        );
                    })}
                </AnimatePresence>

                {filteredCreators.length === 0 && (
                    <div style={{ textAlign: 'center', zIndex: 5 }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>🕵️‍♂️</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No more profiles</h3>
                        <p style={{ color: '#888', marginBottom: '2rem' }}>Trying adjusting your filters.</p>
                        <button onClick={() => setRemovedIds([])} style={{ padding: '12px 24px', background: '#333', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Reset Deck</button>
                    </div>
                )}
            </div>

            {/* FLOATING ACTION DOCK */}
            {filteredCreators.length > 0 && !matchData && (
                <div style={{
                    position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
                    padding: '12px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 40
                }}>
                    <DockBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>} color="#eab308" onClick={handleRewind} tooltip="Rewind" />
                    <DockBtn icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>} color="#ef4444" size="large" onClick={() => handleSwipe('left', filteredCreators[0])} tooltip="Nope" />
                    <DockBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>} color="#3b82f6" onClick={handleSuperLike} tooltip="Super Like" />
                    <DockBtn icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>} color="#22c55e" size="large" onClick={() => handleSwipe('right', filteredCreators[0])} tooltip="Like" />
                    <DockBtn icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>} color="#a855f7" onClick={handleBoost} tooltip="Boost" />
                </div>
            )}

            {/* MODALS & OVERLAYS */}

            {/* Filter Toggle Overlay */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ position: 'absolute', top: 80, right: 24, width: 220, background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, zIndex: 45, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                    >
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#888' }}>Filter By</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Niche</label>
                            <select value={filters.niche} onChange={(e) => setFilters(prev => ({ ...prev, niche: e.target.value }))} style={{ width: '100%', bg: '#333', border: '1px solid #444', background: '#333', color: 'white', borderRadius: 8, padding: 6 }}>
                                <option value="">All</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Tech">Tech</option>
                                <option value="Lifestyle">Lifestyle</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Location</label>
                            <input value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} placeholder="City..." style={{ width: '100%', bg: '#333', border: '1px solid #444', background: '#333', color: 'white', borderRadius: 8, padding: 6 }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {premiumModal.show && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#18181b', padding: 30, borderRadius: 24, maxWidth: 320, width: '90%', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 15 }}>💎</div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: 8, fontWeight: 700 }}>{premiumModal.title}</h2>
                            <p style={{ color: '#a1a1aa', marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.5 }}>{premiumModal.message}</p>
                            <button onClick={() => router.push('/dashboard/premiums')} style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(to right, #ec4899, #8b5cf6)', border: 'none', color: 'white', fontWeight: 'bold', marginBottom: 10, cursor: 'pointer' }}>Get Power Ups</button>
                            <button onClick={() => setPremiumModal({ ...premiumModal, show: false })} style={{ background: 'transparent', border: 'none', color: '#71717a', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Boost Modal */}
            <AnimatePresence>
                {showBoostModal && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ background: '#18181b', padding: 40, borderRadius: 24, maxWidth: 300, textAlign: 'center', border: '1px solid #a855f7' }}>
                            <div style={{ fontSize: '4rem', marginBottom: 10 }}>🚀</div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, backgroundImage: 'linear-gradient(to right, #c084fc, #db2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 10 }}>BOOSTED!</h2>
                            <p style={{ color: '#d4d4d8' }}>You are now the top profile in your area for 30 minutes.</p>
                            <button onClick={() => setShowBoostModal(false)} style={{ marginTop: 20, padding: '10px 30px', background: '#3f3f46', border: 'none', borderRadius: 20, color: 'white', cursor: 'pointer' }}>Awesome</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Match Overlay */}
            {matchData && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: '4rem', color: '#22c55e', marginBottom: 40 }}>It's a Match</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 50 }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid white', overflow: 'hidden' }}><Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" width={100} height={100} alt="You" /></div>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '2px solid #22c55e', overflow: 'hidden' }}><Image src={matchData.image} width={100} height={100} alt="Match" /></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15, width: '80%', maxWidth: 300 }}>
                        <button onClick={() => alert('Chat coming soon!')} style={{ padding: '16px', borderRadius: 30, background: '#22c55e', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>Send Message</button>
                        <button onClick={() => setMatchData(null)} style={{ padding: '16px', borderRadius: 30, background: 'transparent', border: '1px solid #52525b', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>Keep Swiping</button>
                    </div>
                </div>
            )}

            {/* Full Profile Overlay */}
            <AnimatePresence>
                {fullProfileCreator && (
                    <motion.div
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 80, background: '#121212', overflowY: 'auto' }}
                    >
                        <div style={{ height: '50vh', position: 'relative' }}>
                            <Image src={fullProfileCreator.image} fill style={{ objectFit: 'cover' }} alt={fullProfileCreator.name} />

                            {/* Back Button */}
                            <button
                                onClick={() => setFullProfileCreator(null)}
                                style={{
                                    position: 'absolute',
                                    top: 20,
                                    left: 20,
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    zIndex: 20
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            </button>

                            {/* Back Button */}
                            <button
                                onClick={() => setFullProfileCreator(null)}
                                style={{
                                    position: 'absolute',
                                    top: 20,
                                    left: 20,
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(10px)',
                                    zIndex: 20
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            </button>

                            <button onClick={() => setFullProfileCreator(null)} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', zIndex: 20 }}>✕</button>

                            {/* Report Button */}
                            <button
                                onClick={() => setReportModal({ show: true, targetId: fullProfileCreator.id, name: fullProfileCreator.name })}
                                style={{ position: 'absolute', top: 20, right: 70, padding: '8px 16px', borderRadius: 20, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '0.8rem', cursor: 'pointer', zIndex: 20, fontWeight: 'bold' }}
                            >
                                ⚠️ Report
                            </button>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to top, #121212, transparent)' }}></div>
                        </div>
                        <div style={{ padding: 24 }}>
                            <h1 style={{ fontSize: '2.5rem', margin: '0 0 5px 0' }}>{fullProfileCreator.name}, <span style={{ fontWeight: 400, opacity: 0.7 }}>{fullProfileCreator.age}</span></h1>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a1a1aa', margin: '0 0 24px 0' }}>📍 {fullProfileCreator.location} • 💼 {fullProfileCreator.job}</p>
                            <hr style={{ borderColor: '#27272a', margin: '0 0 24px 0' }} />
                            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>About</h3>
                            <p style={{ color: '#d4d4d8', lineHeight: 1.6, marginBottom: 30 }}>{fullProfileCreator.bio}</p>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Passions</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {fullProfileCreator.interests.map(i => <span key={i} style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #3f3f46', fontSize: '0.9rem', color: '#e4e4e7' }}>{i}</span>)}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ReportModal
                show={reportModal.show}
                onClose={() => setReportModal({ ...reportModal, show: false })}
                targetId={reportModal.targetId}
                targetName={reportModal.name}
                type="PROFILE"
            />

        </div>
    );
}

// === SUB COMPONENTS ===

const DockBtn = ({ icon, color, size = 'normal', onClick, tooltip }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }}
        style={{
            width: size === 'large' ? 64 : 48,
            height: size === 'large' ? 64 : 48,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.08)',
            color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'background 0.2s'
        }}
    >
        {icon}
    </motion.button>
);

const SwipeCard = ({ data, isTop, onSwipe, onOpenProfile }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-12, 12]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);
    const [imgIndex, setImgIndex] = useState(0);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) onSwipe('right');
        else if (info.offset.x < -100) onSwipe('left');
    };

    const currentSrc = data.images && data.images[imgIndex] ? data.images[imgIndex] : data.image;

    return (
        <motion.div
            style={{
                position: 'absolute', width: '90%', maxWidth: 360, height: '65vh',
                borderRadius: 24, background: '#1c1c1e', overflow: 'hidden',
                x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: isTop ? 20 : 10,
                scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', cursor: 'grab'
            }}
            drag={isTop ? "x" : false} dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 10 }}
            exit={{ x: x.get() < 0 ? -500 : 500, opacity: 0, transition: { duration: 0.2 } }}
            whileTap={{ cursor: 'grabbing' }}
        >
            {/* Tap Navigation for Images */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex' }}>
                <div style={{ flex: 1 }} onClick={() => setImgIndex(Math.max(0, imgIndex - 1))}></div>
                <div style={{ flex: 1 }} onClick={() => setImgIndex(Math.min((data.images || []).length - 1, imgIndex + 1))}></div>
            </div>

            {/* Story Bars */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 20 }}>
                {(data.images || [1]).map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= imgIndex ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
                ))}
            </div>

            <Image src={currentSrc} fill style={{ objectFit: 'cover', pointerEvents: 'none' }} alt={data.name} unoptimized={true} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', pointerEvents: 'none' }}></div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: 24, pointerEvents: 'none', zIndex: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{data.name}</h2>
                    <span style={{ fontSize: '1.4rem', fontWeight: 400, opacity: 0.9 }}>{data.age}</span>
                    {data.verified && <span style={{ color: '#3b82f6' }}>✓</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', opacity: 0.8, marginBottom: 12 }}>
                    <span>📍 {data.location}</span>
                </div>

                {/* Info button */}
                <button
                    style={{ pointerEvents: 'auto', background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', fontWeight: 'bold', padding: 0, cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); onOpenProfile(); }}
                >
                    VIEW PROFILE <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l7-7 7-7" /></svg>
                </button>
            </div>

            {/* Stamps */}
            {isTop && (
                <>
                    <motion.div style={{ opacity: likeOpacity, position: 'absolute', top: 40, left: 40, border: '4px solid #22c55e', color: '#22c55e', padding: '5px 15px', borderRadius: 8, fontSize: '2rem', fontWeight: 800, transform: 'rotate(-15deg)', zIndex: 30 }}>LIKE</motion.div>
                    <motion.div style={{ opacity: nopeOpacity, position: 'absolute', top: 40, right: 40, border: '4px solid #ef4444', color: '#ef4444', padding: '5px 15px', borderRadius: 8, fontSize: '2rem', fontWeight: 800, transform: 'rotate(15deg)', zIndex: 30 }}>NOPE</motion.div>
                </>
            )}
        </motion.div>
    );
};

const ReportModal = ({ show, onClose, targetId, targetName, type, contextId }) => {
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState('');

    if (!show) return null;

    const handleSubmit = async () => {
        if (!reason) return;
        setStatus('submitting');
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetId, type, reason, contextId })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => {
                    setStatus('');
                    setReason('');
                    onClose();
                }, 1500);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#1c1c1e', padding: 25, borderRadius: 16, width: '90%', maxWidth: 350, border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Report {targetName}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 15 }}>Why are you reporting this user?</p>

                <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 8, background: '#333', border: '1px solid #444', color: 'white', marginBottom: 15 }}
                >
                    <option value="">Select a reason</option>
                    <option value="Spam">Spam/Scam</option>
                    <option value="Inappropriate">Inappropriate Content</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Other">Other</option>
                </select>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'submitting' || !reason}
                        style={{ padding: '8px 16px', background: status === 'success' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                    >
                        {status === 'success' ? 'Reported' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};
