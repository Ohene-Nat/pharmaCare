import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { testService, customerService } from '../services/dataService';
import '../styles/RecordTest.css';

const TEST_TYPES = ['Malaria Test', 'Blood Pressure', 'Temperature', 'Weight', 'Other'];

function RecordTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomer = searchParams.get('customer');

  const [form, setForm] = useState({
    customer_id: preselectedCustomer || '',
    test_type: '',
    custom_test_type: '',
    result: '',
    notes: '',
  });
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerSearch.length >= 2) {
      customerService.getAll({ search: customerSearch }).then(({ data }) => {
        setCustomers(data.customers);
      });
    }
  }, [customerSearch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        customer_id: parseInt(form.customer_id, 10),
        test_type: form.test_type === 'Other' ? form.custom_test_type : form.test_type,
        result: form.result,
        notes: form.notes || null,
      };
      await testService.create(payload);
      setSuccess('Test recorded successfully!');
      setForm({ customer_id: '', test_type: '', custom_test_type: '', result: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Failed to record test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="record-test-page">
        <h1 className="page-title">Record Medical Test</h1>

        <GlassCard className="test-form-card">
          <form onSubmit={handleSubmit} className="test-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-group">
              <label>Customer *</label>
              {preselectedCustomer ? (
                <input type="number" name="customer_id" value={form.customer_id} readOnly />
              ) : (
                <>
                  <input
                    type="text" placeholder="Search customer by name or phone..."
                    value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customers.length > 0 && customerSearch.length >= 2 && (
                    <div className="customer-dropdown">
                      {customers.map((c) => (
                        <div key={c.id} className="dropdown-item"
                          onClick={() => {
                            setForm({ ...form, customer_id: c.id.toString() });
                            setCustomerSearch(`${c.full_name} (${c.phone})`);
                            setCustomers([]);
                          }}>
                          <strong>{c.full_name}</strong> — {c.phone}
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="hidden" name="customer_id" value={form.customer_id} />
                </>
              )}
            </div>

            <div className="form-group">
              <label>Test Type *</label>
              <select name="test_type" value={form.test_type} onChange={handleChange} required>
                <option value="">Select test type</option>
                {TEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {form.test_type === 'Other' && (
              <div className="form-group">
                <label>Custom Test Name *</label>
                <input name="custom_test_type" value={form.custom_test_type}
                  onChange={handleChange} required placeholder="Enter test name" />
              </div>
            )}

            <div className="form-group">
              <label>Result *</label>
              <input name="result" value={form.result} onChange={handleChange}
                required placeholder="e.g., Positive, 120/80 mmHg, 36.5°C" />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea name="notes" rows="3" value={form.notes} onChange={handleChange}
                placeholder="Additional notes..." />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Recording...' : 'Record Test'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default RecordTest;
