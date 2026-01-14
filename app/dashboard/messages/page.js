"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/chat.module.css';

export default function MessagesPage() {
    const router = useRouter();
    const [matches, setMatches] = useState([]);
    const [activeMatch, setActiveMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [reportModal, setReportModal] = useState({ show: false, targetId: null, name: '' });

    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch Conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages/conversations');
            const data = await res.json();
            if (data.success) {
                setMatches(data.conversations);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Messages
    const fetchMessages = async (matchId) => {
        if (!matchId) return;
        try {
            const res = await fetch(`/api/messages/${matchId}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (activeMatch) {
            fetchMessages(activeMatch.id);
            const interval = setInterval(() => fetchMessages(activeMatch.id), 3000);
            return () => clearInterval(interval);
        } else {
            setMessages([]);
        }
    }, [activeMatch]);

    // 3. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeMatch) return;

        const tempId = Date.now();
        const textToSend = input;

        // Optimistic Update
        const optimisticMsg = {
            id: tempId,
            text: textToSend,
            sender: "me",
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput("");

        try {
            const res = await fetch(`/api/messages/${activeMatch.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSend })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
                fetchConversations();
            }
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    return (
        <div className={styles.container}>
            {/* SIDEBAR */}
            <div className={`${styles.sidebar} ${activeMatch ? styles.hiddenOnMobile : ''}`}>
                <div className={styles.sidebarHeader}>
                    <button onClick={() => router.push('/dashboard')} className={styles.backBtn} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginRight: 10, padding: 0, display: 'flex', alignItems: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    Messages
                </div>

                <div className={styles.matchList}>
                    {loading && <div style={{ padding: 20, color: 'var(--text-muted)' }}>Loading...</div>}
                    {!loading && matches.length === 0 && <div style={{ padding: 20, color: 'var(--text-muted)' }}>No matches yet. Go swipe!</div>}

                    {matches.map(match => (
                        <div
                            key={match.id}
                            className={`${styles.matchItem} ${activeMatch?.id === match.id ? styles.activeMatch : ''}`}
                            onClick={() => setActiveMatch(match)}
                        >
                            <div className={styles.avatar}>
                                {match.image ?
                                    <img src={match.image} alt={match.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : match.name[0]
                                }
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div className={styles.matchName}>
                                    {match.name}
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, opacity: 0.7 }}>
                                        {new Date(match.lastMsgTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className={styles.lastMsg}>{match.lastMsg}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CHAT AREA */}
            <AnimatePresence mode="wait">
                {activeMatch ? (
                    <motion.div
                        key="chat"
                        className={`${styles.chatArea} ${!activeMatch ? styles.hiddenOnMobile : ''}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className={styles.chatHeader}>
                            <div className={styles.headerInfo}>
                                <button
                                    className={styles.mobileBackBtn}
                                    onClick={() => setActiveMatch(null)}
                                >
                                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className={styles.avatar}>
                                    {activeMatch.image ?
                                        <img src={activeMatch.image} alt={activeMatch.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : activeMatch.name[0]
                                    }
                                </div>
                                <div className={styles.headerName}>{activeMatch.name}</div>
                            </div>

                            <button
                                className={styles.reportBtn}
                                onClick={() => setReportModal({ show: true, targetId: activeMatch.otherUserId, name: activeMatch.name, contextId: activeMatch.id })}
                                title="Report User"
                            >
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
                            </button>
                        </div>

                        {/* Messages List */}
                        <div className={styles.messages}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id || idx}
                                    className={`${styles.messageWrapper} ${msg.sender === 'me' ? styles.sentWrapper : styles.receivedWrapper}`}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`${styles.message} ${msg.sender === 'me' ? styles.sent : styles.received}`}>
                                        {msg.text}
                                    </div>
                                    <div className={styles.timestamp}>
                                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Floating Input */}
                        <div className={styles.inputContainer}>
                            <form className={styles.inputArea} onSubmit={handleSend}>
                                <input
                                    className={styles.textInput}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <button type="submit" className={styles.sendBtn}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className={`${styles.chatArea} ${!activeMatch ? styles.hiddenOnMobile : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>💬</div>
                            <h3>Select a conversation to start chatting</h3>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ReportModal
                show={reportModal.show}
                onClose={() => setReportModal({ ...reportModal, show: false })}
                targetId={reportModal.targetId}
                targetName={reportModal.name}
                type="CHAT"
                contextId={reportModal.contextId}
            />
        </div>
    );
}

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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#1c1c1e', padding: 25, borderRadius: 24, width: '90%', maxWidth: 350, border: '1px solid #333', color: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Report {targetName}</h3>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 15 }}>Why are you reporting this user?</p>

                <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 12, background: '#333', border: '1px solid #444', color: 'white', marginBottom: 15, outline: 'none' }}
                >
                    <option value="">Select a reason</option>
                    <option value="Spam">Spam/Scam</option>
                    <option value="Inappropriate">Inappropriate Content</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Other">Other</option>
                </select>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={status === 'submitting' || !reason}
                        style={{ padding: '10px 20px', background: status === 'success' ? '#22c55e' : '#ef4444', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                        {status === 'success' ? 'Reported' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};
