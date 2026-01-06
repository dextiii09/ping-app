"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/components/chat.module.css';

export default function MessagesPage() {
    const router = useRouter();
    const [matches, setMatches] = useState([]);
    const [activeMatch, setActiveMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [reportModal, setReportModal] = useState({ show: false, targetId: null, name: '' });

    // 1. Fetch Conversations (Matches)
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages/conversations');
            const data = await res.json();
            if (data.success) {
                setMatches(data.conversations);
                // Optionally select first match if none selected
                if (!activeMatch && data.conversations.length > 0) {
                    // setActiveMatch(data.conversations[0]); 
                }
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    // 2. Fetch Messages for Active Match
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
            const interval = setInterval(() => fetchMessages(activeMatch.id), 3000); // Poll chat every 3s
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
        const optimisticMsg = { id: tempId, text: textToSend, sender: "me" };
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
                // Replace optimistic msg (or just re-fetch next poll will fix it)
                setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
                fetchConversations(); // Update last msg in sidebar
            }
        } catch (error) {
            console.error("Failed to send", error);
        }
    };

    return (
        <div className={styles.container}>
            {/* SIDEBAR */}
            <div className={styles.sidebar}>
                <div style={{ padding: '1rem', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    Messages
                </div>
                <div className={styles.matchList}>
                    {loading && <div style={{ padding: 20, color: '#666', fontSize: '0.9rem' }}>Loading conversations...</div>}
                    {!loading && matches.length === 0 && <div style={{ padding: 20, color: '#666', fontSize: '0.9rem' }}>No matches yet. Go swipe!</div>}

                    {matches.map(match => (
                        <div
                            key={match.id}
                            className={`${styles.matchItem} ${activeMatch?.id === match.id ? styles.activeMatch : ''}`}
                            onClick={() => setActiveMatch(match)}
                        >
                            <div className={styles.avatar}>
                                {match.image ? <img src={match.image} alt={match.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : match.name[0]}
                            </div>
                            <div style={{ overflow: 'hidden', width: '100%' }}>
                                <div className={styles.matchName}>
                                    {match.name}
                                    <span style={{ float: 'right', fontSize: '0.7rem', color: '#555', fontWeight: 400 }}>
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
            <div className={styles.chatArea}>
                {activeMatch ? (
                    <>
                        <div className={styles.chatHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className={styles.avatar}>
                                    {activeMatch.image ? <img src={activeMatch.image} alt={activeMatch.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : activeMatch.name[0]}
                                </div>
                                <h3>{activeMatch.name}</h3>
                            </div>
                            <button
                                onClick={() => setReportModal({ show: true, targetId: activeMatch.otherUserId, name: activeMatch.name, contextId: activeMatch.id })}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem' }}
                                title="Report User"
                            >
                                ⚠️
                            </button>
                        </div>

                        <div className={styles.messages}>
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`${styles.message} ${msg.sender === 'me' ? styles.sent : styles.received}`}>
                                    {msg.text}
                                </div>
                            ))}
                            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Say hi to {activeMatch.name}! 👋</div>}
                        </div>

                        <form className={styles.inputArea} onSubmit={handleSend}>
                            <input
                                className={styles.textInput}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit" className={styles.sendBtn}>➤</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#444' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 20 }}>💬</div>
                        <h3>Select a conversation</h3>
                    </div>
                )}
            </div>
            {/* Report Modal */}
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
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#1c1c1e', padding: 25, borderRadius: 16, width: '90%', maxWidth: 350, border: '1px solid #333', color: 'white' }}>
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
