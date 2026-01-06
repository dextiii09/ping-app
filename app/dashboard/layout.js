"use client";
import { SubscriptionProvider } from '../context/SubscriptionContext';

export default function DashboardLayout({ children }) {
    return (
        <SubscriptionProvider>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* Layout Header Removed to allow individual page customizations */}
                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </SubscriptionProvider>
    );
}
