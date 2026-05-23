import React from 'react';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = true, text }) => {
    const containerStyle: React.CSSProperties = fullScreen
        ? {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: 'var(--bg-app, #0f0f13)', // Fallback to dark if var not ready
            color: 'white',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }
        : {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: 'white'
        };

    return (
        <div style={containerStyle}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            {text && <div style={{ marginTop: '1rem', fontSize: '1rem', opacity: 0.8 }}>{text}</div>}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
