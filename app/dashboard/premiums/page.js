"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Script from 'next/script'; // Import Script
import styles from '../dashboard.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSubscription } from '../../context/SubscriptionContext';

export default function PremiumsPage() {
    const router = useRouter();
    const { tier, setTier, superLikes, boosts, addSuperLikes, addBoosts } = useSubscription();

    // Debugging
    console.log('Current Subscription Tier:', tier);

    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
    const [coupon, setCoupon] = useState('');
    const [message, setMessage] = useState('');
    const [isCouponValid, setIsCouponValid] = useState(false);

    const getPlanId = (index) => {
        if (index === 0) return 'plus';
        if (index === 1) return 'gold';
        return 'platinum';
    };

    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (index) => {
        const planId = getPlanId(index);
        if (tier === planId) return;

        setLoading(true);

        try {
            // 1. Create Order
            const res = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: planId })
            });
            const data = await res.json();

            if (!data.success) {
                alert("Order Creation Failed");
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
                amount: data.order.amount,
                currency: "INR",
                name: "Ping App",
                description: `Upgrade to Ping ${planId.charAt(0).toUpperCase() + planId.slice(1)}`,
                order_id: data.order.id,
                handler: function (response) {
                    // Success! Redirect with success flag
                    window.location.href = `/dashboard?payment=success&tier=${planId}&pid=${response.razorpay_payment_id}`;
                },
                prefill: {
                    name: "User Name", // Ideally fetch from context
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: plans[index].color
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
            setLoading(false);

        } catch (error) {
            console.error(error);
            alert("Payment Failed");
            setLoading(false);
        }
    };

    const isCurrentPlan = (index) => {
        return tier === getPlanId(index);
    };

    const handleApplyCoupon = () => {
        if (coupon === 'WELCOME20') {
            setIsCouponValid(true);
            setMessage('Success! 20% discount applied at checkout.');
        } else if (coupon === 'NXTJN50') {
            setIsCouponValid(true);
            setMessage('Wow! 50% discount applied at checkout.');
        } else {
            setIsCouponValid(false);
            setMessage('Invalid coupon code.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const plans = [
        {
            name: 'Ping Plus',
            price: billingCycle === 'monthly' ? '₹499' : '₹4999',
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            features: [
                'Unlimited Swipes',
                '5 Super Likes/mo',
                '1 Free Boost/mo',
                'No Ads'
            ],
            cta: 'Get Plus',
            popular: false,
            color: '#ff4458', // Tinder Plus Red/Pink
            gradient: 'linear-gradient(45deg, #ff6036, #fd267d)'
        },
        {
            name: 'Ping Gold',
            price: billingCycle === 'monthly' ? '₹999' : '₹9999',
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            features: [
                'See Who Likes You',
                'Global Passport™ (Find Brands Anywhere)',
                'Top Picks (Curated Campaigns)',
                'No Ads'
            ],
            cta: 'Get Gold',
            popular: true,
            color: '#fbbf24', // Gold
            gradient: 'linear-gradient(45deg, #eab308, #f59e0b)'
        },
        {
            name: 'Ping Platinum',
            price: billingCycle === 'monthly' ? '₹1999' : '₹19999',
            period: billingCycle === 'monthly' ? '/mo' : '/yr',
            features: [
                'Priority Likes (Be Seen First)',
                'Message Before Matching (Direct Pitch)',
                'Review Sent Likes for 7 Days',
                'VIP Support'
            ],
            cta: 'Get Platinum',
            popular: false,
            color: '#1f2937', // Platinum/Dark
            gradient: 'linear-gradient(45deg, #374151, #111827)'
        }
    ];

    return (
        <div className={styles.dashboardContainer} style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
                <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
                <button onClick={() => router.back()} className={styles.iconBtn}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>My Subscription</h1>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Unlock your full potential</span>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ padding: '0 1rem', maxWidth: '1200px', margin: '0 auto' }}
            >
                {/* Billing Toggle (Segmented Control) */}
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'rgba(255,255,255,0.08)',
                        padding: '6px',
                        borderRadius: '40px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Monthly Option */}
                        <div
                            onClick={() => setBillingCycle('monthly')}
                            style={{
                                position: 'relative',
                                padding: '10px 30px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: billingCycle === 'monthly' ? 'white' : 'rgba(255,255,255,0.5)',
                                transition: 'color 0.2s',
                                width: '120px',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {billingCycle === 'monthly' && (
                                <motion.div
                                    layoutId="activePill"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        borderRadius: '34px',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                        zIndex: -1
                                    }}
                                />
                            )}
                            Monthly
                        </div>

                        {/* Yearly Option */}
                        <div
                            onClick={() => setBillingCycle('yearly')}
                            style={{
                                position: 'relative',
                                padding: '10px 30px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: billingCycle === 'yearly' ? 'white' : 'rgba(255,255,255,0.5)',
                                transition: 'color 0.2s',
                                width: '120px',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            {billingCycle === 'yearly' && (
                                <motion.div
                                    layoutId="activePill"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)', // Indigo to Purple
                                        borderRadius: '34px',
                                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                        zIndex: -1
                                    }}
                                />
                            )}
                            Yearly
                        </div>
                    </div>

                    {/* Discount Badge Floating */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ marginTop: '0.8rem', display: 'inline-block', position: 'relative', left: '10px' }}
                    >
                        <span style={{
                            background: 'linear-gradient(90deg, #10b981, #059669)',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            SAVE 20%
                        </span>
                    </motion.div>
                </motion.div>

                {/* Plans Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -10, boxShadow: `0 20px 40px -10px ${plan.color}40` }}
                            className={styles.settingsSection}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: 0,
                                border: plan.popular ? `2px solid ${plan.color}` : '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                background: '#111'
                            }}
                        >
                            {/* Gradient Header */}
                            <div style={{ background: plan.gradient, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                {plan.popular && (
                                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.3)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                                        MOST POPULAR
                                    </div>
                                )}
                                <h3 style={{ fontSize: '2rem', color: 'white', margin: 0, fontFamily: 'cursive', fontStyle: 'italic' }}>{plan.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: '0.5rem' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>{plan.price}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{plan.period}</span>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                    {i === 2 ? 'The ultimate VIP experience.' : i === 1 ? 'Stand out and get more matches.' : 'Level up your liking game.'}
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', width: '100%' }}>
                                    {plan.features.map((feat, j) => (
                                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem', color: '#eee', fontSize: '1rem' }}>
                                            <div style={{ minWidth: 24, height: 24, borderRadius: '50%', background: plan.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                    {/* Previous tier includes */}
                                    {i > 0 && (
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', color: '#666', fontStyle: 'italic' }}>
                                            <div style={{ width: 24, display: 'flex', justifyContent: 'center' }}>+</div>
                                            Everything in {plans[i - 1].name.split(' ')[1]}
                                        </li>
                                    )}
                                </ul>

                                <button
                                    style={{
                                        width: '100%',
                                        padding: '18px',
                                        borderRadius: 30,
                                        border: 'none',
                                        background: isCurrentPlan(i) ? '#333' : plan.gradient,
                                        color: 'white',
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        cursor: isCurrentPlan(i) ? 'default' : 'pointer',
                                        marginTop: 'auto',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                                        opacity: isCurrentPlan(i) ? 0.5 : 1
                                    }}
                                    onClick={() => handleSubscribe(i)}
                                    disabled={loading}
                                >
                                    {isCurrentPlan(i) ? 'Current Plan' : (loading ? 'Processing...' : plan.cta)}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* POWER UPS SECTION (A La Carte) */}
                <motion.div variants={itemVariants} style={{ marginTop: '4rem', marginBottom: '4rem' }}>
                    <h2 className="gradient-text" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>Power Ups</h2>
                    <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '2rem' }}>Need an extra edge without a subscription?</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

                        {/* Super Likes Card */}
                        <motion.div
                            style={{ background: '#111', padding: '2rem', borderRadius: 20, border: '1px solid rgba(59, 130, 246, 0.3)', position: 'relative', overflow: 'hidden' }}
                            whileHover={{ y: -5, borderColor: '#3b82f6' }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 15px', background: '#3b82f6', borderBottomLeftRadius: 15, fontWeight: 'bold' }}>
                                Balance: {superLikes}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ color: '#3b82f6' }}>★</span> Super Likes
                            </h3>
                            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Stand out from the crowd with a Super Like. They verify you're serious.</p>
                            <button
                                onClick={() => {
                                    if (confirm("Buy 5 Super Likes for ₹199?")) { addSuperLikes(5); alert("Added 5 Super Likes!"); }
                                }}
                                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Buy 5 for ₹199
                            </button>
                        </motion.div>

                        {/* Boosts Card */}
                        <motion.div
                            style={{ background: '#111', padding: '2rem', borderRadius: 20, border: '1px solid rgba(168, 85, 247, 0.3)', position: 'relative', overflow: 'hidden' }}
                            whileHover={{ y: -5, borderColor: '#a855f7' }}
                        >
                            <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 15px', background: '#a855f7', borderBottomLeftRadius: 15, fontWeight: 'bold' }}>
                                Balance: {boosts}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ color: '#a855f7' }}>🚀</span> Boost
                            </h3>
                            <p style={{ color: '#888', marginBottom: '1.5rem' }}>Be the top profile in your area for 30 minutes. Get up to 10x more views.</p>
                            <button
                                onClick={() => {
                                    if (confirm("Buy 1 Boost for ₹299?")) { addBoosts(1); alert("Boost activated instantly (added to inventory)!"); }
                                }}
                                style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#a855f7', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Buy 1 for ₹299
                            </button>
                        </motion.div>

                    </div>
                </motion.div>

                {/* Coupon Code Section */}
                <motion.div variants={itemVariants} style={{ marginTop: '4rem', textAlign: 'center', maxWidth: '500px', margin: '4rem auto 0' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Have a Coupon Code?</h3>
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '8px',
                        borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <input
                            type="text"
                            placeholder="Enter Code (e.g. WELCOME20)"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                padding: '0 20px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={handleApplyCoupon}
                            style={{
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                borderRadius: '40px',
                                padding: '12px 30px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Apply
                        </button>
                    </div>
                    {message && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1rem',
                                color: isCouponValid ? '#4ade80' : '#ef4444',
                                fontWeight: 'bold'
                            }}
                        >
                            {message}
                        </motion.p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
