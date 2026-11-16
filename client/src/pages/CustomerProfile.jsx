import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { customerService, testService } from '../services/dataService';
import '../styles/CustomerProfile.css';
import Icon from '../components/Icon';

function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, testsRes] = await Promise.all([
          customerService.getById(id),
          testService.getByCustomer(id),
        ]);
        setCustomer(custRes.data);
        setTests(testsRes.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (!customer) return <Layout><div className="loading">Customer not found</div></Layout>;

  return (
    <Layout>
      <div className="profile-page">
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/customers')}>
          ← Back to Customers
        </button>

        <div className="profile-header">
          <GlassCard className="profile-info-card">
            <div className="profile-avatar">{customer.full_name[0]}</div>
            <div className="profile-details">
              <h1>{customer.full_name}</h1>
              <div className="profile-meta">
                <span><Icon name="phone" size={15} /> {customer.phone}</span>
                {customer.age && <span><Icon name="calendar" size={15} /> {customer.age} years</span>}
                {customer.gender && <span>{customer.gender}</span>}
              </div>
              {customer.address && <p className="profile-address"><Icon name="pin" size={15} /> {customer.address}</p>}
              {customer.medical_notes && (
                <div className="medical-notes">
                  <strong>Medical Notes:</strong>
                  <p>{customer.medical_notes}</p>
                </div>
              )}
              <p className="registered-date">
                Registered: {new Date(customer.date_registered).toLocaleDateString()}
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary"
            onClick={() => navigate(`/record-test?customer=${customer.id}`)}>
            <Icon name="flask" size={18} /> Record New Test
          </button>
        </div>

        <GlassCard className="history-section">
          <h2>Health History Timeline</h2>
          <div className="timeline">
            {tests.map((test) => (
              <div key={test.id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content glass-card">
                  <div className="timeline-header">
                    <strong>{test.test_type}</strong>
                    <span className="timeline-date">
                      {new Date(test.date_recorded).toLocaleDateString()} at{' '}
                      {new Date(test.date_recorded).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="timeline-result">Result: <strong>{test.result}</strong></p>
                  {test.notes && <p className="timeline-notes">{test.notes}</p>}
                  <span className="timeline-staff">Staff: {test.staff_name}</span>
                </div>
              </div>
            ))}
            {tests.length === 0 && (
              <p className="empty-state">No test records yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default CustomerProfile;
