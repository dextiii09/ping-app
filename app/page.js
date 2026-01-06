import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Dynamic Background */}
      <div className={styles.background}>
        <div className={styles.mesh}></div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>PING</div>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>Login</Link>
          <Link href="/register" className={styles.navLink}>Get Started</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.gradientText}>Ping</span> the World
        </h1>
        <p className={styles.subtitle}>
          Where Brands & Creators Click. The fastest way to collaborate.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/register/business" className={styles.btnPrimary}>
            I'm a Business
          </Link>
          <Link href="/register/influencer" className={styles.btnPrimary}>
            I'm a Creator
          </Link>
        </div>
      </header>

      {/* Feature Showcase */}
      <div className={styles.features}>
        <div className={styles.featureCard}>
          <span className={styles.icon}>⚡</span>
          <h3>Instant Matching</h3>
          <p>Swipe right to connect. No cold emails, just warm leads.</p>
        </div>
        <div className={styles.featureCard} style={{ animationDelay: '0.6s' }}>
          <span className={styles.icon}>🛡️</span>
          <h3>Verified Trust</h3>
          <p>Every business and creator is manually verified for authenticity.</p>
        </div>
        <div className={styles.featureCard} style={{ animationDelay: '0.8s' }}>
          <span className={styles.icon}>💬</span>
          <h3>Direct Chat</h3>
          <p>Negotiate terms and close deals instantly in our secured chat.</p>
        </div>
      </div>
    </div>
  );
}
