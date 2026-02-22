import { NavLink } from 'react-router-dom';
import { ChartBarIcon, DocumentPlusIcon, TagIcon, ChatBubbleLeftRightIcon, ListBulletIcon } from '@heroicons/react/24/outline'; // Using heroicons
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    useAuth();
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <ChartBarIcon className="w-6 h-6" /> },
        { name: 'Log Meal', path: '/log', icon: <DocumentPlusIcon className="w-6 h-6" /> },
        { name: 'History', path: '/meals', icon: <ListBulletIcon className="w-6 h-6" /> },
        { name: 'Goals', path: '/goals', icon: <TagIcon className="w-6 h-6" /> },
        { name: 'AI Chat', path: '/chat', icon: <ChatBubbleLeftRightIcon className="w-6 h-6" /> },
    ];

    return (
        <aside className="sidebar">
            <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-primary)' }}></div>
                <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>CalorieTracker</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--border-radius-sm)',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            background: isActive ? 'var(--accent-secondary)' : 'transparent',
                            transition: 'all var(--transition-fast)'
                        })}
                    >
                        {item.icon}
                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
