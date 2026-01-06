import styles from './matching.module.css';

export default function Card({ profile }) {
    return (
        <div className={styles.card}>
            <div className={styles.imagePlaceholder} style={{ background: profile.color || '#333' }}>
                {/* Real app would use Next Image */}
                <span>{profile.name[0]}</span>
            </div>
            <div className={styles.info}>
                <h3>{profile.name}, {profile.age || ''}</h3>
                <p className={styles.niche}>{profile.niche}</p>
                <p className={styles.meta}>{profile.location} • {profile.followers || profile.budget}</p>
                <p className={styles.bio}>{profile.bio || "No bio available."}</p>
            </div>
        </div>
    );
}
