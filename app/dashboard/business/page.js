"use client";
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from '../dashboard.module.css';
import { useState, useEffect } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';

// Icons
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

export default function BusinessHome() {
    const { scrollY } = useScroll();
    const { tier } = useSubscription(); // Get tier
    const headerY = useTransform(scrollY, [0, 300], [0, -60]);
    const headerOpacity = useTransform(scrollY, [0, 250], [1, 0.85]);
    const gridY = useTransform(scrollY, [0, 400], [0, -30]);

    const [greeting, setGreeting] = useState('Hello');
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    // Verification State
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [docUrl, setDocUrl] = useState('');

    const handleUploadDocs = async () => {
        try {
            await fetch('/api/business/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationDocs: JSON.stringify([docUrl]) })
            });
            alert("Documents Submitted! Admin will review shortly.");
            setShowVerificationModal(false);
        } catch (e) {
            alert("Upload Failed");
        }
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        // Poll for notifications
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notify/count');
                const data = await res.json();
                setUnreadCount(data.count);
            } catch (e) {
                console.error("Failed to fetch notifications");
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const cardWidth = e.target.offsetWidth;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(index);
    };

    const CARDS = [
        {
            title: "Find Creators",
            desc: "Discover top-tier talent for your next campaign.",
            link: "/dashboard/matching?type=creator",
            icon: <SearchIcon />
        },
        {
            title: "Messages",
            desc: "Chat with creators and negotiate terms.",
            link: "/dashboard/messages",
            icon: <ChatIcon />
        },
        {
            title: "Analytics",
            desc: "Track views, likes, and campaign performance.",
            link: "/dashboard/analytics",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            title: "Business Profile",
            desc: "Update your business details and requirements.",
            link: "/dashboard/business/profile",
            icon: <EditIcon />
        },
        {
            title: "Premiums",
            desc: "Unlock exclusive business tools and insights.",
            link: "/dashboard/premiums",
            icon: <PremiumIcon />
        },
        {
            title: "Verification",
            desc: "Upload proofs to get the Green Tick.",
            action: () => setShowVerificationModal(true),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
    ];

    const handleToggleNotifications = async () => {
        if (showNotifications) {
            // Closing: Mark as read if there were unread items
            if (unreadCount > 0) {
                setUnreadCount(0); // Optimistic clear
                try {
                    await fetch('/api/notify/read', { method: 'POST' });
                } catch (e) {
                    console.error("Failed to mark read");
                }
            }
            setShowNotifications(false);
        } else {
            // Opening
            setShowNotifications(true);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <motion.header
                className={styles.floatingHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '2px' }}>
                        <span className="gradient-text">{greeting}, Business</span> 🚀
                    </h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Ready to scale?</p>
                </div>

                <div className={styles.headerActions} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Tier Badge */}
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: tier === 'free' ? 'var(--nav-pill-bg)' : tier === 'plus' ? '#be123c' : tier === 'gold' ? '#b45309' : 'var(--surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        border: '1px solid var(--card-border)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        height: 'fit-content'
                    }}>
                        {tier} MEMBER
                    </span>

                    <motion.button
                        className={styles.iconBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleNotifications}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                width: 8,
                                height: 8,
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '1px solid #18181b'
                            }}></span>
                        )}
                    </motion.button>
                    {/* Settings Button */}
                    <Link href="/dashboard/settings">
                        <motion.button
                            className={styles.iconBtn}
                            whileHover={{ scale: 1.05, rotate: 90 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </motion.button>
                    </Link>
                </div>
            </motion.header>

            {/* NOTIFICATION BAR */}
            <AnimatePresence>
                {showNotifications && (
                    <NotificationBar count={unreadCount} />
                )}
            </AnimatePresence>

            {/* CAROUSEL (Horizontal Scroll) */}
            <motion.div
                className={styles.carousel}
                style={{ y: gridY }}
                onScroll={handleScroll}
            >
                {CARDS.map((card, index) => (
                    card.action ? (
                        <div
                            key={index}
                            onClick={card.action}
                            className={styles.carouselCard}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.cardIcon}>{card.icon}</div>
                            <div>
                                <h3 className={styles.cardTitle}>{card.title}</h3>
                                <p className={styles.cardDesc}>{card.desc}</p>
                            </div>
                            <span className={styles.cardArrow}>→</span>
                        </div>
                    ) : (
                        <Link href={card.link} className={styles.carouselCard} key={index}>
                            <div className={styles.cardIcon}>{card.icon}</div>
                            <div>
                                <h3 className={styles.cardTitle}>{card.title}</h3>
                                <p className={styles.cardDesc}>{card.desc}</p>
                            </div>
                            <span className={styles.cardArrow}>→</span>
                        </Link>
                    )
                ))}
            </motion.div>

            {/* Pagination Dots */}
            <div className={styles.paginationContainer}>
                {CARDS.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.paginationDot} ${index === activeIndex ? styles.active : ''}`}
                    />
                ))}
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerificationModal && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: '#18181b', padding: 30, borderRadius: 24, width: '90%', maxWidth: 400, border: '1px solid #333' }}>
                            <h2 style={{ color: 'white', marginBottom: 15 }}>Upload Documents</h2>
                            <p style={{ color: '#aaa', marginBottom: 20, fontSize: '0.9rem' }}>Please provide a URL to your business registration, tax document, or other proof.</p>

                            <input
                                value={docUrl}
                                onChange={(e) => setDocUrl(e.target.value)}
                                placeholder="https://drive.google.com/file/..."
                                style={{ width: '100%', padding: '12px', borderRadius: 8, background: '#333', border: '1px solid #444', color: 'white', marginBottom: 20 }}
                            />

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={handleUploadDocs} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>Submit</button>
                                <button onClick={() => setShowVerificationModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#888', border: '1px solid #444', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* 🔹 Reusable Parallax Wrapper */
function ParallaxCard({ children, speed = -10 }) {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 600], [0, speed]);

    return (
        <motion.div
            style={{ y }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}

function NotificationBar({ count }) {
    return (
        <motion.div
            className={styles.notificationBar}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.notificationIcon}>
                {count > 0 ? '📢' : '🚀'}
            </div>
            <div className={styles.notificationText}>
                {count > 0
                    ? `You have ${count} new update${count > 1 ? 's' : ''}! Check your messages.`
                    : "Tip: Boost your campaign to reach 3x more creators."}
            </div>
        </motion.div>
    );
}
