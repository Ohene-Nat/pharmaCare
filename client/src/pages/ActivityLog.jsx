import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { notificationService } from '../services/dataService';
import '../styles/Sidebar.css';

function ActivityLog() {
  const [notifications, setNotifications] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser.role !== 'superadmin') {
      navigate('/');
      return;
    }
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationService.getAll();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load activity log:', err);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <Layout>
      <div className="settings-page">
        <h1 className="page-title">Activity Log</h1>
        <GlassCard>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Target User</th>
                  <th>Target Role</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No activity recorded yet</td></tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n.id}>
                      <td>{n.actor_name}</td>
                      <td><span className={`role-badge ${n.actor_role}`}>{n.actor_role}</span></td>
                      <td><span className={`action-badge ${n.action}`}>{n.action}</span></td>
                      <td>{n.target_name}</td>
                      <td><span className={`role-badge ${n.target_role}`}>{n.target_role}</span></td>
                      <td>{new Date(n.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default ActivityLog;
