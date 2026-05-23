import React from 'react';

interface UserAvatarProps {
    url?: string | null;
    name?: string | null;
    email?: string | null;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function UserAvatar({ url, name, email, size = 40, className = '', style }: UserAvatarProps) {
    // ── Initials fallback ──────────────────────────────────────────────────
    const getInitials = () => {
        const str = name || email || '?';
        const parts = str.trim().split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    const containerStyle: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: '#1e293b', // Fallback color
        backgroundImage: 'linear-gradient(135deg, #334155, #1e293b)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: `${size * 0.4}px`, // Scale font size based on avatar size
        ...style,
    };

    if (url) {
        return (
            <div className={className} style={containerStyle}>
                <img
                    src={url}
                    alt={name || 'Avatar'}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            </div>
        );
    }

    return (
        <div className={className} style={containerStyle}>
            {getInitials()}
        </div>
    );
}
