import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { customerService } from '../services/dataService';
import '../styles/Customers.css';

const PAGE_SIZE = 12;
const EMPTY_FORM = { full_name: '', phone: '', age: '', gender: '', address: '', medical_notes: '' };

function escapeCsv(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'date_registered', direction: 'desc' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setLoadError('');
      try {
        const { data } = await customerService.getAll({
          search: search.trim(), limit: PAGE_SIZE, offset: page * PAGE_SIZE,
        });
        if (!isCurrent) return;
        setCustomers(data.customers || []);
        setTotal(Number(data.total) || 0);
      } catch (err) {
        if (!isCurrent) return;
        setLoadError(err.response?.data?.error || 'Customers could not be loaded. Check your connection and try again.');
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, 250);
    return () => { isCurrent = false; clearTimeout(timer); };
  }, [search, page, reload]);

  const sortedCustomers = useMemo(() => [...customers].sort((a, b) => {
    const left = a[sort.key] ?? '';
    const right = b[sort.key] ?? '';
    const comparison = sort.key === 'date_registered'
      ? new Date(left).getTime() - new Date(right).getTime()
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
    return sort.direction === 'asc' ? comparison : -comparison;
  }), [customers, sort]);

  const openCreate = () => {
    setEditCustomer(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (customer) => {
    setEditCustomer(customer);
    setForm({
      full_name: customer.full_name || '', phone: customer.phone || '', age: customer.age || '',
      gender: customer.gender || '', address: customer.address || '', medical_notes: customer.medical_notes || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        age: form.age ? Number.parseInt(form.age, 10) : null,
      };
      if (editCustomer) await customerService.update(editCustomer.id, payload);
      else await customerService.create(payload);
      setShowModal(false);
      setFeedback(editCustomer ? 'Customer details updated.' : 'Customer registered successfully.');
      setPage(0);
      setReload((value) => value + 1);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Could not save this customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changeSort = (key) => {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'date_registered' ? 'desc' : 'asc' });
  };

  const exportCsv = () => {
    const headers = ['ID', 'Full name', 'Phone', 'Age', 'Gender', 'Address', 'Registered'];
    const rows = sortedCustomers.map((customer) => [
      customer.id, customer.full_name, customer.phone, customer.age, customer.gender,
      customer.address, customer.date_registered ? new Date(customer.date_registered).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmacare-customers-page-${page + 1}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstResult = total ? page * PAGE_SIZE + 1 : 0;
  const lastResult = Math.min((page + 1) * PAGE_SIZE, total);

  return (
    <Layout>
      <div className="customers-page">
        <header className="customers-heading">
          <div>
            <span className="eyebrow">PATIENT DIRECTORY</span>
            <h1 className="page-title">Customers</h1>
            <p className="page-subtitle">Manage patient records and keep care moving.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Icon name="userPlus" size={18} /> New customer
          </button>
        </header>

        <section className="customer-summary" aria-label="Customer directory summary">
          <div className="summary-mark"><Icon name="users" size={21} /></div>
          <div><span className="summary-label">Registered customers</span><strong>{total.toLocaleString()}</strong></div>
          <span className="summary-caption">Patient records in your directory</span>
        </section>

        {feedback && <div className="customer-feedback" role="status"><Icon name="check" size={17} /> {feedback}<button onClick={() => setFeedback('')} aria-label="Dismiss message"><Icon name="close" size={16} /></button></div>}

        <GlassCard className="customer-directory">
          <div className="directory-toolbar">
            <div>
              <h2>All customers</h2>
              <p>{loading ? 'Updating directory…' : `Showing ${firstResult}–${lastResult} of ${total}`}</p>
            </div>
            <div className="directory-actions">
              <form className="customer-search" onSubmit={(event) => { event.preventDefault(); setPage(0); }} role="search">
                <Icon name="search" size={18} />
                <input aria-label="Search customers" type="search" placeholder="Search name, phone or ID" value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(0); setLoading(true); setLoadError(''); }} />
                {search && <button type="button" onClick={() => { setSearch(''); setPage(0); }} aria-label="Clear search"><Icon name="close" size={16} /></button>}
              </form>
              <button className="btn btn-secondary export-button" onClick={exportCsv} disabled={!customers.length || loading}>
                <Icon name="download" size={17} /> Export page
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="customer-state customer-error" role="alert"><strong>Unable to load customers</strong><span>{loadError}</span><button className="btn btn-secondary" onClick={() => setReload((value) => value + 1)}>Try again</button></div>
          ) : loading ? (
            <div className="customer-state" role="status"><span className="loading-spinner" /> Loading customer records…</div>
          ) : customers.length === 0 ? (
            <div className="customer-state customer-empty">
              <div className="empty-icon"><Icon name={search ? 'search' : 'users'} size={23} /></div>
              <strong>{search ? 'No matching customers' : 'Your directory is ready'}</strong>
              <span>{search ? 'Try another name, phone number or customer ID.' : 'Register your first customer to start building their health record.'}</span>
              {search ? <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear search</button> : <button className="btn btn-primary" onClick={openCreate}>Register first customer</button>}
            </div>
          ) : (
            <>
              <div className="table-wrapper customer-table-wrapper">
                <table className="data-table customer-table">
                  <thead><tr>
                    <th><button className="sort-button" onClick={() => changeSort('id')}>ID <Icon name="sort" size={14} /></button></th>
                    <th><button className="sort-button" onClick={() => changeSort('full_name')}>Customer <Icon name="sort" size={14} /></button></th>
                    <th>Phone</th><th>Age</th><th>Gender</th>
                    <th><button className="sort-button" onClick={() => changeSort('date_registered')}>Registered <Icon name="sort" size={14} /></button></th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr></thead>
                  <tbody>{sortedCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="customer-id">#{customer.id}</td>
                      <td><div className="customer-name-cell"><span className="customer-avatar">{customer.full_name?.trim()?.[0]?.toUpperCase() || 'C'}</span><strong>{customer.full_name}</strong></div></td>
                      <td>{customer.phone}</td>
                      <td>{customer.age || '—'}</td>
                      <td>{customer.gender || '—'}</td>
                      <td>{customer.date_registered ? new Date(customer.date_registered).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><div className="customer-row-actions">
                        <button className="icon-button" onClick={() => navigate(`/customers/${customer.id}`)} aria-label={`View ${customer.full_name}`} title="View record"><Icon name="eye" size={17} /></button>
                        <button className="icon-button" onClick={() => openEdit(customer)} aria-label={`Edit ${customer.full_name}`} title="Edit customer"><Icon name="edit" size={17} /></button>
                        <button className="icon-button quick-test-button" onClick={() => navigate(`/record-test?customer=${customer.id}`)} aria-label={`Record a test for ${customer.full_name}`} title="Record test"><Icon name="flask" size={17} /></button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <footer className="customer-pagination">
                <span>Page {page + 1} of {totalPages}</span>
                <div><button className="pagination-button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} aria-label="Previous page"><Icon name="chevronLeft" size={17} /> Previous</button>
                  <button className="pagination-button" onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages} aria-label="Next page">Next <Icon name="chevronRight" size={17} /></button></div>
              </footer>
            </>
          )}
        </GlassCard>

        <Modal isOpen={showModal} onClose={() => !saving && setShowModal(false)} title={editCustomer ? 'Edit customer' : 'Register a customer'}>
          <form onSubmit={handleSubmit} className="modal-form customer-form">
            <p className="form-intro">Add the details needed to identify this patient and maintain their health record.</p>
            {error && <div className="error-message" role="alert">{error}</div>}
            <div className="form-group"><label htmlFor="customer-name">Full name *</label><input id="customer-name" name="full_name" autoComplete="name" value={form.full_name} onChange={handleChange} required maxLength={150} /></div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="customer-phone">Phone *</label><input id="customer-phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} required maxLength={20} /></div>
              <div className="form-group"><label htmlFor="customer-age">Age</label><input id="customer-age" name="age" type="number" min="1" max="199" value={form.age} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label htmlFor="customer-gender">Gender</label><select id="customer-gender" name="gender" value={form.gender} onChange={handleChange}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
            <div className="form-group"><label htmlFor="customer-address">Address</label><input id="customer-address" name="address" autoComplete="street-address" value={form.address} onChange={handleChange} maxLength={500} /></div>
            <div className="form-group"><label htmlFor="customer-notes">Medical notes</label><textarea id="customer-notes" name="medical_notes" rows="3" value={form.medical_notes} onChange={handleChange} maxLength={2000} placeholder="Relevant notes for the care team" /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}><Icon name={saving ? 'loader' : 'check'} size={17} />{saving ? 'Saving…' : editCustomer ? 'Save changes' : 'Register customer'}</button>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default Customers;
