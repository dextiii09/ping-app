"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../dashboard.module.css';

// === ICONS ===
const Icons = {
    Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Reports: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Support: () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
};

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('users');
    const [stats, setStats] = useState({ users: 0, reports: 0, tickets: 0 });

    // Data States
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatUser, setChatUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [userRes, reportRes, ticketRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/report'),
                fetch('/api/support')
            ]);

            if (userRes.status === 403) return router.push('/'); // Should act better

            const userData = await userRes.json();
            const reportData = await reportRes.json();
            const ticketData = await ticketRes.json();

            if (userData.success) setUsers(userData.users || []);
            if (reportData.success) setReports(reportData.reports || []);
            if (ticketData.success) setTickets(ticketData.tickets || []);

            // Calculate Stats
            setStats({
                users: (userData.users || []).length,
                reports: (reportData.reports || []).filter(r => r.status === 'PENDING').length,
                tickets: (ticketData.tickets || []).filter(t => t.status === 'OPEN').length
            });

        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    // === ACTIONS ===

    // User Verification
    const toggleVerification = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: newStatus } : u));
        try {
            await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isVerified: newStatus })
            });
        } catch { fetchAllData(); }
    };

    // Chat Viewer
    const loadUserChats = async (user) => {
        setChatUser(user);
        setConversations([]);
        setActiveConversation(null);
        try {
            const res = await fetch(`/api/admin/messages/${user.id}`);
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations);
                if (data.conversations.length > 0) setActiveConversation(data.conversations[0]);
            }
        } catch (e) { console.error(e); }
    };

    // Report Actions
    const handleReportAction = async (id, status) => {
        // Optimistic
        setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        // Update Stats
        if (status !== 'PENDING') setStats(prev => ({ ...prev, reports: Math.max(0, prev.reports - 1) }));

        await fetch('/api/report', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
    };

    // Ticket Actions
    const handleTicketAction = async (id, status) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        if (status !== 'OPEN') setStats(prev => ({ ...prev, tickets: Math.max(0, prev.tickets - 1) }));

        await fetch('/api/support', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
    };


    return (
        <div className={styles.dashboardContainer} style={{ minHeight: '100vh', background: '#09090b' }}>
            {/* Header */}
            <div style={{ padding: '2rem 2rem 0', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icons.Shield /> Admin Portal
                    </h1>
                    <p style={{ color: '#aaa', marginTop: 5 }}>Control center for moderation and support.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', width: '100%', maxWidth: '600px' }}>
                    <StatCard label="Total Users" value={stats.users} color="#3b82f6" />
                    <StatCard label="Pending Reports" value={stats.reports} color="#ef4444" />
                    <StatCard label="Open Tickets" value={stats.tickets} color="#eab308" />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 2rem', marginTop: '2rem', borderBottom: '1px solid #27272a', display: 'flex', gap: 30, overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                <TabBtn label="User Management" icon={<Icons.Users />} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabBtn label="Reports & Safety" icon={<Icons.Reports />} count={stats.reports} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                <TabBtn label="Support Tickets" icon={<Icons.Support />} count={stats.tickets} active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
            </div>

            {/* Content Content */}
            <div style={{ padding: '2rem' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Table>
                                <THead>
                                    <tr>
                                        <Th>User</Th>
                                        <Th>Role</Th>
                                        <Th>Status</Th>
                                        <Th>Verification</Th>
                                        <Th align="right">Actions</Th>
                                    </tr>
                                </THead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #27272a' }}>
                                            <Td>
                                                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                                            </Td>
                                            <Td>
                                                <Badge color={user.role === 'BUSINESS' ? 'blue' : 'pink'}>{user.role}</Badge>
                                            </Td>
                                            <Td>
                                                <Badge color={user.isVerified ? 'green' : 'gray'}>{user.isVerified ? 'Verified' : 'Unverified'}</Badge>
                                            </Td>
                                            <Td>
                                                {user.verificationDocs ? (
                                                    <button
                                                        onClick={() => alert(`Docs: ${user.verificationDocs}`)}
                                                        style={{ fontSize: '0.8rem', color: '#aaa', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        View Docs 📄
                                                    </button>
                                                ) : <span style={{ color: '#444' }}>-</span>}
                                            </Td>
                                            <Td align="right">
                                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                                    <ActionBtn onClick={() => setSelectedUser(user)}>Profile</ActionBtn>
                                                    <ActionBtn onClick={() => loadUserChats(user)}>Chats</ActionBtn>
                                                    <ActionBtn
                                                        danger={user.isVerified}
                                                        success={!user.isVerified}
                                                        onClick={() => toggleVerification(user.id, user.isVerified)}
                                                    >
                                                        {user.isVerified ? 'Revoke' : 'Verify'}
                                                    </ActionBtn>
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </motion.div>
                    )}

                    {activeTab === 'reports' && (
                        <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Table>
                                <THead>
                                    <tr>
                                        <Th>Type</Th>
                                        <Th>Reason</Th>
                                        <Th>Target User</Th>
                                        <Th>Reported By</Th>
                                        <Th>Status</Th>
                                        <Th align="right">Actions</Th>
                                    </tr>
                                </THead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id} style={{ borderBottom: '1px solid #27272a' }}>
                                            <Td><Badge color="red">{report.type}</Badge></Td>
                                            <Td>{report.reason}</Td>
                                            <Td>
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{report.target?.email || 'Unknown'}</span>
                                            </Td>
                                            <Td style={{ color: '#888' }}>{report.reporter?.email || 'Unknown'}</Td>
                                            <Td><StatusBadge status={report.status} /></Td>
                                            <Td align="right">
                                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                                    {report.status === 'PENDING' && (
                                                        <>
                                                            <ActionBtn onClick={() => handleReportAction(report.id, 'DISMISSED')}>Dismiss</ActionBtn>
                                                            <ActionBtn danger onClick={() => handleReportAction(report.id, 'BANNED')}>Ban User</ActionBtn>
                                                        </>
                                                    )}
                                                    {report.status !== 'PENDING' && <span style={{ color: '#666', fontSize: '0.9rem' }}>{report.status}</span>}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && <tr><Td colSpan={6} align="center">No reports found 🎉</Td></tr>}
                                </tbody>
                            </Table>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <Table>
                                <THead>
                                    <tr>
                                        <Th>Subject</Th>
                                        <Th>User</Th>
                                        <Th>Message</Th>
                                        <Th>Status</Th>
                                        <Th align="right">Actions</Th>
                                    </tr>
                                </THead>
                                <tbody>
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} style={{ borderBottom: '1px solid #27272a' }}>
                                            <Td style={{ fontWeight: 'bold' }}>{ticket.subject}</Td>
                                            <Td>{ticket.user?.email}</Td>
                                            <Td style={{ color: '#aaa', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.message}</Td>
                                            <Td><StatusBadge status={ticket.status} /></Td>
                                            <Td align="right">
                                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                                    <a href={`mailto:${ticket.user?.email}?subject=Re: ${ticket.subject}`} style={{ textDecoration: 'none' }}>
                                                        <ActionBtn>Reply ✉️</ActionBtn>
                                                    </a>
                                                    {ticket.status !== 'RESOLVED' && (
                                                        <ActionBtn success onClick={() => handleTicketAction(ticket.id, 'RESOLVED')}>Resolve</ActionBtn>
                                                    )}
                                                </div>
                                            </Td>
                                        </tr>
                                    ))}
                                    {tickets.length === 0 && <tr><Td colSpan={5} align="center">No tickets found.</Td></tr>}
                                </tbody>
                            </Table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- MODALS (Reused from previous code with improved styling) --- */}

            {/* User Profile Modal */}
            {selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: '#1c1c1e', padding: 30, borderRadius: 16, width: '90%', maxWidth: 500, border: '1px solid #333' }}>
                        <h2 style={{ marginTop: 0 }}>{selectedUser.name}</h2>
                        {/* ... (Keep existing profile display logic but styled better) ... */}
                        <pre style={{ background: '#111', padding: 10, borderRadius: 8, overflow: 'auto', maxHeight: 300, fontSize: '0.8rem', color: '#aaa' }}>
                            {JSON.stringify(selectedUser, null, 2)}
                        </pre>
                        <button onClick={() => setSelectedUser(null)} style={{ marginTop: 20, width: '100%', padding: 12, borderRadius: 8, background: '#333', border: 'none', color: 'white', cursor: 'pointer' }}>Close</button>
                    </motion.div>
                </div>
            )}

            {/* Chat Viewer Modal */}
            {chatUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '90%', height: '85vh', maxWidth: 1000, background: '#09090b', borderRadius: 16, border: '1px solid #333', display: 'flex', overflow: 'hidden' }}>
                        <div style={{ width: 300, borderRight: '1px solid #27272a', background: '#111' }}>
                            <div style={{ padding: 20, borderBottom: '1px solid #27272a' }}>
                                <h3 style={{ margin: 0 }}>Chats: {chatUser.name}</h3>
                            </div>
                            <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
                                {conversations.map(c => (
                                    <div key={c.id} onClick={() => setActiveConversation(c)} style={{ padding: 15, borderBottom: '1px solid #222', cursor: 'pointer', background: activeConversation?.id === c.id ? '#27272a' : 'transparent' }}>
                                        <div style={{ fontWeight: 'bold' }}>{c.partnerName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{c.messages.length} msgs</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: 20, borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between' }}>
                                <b>{activeConversation ? `Talking to ${activeConversation.partnerName}` : 'Select a chat'}</b>
                                <button onClick={() => setChatUser(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Close Window</button>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {activeConversation?.messages.map(m => (
                                    <div key={m.id} style={{ alignSelf: m.isFromTarget ? 'flex-end' : 'flex-start', background: m.isFromTarget ? '#3b82f6' : '#27272a', padding: '8px 14px', borderRadius: 12, maxWidth: '70%' }}>
                                        {m.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// === COMPONENT HELPERS ===

const StatCard = ({ label, value, color }) => (
    <div style={{ background: '#18181b', padding: '15px 25px', borderRadius: 12, border: '1px solid #27272a', minWidth: 150 }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>{value}</div>
        <div style={{ color: '#888', fontSize: '0.9rem' }}>{label}</div>
    </div>
);

const TabBtn = ({ label, icon, active, onClick, count }) => (
    <button onClick={onClick} style={{ background: 'none', border: 'none', padding: '10px 0', borderBottom: active ? '2px solid #ec4899' : '2px solid transparent', color: active ? 'white' : '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', transition: 'all 0.2s', position: 'relative' }}>
        {icon} {label}
        {count > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, position: 'absolute', top: -5, right: -10 }}>{count}</span>}
    </button>
);

const Table = ({ children }) => (
    <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e4e4e7', minWidth: '600px' }}>{children}</table>
    </div>
);
const THead = ({ children }) => <thead style={{ borderBottom: '1px solid #27272a', color: '#a1a1aa', fontSize: '0.9rem', textAlign: 'left' }}>{children}</thead>;
const Th = ({ children, align = 'left' }) => <th style={{ padding: '15px 10px', fontWeight: 'normal', textAlign: align }}>{children}</th>;
const Td = ({ children, align = 'left' }) => <td style={{ padding: '15px 10px', textAlign: align }}>{children}</td>;

const Badge = ({ children, color }) => {
    const colors = {
        blue: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
        pink: { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
        green: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
        red: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
        gray: { bg: 'rgba(113, 113, 122, 0.15)', text: '#a1a1aa' },
    };
    const c = colors[color] || colors.gray;
    return <span style={{ background: c.bg, color: c.text, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{children}</span>;
};

const StatusBadge = ({ status }) => {
    let color = 'gray';
    if (status === 'PENDING' || status === 'OPEN') color = 'yellow'; // pending
    if (status === 'RESOLVED' || status === 'DISMISSED') color = 'green';
    if (status === 'BANNED') color = 'red';

    // Custom logic for color mapping
    const map = { PENDING: 'red', OPEN: 'blue', RESOLVED: 'green', DISMISSED: 'gray', BANNED: 'red' };
    return <Badge color={map[status] || 'gray'}>{status}</Badge>
};

const ActionBtn = ({ children, onClick, danger, success }) => (
    <button
        onClick={onClick}
        style={{
            background: danger ? 'rgba(239, 68, 68, 0.1)' : success ? 'rgba(34, 197, 94, 0.1)' : '#27272a',
            color: danger ? '#ef4444' : success ? '#22c55e' : '#e4e4e7',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
        }}
    >
        {children}
    </button>
);
