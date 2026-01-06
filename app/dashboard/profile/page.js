"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSubscription } from '../../context/SubscriptionContext'; // Add context
import styles from '../dashboard.module.css';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

const avatarVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.1 }
    }
};

const goldCardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 1.2,
            delay: 0.3
        }
    },
    hover: {
        scale: 1.015,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            repeat: Infinity,
            duration: 3,
            ease: "linear"
        }
    }
};

// Icons
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
    </svg>
);

const VerifiedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
    </svg>
);

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
    </svg>
);

export default function ProfilePage() {
    const router = useRouter();
    const { tier, hasAccess } = useSubscription();

    const isVerified = hasAccess('gold'); // Gold or Platinum gets verified
    const isPlatinum = hasAccess('platinum');

    return (
        <motion.div
            className={styles.dashboardContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header (Back to Dashboard link) */}
            <motion.header
                className={styles.header}
                style={{ marginBottom: '1rem', justifyContent: 'flex-start' }}
                variants={itemVariants}
            >
                <button
                    onClick={() => router.back()}
                    className={styles.iconBtn}
                    style={{ width: 40, height: 40, border: 'none', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    ←
                </button>
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Profile</div>
                <div style={{ width: 40 }}></div>
            </motion.header>

            <main>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <motion.div className={styles.avatarContainer} variants={avatarVariants}>
                        {/* Animated Ring - Gold for Gold, Platinum for Plat, None for Free/Plus */}
                        {hasAccess('gold') && (
                            <motion.div
                                className={styles.completionRing}
                                style={{
                                    borderTopColor: isPlatinum ? '#e5e7eb' : '#fbbf24',
                                    borderRightColor: isPlatinum ? '#9ca3af' : '#d97706'
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                            alt="Profile"
                            className={styles.avatarImage}
                        />
                        <motion.div
                            className={styles.completionBadge}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            style={{ background: isPlatinum ? '#334155' : hasAccess('gold') ? '#f59e0b' : '#22c55e' }}
                        >
                            {tier === 'free' ? '90%' : 'PRO'}
                        </motion.div>
                    </motion.div>

                    <div className={styles.profileName}>
                        Dhruv, 22
                        {isVerified && (
                            <span className={styles.verifiedBadge} style={{ color: isPlatinum ? '#22d3ee' : '#3b82f6' }}>
                                <VerifiedIcon />
                            </span>
                        )}
                    </div>

                    <Link href="/dashboard/profile/edit" style={{ textDecoration: 'none' }}>
                        <motion.button
                            className={styles.editProfileBtn}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <EditIcon /> Edit profile
                        </motion.button>
                    </Link>
                </div>



                {/* Premium Card - Changes based on PLAN */}
                <motion.div
                    className={styles.goldCard}
                    variants={goldCardVariants}
                    whileHover="hover"
                    style={{
                        background: isPlatinum
                            ? 'linear-gradient(135deg, #1f2937, #000)'
                            : hasAccess('gold')
                                ? 'linear-gradient(135deg, #b45309, #78350f)'
                                : hasAccess('plus')
                                    ? 'linear-gradient(135deg, #be123c, #881337)'
                                    : 'linear-gradient(135deg, #333, #000)'
                    }}
                >
                    <div className={styles.goldCardContent}>
                        <div className={styles.goldCardHeader}>
                            <div className={styles.goldLogo}>
                                <span>{isPlatinum ? '💎' : hasAccess('gold') ? '👑' : hasAccess('plus') ? '➕' : '⭐'}</span>
                                {tier === 'free' ? 'Ping PRO' : `Ping ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
                            </div>
                            <motion.button
                                className={styles.goldBtn}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/dashboard/premiums')}
                            >
                                {tier === 'free' ? 'UPGRADE' : 'MANAGE'}
                            </motion.button>
                        </div>

                        <div className={styles.goldFeatures}>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('plus') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>🚀</span>
                                <span>{hasAccess('plus') ? 'Boost Active' : 'Boost Locked'}</span>
                            </div>
                            <div className={styles.goldFeatureItem}>
                                <div style={{ height: 30, width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('gold') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>💎</span>
                                <span>{isVerified ? 'Verified' : 'Get Verified'}</span>
                            </div>
                            <div className={styles.goldFeatureItem}>
                                <div style={{ height: 30, width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('gold') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>👀</span>
                                <span>{hasAccess('gold') ? 'See Likes' : 'Unlock Likes'}</span>
                            </div>
                            <div className={styles.goldFeatureItem}>
                                <div style={{ height: 30, width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('plus') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>★</span>
                                <span>{hasAccess('plus') ? 'Super Like' : 'Unlock Super Like'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </motion.div>
    );
}
