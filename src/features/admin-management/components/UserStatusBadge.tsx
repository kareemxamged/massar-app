interface Props { 
  status: string; 
}

export default function UserStatusBadge({ status }: Props) {
  const isActive = status === 'active';
  return (
    <span 
      className="badge"
      style={{
        background: isActive ? 'rgba(52,211,153,0.2)' : 'rgba(251,113,133,0.2)',
        color: isActive ? '#34d399' : '#fb7185',
        border: `1px solid ${isActive ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
    >
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );
}
