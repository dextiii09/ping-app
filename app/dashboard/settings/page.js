"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../context/ThemeContext';
import styles from '../dashboard.module.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Preferences State
    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        marketing: false
    });

    const [privacy, setPrivacy] = useState({
        privateProfile: false,
        activityStatus: true
    });

    // Modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch Preferences
    useEffect(() => {
        fetch('/api/settings/preferences')
            .then(res => res.json())
            .then(data => {
                if (data.preferences) {
                    if (data.preferences.notifications) setNotifications(data.preferences.notifications);
                    if (data.preferences.privacy) setPrivacy(data.preferences.privacy);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load settings", err);
                setLoading(false);
            });
    }, []);

    // Save Preferences
    const savePreferences = async (newNotifs, newPrivacy) => {
        try {
            await fetch('/api/settings/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preferences: {
                        notifications: newNotifs || notifications,
                        privacy: newPrivacy || privacy
                    }
                })
            });
        } catch (e) {
            console.error("Failed to save preferences", e);
        }
    };

    const toggleNotification = async (key) => {
        const newVal = { ...notifications, [key]: !notifications[key] };

        // Push Logic
        if (key === 'push' && newVal.push) {
            const success = await subscribeToPush();
            if (!success) {
                alert("Please enable notifications in your browser settings.");
                return; // Don't toggle if failed
            }
        }

        setNotifications(newVal);
        savePreferences(newVal, null);
    };

    const subscribeToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
            });

            await fetch('/api/notify/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
            });
            return true;
        } catch (e) {
            console.error("Push Subscribe Error:", e);
            return false;
        }
    };

    function urlBase64ToUint8Array(base64String) {
        if (!base64String) return new Uint8Array(0);
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    const togglePrivacy = (key) => {
        const newVal = { ...privacy, [key]: !privacy[key] };
        setPrivacy(newVal);
        savePreferences(null, newVal);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/auth/delete', { method: 'DELETE' });
            if (res.ok) {
                router.push('/login');
            } else {
                alert("Failed to delete account.");
            }
        } catch (e) {
            alert("Error deleting account.");
        }
    };

    return (
        <motion.div
            className={styles.dashboardContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <AnimatePresence>
                {showPasswordModal && (
                    <PasswordModal onClose={() => setShowPasswordModal(false)} />
                )}
                {showDeleteModal && (
                    <DeleteModal
                        onClose={() => setShowDeleteModal(false)}
                        onConfirm={handleDeleteAccount}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <header className={styles.header} style={{ marginBottom: '2rem' }}>
                <div className={styles.headerActions} style={{ justifyContent: 'flex-start', width: '100%' }}>
                    <motion.button
                        className={styles.iconBtn}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.back()}
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </motion.button>
                    <h1 style={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Settings</h1>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: 100 }}>

                {loading ? (
                    // Skeleton Loading State
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className={styles.settingsSection} style={{ height: 150, display: 'flex', flexDirection: 'column', gap: 15, justifyContent: 'center' }}>
                                <div style={{ width: 120, height: 20, background: 'var(--nav-pill-bg)', borderRadius: 4, animation: 'pulse 1.5s infinite' }}></div>
                                <div style={{ width: '100%', height: 60, background: 'var(--nav-pill-bg)', borderRadius: 12, opacity: 0.5, animation: 'pulse 1.5s infinite delay-100' }}></div>
                            </div>
                        ))}
                        <style jsx>{`
                            @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
                        `}</style>
                    </div>
                ) : (
                    <>
                        {/* Appearance - Theme */}
                        <motion.section className={styles.settingsSection} variants={itemVariants}>
                            <div className={styles.sectionTitle}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Appearance
                            </div>
                            <ThemeToggle />
                        </motion.section>

                        {/* Account Settings */}
                        <motion.section className={styles.settingsSection} variants={itemVariants}>
                            <div className={styles.sectionTitle}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Account
                            </div>
                            {/* Email is typically read-only or requires re-auth flow which is complex, keeping simple for now */}
                            <div className={styles.settingItem}>
                                <div className={styles.settingInfo}>
                                    <h4>Password</h4>
                                    <p>Update your login password</p>
                                </div>
                                <button
                                    className={styles.editProfileBtn}
                                    onClick={() => setShowPasswordModal(true)}
                                    style={{ padding: '6px 16px', fontSize: '0.9rem' }}
                                >
                                    Change
                                </button>
                            </div>
                        </motion.section>

                        {/* Notifications */}
                        <motion.section className={styles.settingsSection} variants={itemVariants}>
                            <div className={styles.sectionTitle}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                Notifications
                            </div>
                            <ToggleItem
                                label="Push Notifications"
                                desc="Receive alerts on your device"
                                isActive={notifications.push}
                                onToggle={() => toggleNotification('push')}
                            />
                            <ToggleItem
                                label="Email Updates"
                                desc="Get weekly digest and match emails"
                                isActive={notifications.email}
                                onToggle={() => toggleNotification('email')}
                            />
                            <ToggleItem
                                label="Marketing"
                                desc="Receive offers and promotions"
                                isActive={notifications.marketing}
                                onToggle={() => toggleNotification('marketing')}
                            />
                        </motion.section>

                        {/* Privacy */}
                        <motion.section className={styles.settingsSection} variants={itemVariants}>
                            <div className={styles.sectionTitle}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Privacy
                            </div>
                            <ToggleItem
                                label="Private Profile"
                                desc="Only show profile to matches"
                                isActive={privacy.privateProfile}
                                onToggle={() => togglePrivacy('privateProfile')}
                            />
                            <ToggleItem
                                label="Activity Status"
                                desc="Show when you were last active"
                                isActive={privacy.activityStatus}
                                onToggle={() => togglePrivacy('activityStatus')}
                            />
                        </motion.section>

                        {/* Customer Support */}
                        <motion.section className={styles.settingsSection} variants={itemVariants}>
                            <div className={styles.sectionTitle}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                Customer Support
                            </div>
                            <SupportForm />
                        </motion.section>

                        {/* Danger Zone */}
                        <motion.section className={styles.settingsSection} variants={itemVariants} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <div className={styles.sectionTitle} style={{ color: '#ef4444' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Danger Zone
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button className={styles.dangerBtn} onClick={handleLogout}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Log Out
                                </button>
                                <button
                                    className={styles.dangerBtn}
                                    style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444' }}
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </motion.section>
                    </>
                )}

            </main>
        </motion.div>
    );
}

// Subcomponents
function PasswordModal({ onClose }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/settings/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(onClose, 1500);
            } else {
                setStatus(data.error || 'Failed');
            }
        } catch (e) {
            setStatus('Error occurred');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={styles.modalBox}
            >
                <h3 style={{ marginBottom: 20, fontSize: '1.2rem', color: 'var(--text-main)' }}>Change Password</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className={styles.input} />
                    <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className={styles.input} />
                    <button type="submit" style={{ padding: 12, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                        {status === 'loading' ? 'Updating...' : status === 'success' ? 'Password Changed!' : 'Update Password'}
                    </button>
                    {status && status !== 'loading' && status !== 'success' && <p style={{ color: 'red', textAlign: 'center' }}>{status}</p>}
                </form>
                <button onClick={onClose} style={{ marginTop: 15, width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
            </motion.div>
        </div>
    )
}

function DeleteModal({ onClose, onConfirm }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={styles.modalBox}
                style={{ borderColor: '#ef4444' }}
            >
                <h3 style={{ marginBottom: 10, fontSize: '1.2rem', color: '#ef4444' }}>⚠ Delete Account?</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                    This action is permanent and cannot be undone. All your matches, messages, and profile data will be erased forever.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: 12, background: 'var(--nav-pill-bg)', border: 'none', borderRadius: 8, color: 'var(--text-main)' }}>Cancel</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: 12, background: '#ef4444', border: 'none', borderRadius: 8, color: 'white', fontWeight: 'bold' }}>Yes, Delete</button>
                </div>
            </motion.div>
        </div>
    )
}

const SupportForm = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message })
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setSubject('');
                setMessage('');
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className={styles.input}
            />
            <textarea
                placeholder="Describe your issue..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
                className={styles.input}
                style={{ fontFamily: 'inherit' }}
            />
            <button
                disabled={status === 'submitting'}
                style={{ padding: '10px', background: status === 'success' ? '#22c55e' : '#3b82f6', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
                {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Ticket Sent! ✓' : 'Submit Ticket'}
            </button>
            {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>Failed to submit ticket.</p>}
        </form>
    );
};

function ToggleItem({ label, desc, isActive, onToggle }) {
    return (
        <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
                <h4>{label}</h4>
                <p>{desc}</p>
            </div>
            <div
                className={`${styles.toggleSwitch} ${isActive ? styles.active : ''}`}
                onClick={onToggle}
            >
                <div className={styles.toggleKnob} />
            </div>
        </div>
    );
}


function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
                <h4>Theme</h4>
                <p>Select your interface appearance</p>
            </div>
            <div className={styles.themeToggleContainer}>
                <button
                    onClick={() => toggleTheme('light')}
                    style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: theme === 'light' ? 'var(--surface)' : 'transparent',
                        color: theme === 'light' ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    Light
                </button>
                <button
                    onClick={() => toggleTheme('dark')}
                    style={{
                        padding: '6px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: theme === 'dark' ? 'var(--surface)' : 'transparent',
                        color: theme === 'dark' ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    Dark
                </button>
            </div>
        </div>
    );
}
