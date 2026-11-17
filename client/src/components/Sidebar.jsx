import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { notificationService } from '../services/dataService';
import Icon from './Icon';
import '../styles/Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (user.role === 'superadmin') {
      const fetchNotifications = async () => {
        try {
          const { data } = await notificationService.getAll();
          setNotifications(data);
        } catch (err) {
          console.error('Failed to load notifications:', err);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user.role]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isSuperAdmin = user.role === 'superadmin';
  const isAdmin = user.role === 'admin' || isSuperAdmin;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><Icon name="shield" size={22} /></div>
        <div className="brand-copy"><h2>PharmaCare</h2><span>HEALTH RECORDS</span></div>
        {isSuperAdmin && (
          <div className="notification-wrapper" ref={notifRef}>
            <button className="notif-bell" onClick={() => setShowNotifications(!showNotifications)}>
              <Icon name="bell" size={18} />
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notif-panel">
                <div className="notif-header">Activity Log</div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">No activity yet</div>
                ) : (
                  <div className="notif-list">
                    {notifications.map((n) => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-text">
                          <strong>{n.actor_name}</strong>
                          <span className={`role-tag ${n.actor_role}`}>({n.actor_role})</span>
                          {' '}{n.action}{' '}
                          <strong>{n.target_name}</strong>
                          <span className={`role-tag ${n.target_role}`}>({n.target_role})</span>
                        </div>
                        <div className="notif-time">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon className="nav-icon" name="dashboard" /> Dashboard
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon className="nav-icon" name="users" /> Customers
        </NavLink>
        <NavLink to="/record-test" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon className="nav-icon" name="flask" /> Record Test
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Icon className="nav-icon" name="chart" /> Reports
        </NavLink>
        {isAdmin && (
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Icon className="nav-icon" name="settings" /> Settings
          </NavLink>
        )}
        {isSuperAdmin && (
          <NavLink to="/activity-log" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Icon className="nav-icon" name="history" /> Activity Log
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          <div className={`toggle-track ${theme}`}>
            <div className="toggle-thumb"></div>
          </div>
          <span className="toggle-label"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={15} /> {theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
        </button>

        <div className="user-info">
          <div className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user.name || 'User'}</span>
            <span className="user-role">{user.role || 'staff'}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}><Icon name="logout" size={17} /> Sign out</button>
      </div>
    </aside>
  );
}

export default Sidebar;
