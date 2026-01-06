"use client";
import val from 'react';
import { useState } from 'react';
import Card from './Card';
import styles from './matching.module.css';

// Mock Data
const MOCK_PROFILES = [
    { id: 1, name: "TechStart Inc", niche: "Technology", location: "San Francisco", budget: "$5k-10k", color: "#4b0082" },
    { id: 2, name: "GreenLife", niche: "Food & Bev", location: "Austin", budget: "$1k-3k", color: "#2e8b57" },
    { id: 3, name: "Fashion Nova", niche: "Fashion", location: "New York", budget: "$10k+", color: "#c71585" },
];

export default function SwipeDeck() {
    const [profiles, setProfiles] = useState(MOCK_PROFILES);
    const [lastDirection, setLastDirection] = useState(null);

    const swipe = (direction) => {
        if (profiles.length === 0) return;

        const card = profiles[0];
        setLastDirection(direction);

        // Animate and remove
        // In a real generic swipe hook, we'd handle x/y delta. 
        // Here we just shift the array.
        setProfiles((prev) => prev.slice(1));

        console.log(`Swiped ${direction} on ${card.name}`);
        // TODO: Call API
    };

    if (profiles.length === 0) {
        return (
            <div className={styles.deckContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>No more profiles!</h3>
                    <p>Check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.deckContainer}>
            {profiles.map((profile, index) => (
                // Only render top 2 cards for performance interaction
                index <= 1 ? (
                    <div
                        key={profile.id}
                        style={{
                            zIndex: profiles.length - index,
                            transform: index === 0 ? 'scale(1)' : 'scale(0.95) translateY(10px)',
                            pointerEvents: index === 0 ? 'auto' : 'none',
                            opacity: index === 0 ? 1 : 0.5,
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Card profile={profile} />
                    </div>
                ) : null
            ))}

            <div className={styles.controls}>
                <button className={`${styles.btnAction} ${styles.btnPass}`} onClick={() => swipe('LEFT')}>
                    ✕
                </button>
                <button className={`${styles.btnAction} ${styles.btnLike}`} onClick={() => swipe('RIGHT')}>
                    ♥
                </button>
            </div>
        </div>
    );
}
