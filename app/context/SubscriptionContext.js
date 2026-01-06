"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    // Default to 'free'. Options: 'free', 'plus', 'gold', 'platinum'
    const [tier, setTier] = useState('free');

    // Consumables
    const [superLikes, setSuperLikes] = useState(3); // Start with 3 free
    const [boosts, setBoosts] = useState(0);

    // Helper to check if user has access level
    const hasAccess = (requiredTier) => {
        const levels = ['free', 'plus', 'gold', 'platinum'];
        return levels.indexOf(tier) >= levels.indexOf(requiredTier);
    };

    const upgradeTier = (newTier) => {
        setTier(newTier);
        // Grant monthly allowance based on tier
        if (newTier === 'plus') { setSuperLikes(prev => prev + 5); setBoosts(prev => prev + 1); }
        if (newTier === 'gold') { setSuperLikes(prev => prev + 10); setBoosts(prev => prev + 2); }
        if (newTier === 'platinum') { setSuperLikes(prev => prev + 20); setBoosts(prev => prev + 5); }
    };

    const addSuperLikes = (amount) => setSuperLikes(prev => prev + amount);
    const addBoosts = (amount) => setBoosts(prev => prev + amount);

    const consumeSuperLike = () => {
        if (tier === 'platinum') return true; // Unlimited for Platinum
        if (superLikes > 0) {
            setSuperLikes(prev => prev - 1);
            return true;
        }
        return false;
    };

    const consumeBoost = () => {
        if (boosts > 0) {
            setBoosts(prev => prev - 1);
            return true;
        }
        return false;
    };

    return (
        <SubscriptionContext.Provider value={{
            tier,
            setTier: upgradeTier,
            hasAccess,
            superLikes,
            boosts,
            addSuperLikes,
            addBoosts,
            consumeSuperLike,
            consumeBoost
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
