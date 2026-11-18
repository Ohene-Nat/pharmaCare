import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import { userService, authService } from '../services/dataService';
import '../styles/Settings.css';
import Icon from '../components/Icon';

function Settings() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchUsers = async () => {
    try {
      const { data } = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await authService.register(form);
      setSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '', role: 'staff' });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return (
      <Layout>
        <div className="settings-page">
          <h1 className="page-title">Settings</h1>
          <GlassCard><p>Admin access required.</p></GlassCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="page-header">
          <h1 className="page-title">Settings — User Management</h1>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setSuccess(''); }}>
            + Add User
          </button>
        </div>

        {success && <div className="success-message">{success}</div>}

        <GlassCard>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      {u.id !== currentUser.id && u.role !== 'superadmin' && (
                        <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Register New User">
          <form onSubmit={handleRegister} className="modal-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <div className="password-wrapper">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  required minLength={6} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Register User</button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default Settings;
