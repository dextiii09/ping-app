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

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);

const PremiumIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);



export default function CreatorHome() {
    const { scrollY } = useScroll();
    const { tier } = useSubscription(); // Get tier
    const headerY = useTransform(scrollY, [0, 300], [0, -60]);
    const headerOpacity = useTransform(scrollY, [0, 250], [1, 0.85]);
    const gridY = useTransform(scrollY, [0, 400], [0, -30]);

    const [greeting, setGreeting] = useState('Hello');
    const [showNotifications, setShowNotifications] = useState(false);

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const cardWidth = e.target.offsetWidth;
        // Card is now 100% width, so cardWidth is exact. + gap (1rem approx 16px)
        // Using cardWidth is stable enough for 100% cards
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(index);
    };

    const CARDS = [
        { title: "Discover Brands", desc: "Swipe to find your next collaboration partner.", link: "/dashboard/matching?type=brand", icon: <SearchIcon /> },
        { title: "Who Liked Me", desc: "See brands that expressed interest in you.", link: "/dashboard/likes", icon: <HeartIcon /> },
        { title: "Messages", desc: "Chat with brands and negotiate deals.", link: "/dashboard/messages", icon: <ChatIcon /> },
        { title: "Edit Profile", desc: "Update your media kit and rates.", link: "/dashboard/profile", icon: <EditIcon /> },
        { title: "Premiums", desc: "Unlock exclusive features and boost your reach.", link: "/dashboard/premiums", icon: <PremiumIcon /> },
    ];

    return (
        <div className={styles.dashboardContainer}>
            {/* STICKY HEADER */}
            <motion.header
                className={styles.floatingHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '2px' }}>{greeting}, Creator ✨</h1>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Ready to monetize?</p>
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

                    {/* Notification Btn */}
                    <motion.button
                        className={styles.iconBtn}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
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
                    <NotificationBar hasNotification={false} />
                )}
            </AnimatePresence>

            {/* CAROUSEL (Horizontal Scroll) */}
            <motion.div
                className={styles.carousel}
                style={{ y: gridY }}
                onScroll={handleScroll}
            >
                {CARDS.map((card, index) => (
                    <Link href={card.link} className={styles.carouselCard} key={index}>
                        <div className={styles.cardIcon}>{card.icon}</div>
                        <div>
                            <h3 className={styles.cardTitle}>{card.title}</h3>
                            <p className={styles.cardDesc}>{card.desc}</p>
                        </div>
                        <span className={styles.cardArrow}>→</span>
                    </Link>
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

        </div>
    );
}

function NotificationBar({ hasNotification }) {
    return (
        <motion.div
            className={styles.notificationBar}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.notificationIcon}>
                {hasNotification ? '📢' : '✨'}
            </div>
            <div className={styles.notificationText}>
                {hasNotification
                    ? "You have been verified as a Top Creator!"
                    : "More good news are coming! Stay tuned for opportunities."}
            </div>
        </motion.div>
    );
}
