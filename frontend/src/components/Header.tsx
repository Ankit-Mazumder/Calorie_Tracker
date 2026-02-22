import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            background: 'var(--bg-secondary)',
            padding: '0.5rem 1.5rem',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Welcome back,</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name || user.username}</div>
            </div>

            <button
                onClick={logout}
                className="btn btn-secondary"
                style={{
                    border: '1px solid var(--color-fat)',
                    color: 'var(--color-fat)',
                    background: 'transparent',
                    padding: '0.5rem 1rem'
                }}
            >
                Log Out
            </button>
        </header>
    );
};

export default Header;
