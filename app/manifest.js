export default function manifest() {
    return {
        name: 'Ping - Creator Matchmaking',
        short_name: 'Ping',
        description: 'Connect, Collaborate, Create. The Tinder for B2B Creator Marketing.',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#8a2be2',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
