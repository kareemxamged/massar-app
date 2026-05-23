import React from 'react';

interface CardProps {
    title: string;
    value?: string | number;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Card({ title, value, subtitle, children, className = '' }: CardProps) {
    return (
        <div className={`glass-card ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {title}
            </h3>
            {value && (
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {value}
                </div>
            )}
            {subtitle && (
                <div style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>
                    {subtitle}
                </div>
            )}
            {children}
        </div>
    );
}
