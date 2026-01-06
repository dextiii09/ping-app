"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from '../dashboard.module.css';

const StatCard = ({ title, value, icon, delay, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16
        }}
    >
        <div style={{
            width: 50, height: 50, borderRadius: 14,
            background: `linear-gradient(135deg, ${color})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
            {icon}
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 500 }}>{title}</h3>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>{value}</div>
        </div>
    </motion.div>
);

const SimpleBarChart = ({ data }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 200, marginTop: 20, gap: 8 }}>
        {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                    width: '100%',
                    maxWidth: 30,
                    height: `${Math.min(d.views * 10, 150)}px`, // simple scaling
                    background: '#8b5cf6',
                    borderRadius: '8px 8px 0 0',
                    opacity: 0.8,
                    marginBottom: 8,
                    position: 'relative'
                }}>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        style={{ width: '100%', background: '#ec4899', height: '100%', position: 'absolute', bottom: 0, opacity: 0.5 }}
                    />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{d.date}</span>
            </div>
        ))}
    </div>
);

export default function AnalyticsPage() {
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/analytics');
                const data = await res.json();
                if (data.success) setStats(data.stats);
            } catch (error) {
                console.error("Failed to load analytics");
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#666' }}>
            Loading stats...
        </div>
    );

    return (
        <div className={styles.dashboardContainer} style={{ minHeight: '100vh', padding: 24, paddingBottom: 100 }}>
            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Analytics</h1>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Last 7 Days</div>
            </div>

            {/* ERROR STATE */}
            {!stats && <div style={{ color: 'red' }}>Failed to load data.</div>}

            {/* STATS GRID */}
            {stats && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20, marginBottom: 30 }}>
                        <StatCard
                            title="Total Views"
                            value={stats.totalViews}
                            icon="👁️"
                            color="#3b82f6, #0ea5e9"
                            delay={0}
                        />
                        <StatCard
                            title="Likes Received"
                            value={stats.swipesReceived}
                            icon="❤️"
                            color="#ec4899, #db2777"
                            delay={0.1}
                        />
                        <StatCard
                            title="Matches"
                            value={stats.matchesCount}
                            icon="🔥"
                            color="#eab308, #ca8a04"
                            delay={0.2}
                        />
                        <StatCard
                            title="Messages"
                            value={stats.messagesReceived}
                            icon="💬"
                            color="#8b5cf6, #7c3aed"
                            delay={0.3}
                        />
                    </div>

                    {/* MAIN CHART CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 24,
                            padding: 30
                        }}
                    >
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Profile Activity</h3>
                        <p style={{ color: '#71717a', fontSize: '0.9rem', margin: 0 }}>Views vs Likes over time</p>

                        <SimpleBarChart data={stats.history} />
                    </motion.div>
                </>
            )}
        </div>
    );
}
