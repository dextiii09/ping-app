"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSubscription } from '../../../context/SubscriptionContext';
import styles from '../../dashboard.module.css';

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

export default function BusinessProfilePage() {
    const router = useRouter();
    const { tier, hasAccess } = useSubscription();

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
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Business Profile</div>
                <div style={{ width: 40 }}></div>
            </motion.header>

            <main>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                    <motion.div className={styles.avatarContainer} variants={avatarVariants}>
                        <img
                            src="https://api.dicebear.com/7.x/shapes/svg?seed=Nxtjn"
                            alt="Profile"
                            className={styles.avatarImage}
                            style={{ borderRadius: '15px' }}
                        />
                    </motion.div>

                    <div className={styles.profileName}>
                        Ping Global <span className={styles.verifiedBadge}><VerifiedIcon /></span>
                        <div style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7, marginTop: '5px' }}>Tech & SaaS</div>
                    </div>

                    <button
                        className={styles.editProfileBtn}
                        onClick={() => router.push('/dashboard/business/profile/edit')}
                    >
                        <EditIcon /> Edit profile
                    </button>
                </div>

                {/* Premium Card - BUSINESS VERSION */}
                <motion.div
                    className={styles.goldCard}
                    variants={itemVariants}
                    whileHover={{ scale: 1.015, transition: { duration: 0.4 } }}
                    style={{
                        marginTop: '20px',
                        background: hasAccess('platinum')
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
                                <span>{hasAccess('platinum') ? '💎' : hasAccess('gold') ? '👑' : hasAccess('plus') ? '➕' : '💼'}</span>
                                {tier === 'free' ? 'Business Basic' : `Business ${tier.charAt(0).toUpperCase() + tier.slice(1)}`}
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
                                <span className={styles.goldFeatureIcon}>📊</span>
                                <span>{hasAccess('plus') ? 'Analytics Active' : 'Unlock Analytics'}</span>
                            </div>
                            <div className={styles.goldFeatureItem}>
                                <div style={{ height: 30, width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('gold') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>💎</span>
                                <span>{hasAccess('gold') ? 'Verified Badge' : 'Get Verified'}</span>
                            </div>
                            <div className={styles.goldFeatureItem}>
                                <div style={{ height: 30, width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            </div>
                            <div className={styles.goldFeatureItem} style={{ opacity: hasAccess('platinum') ? 1 : 0.5 }}>
                                <span className={styles.goldFeatureIcon}>🚀</span>
                                <span>{hasAccess('platinum') ? 'Priority Support' : 'Standard Support'}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </main>
        </motion.div>
    );
}
