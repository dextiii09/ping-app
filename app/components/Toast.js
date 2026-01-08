"use client";
import React, { useEffect } from 'react';
import styles from './Toast.module.css';

const Icons = {
    success: () => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    error: () => (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    )
};

export default function Toast({ message, type = 'error', onClose, duration = 3000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const Icon = Icons[type] || Icons.error;

    return (
        <div className={`${styles.toastContainer} ${styles[type]}`}>
            <div className={styles.icon}>
                <Icon />
            </div>
            <span>{message}</span>
        </div>
    );
}
