import { Link } from 'react-router-dom';

export default function Unauthorized() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            color: 'white'
        }}>
            <h1>Access Denied</h1>
            <p>You do not have permission to view this page.</p>
            <Link to="/" style={{ color: '#646cff', marginTop: '1rem' }}>Go Home</Link>
        </div>
    );
}
