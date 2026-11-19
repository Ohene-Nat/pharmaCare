import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { reportService } from '../services/dataService';
import '../styles/Reports.css';
import Icon from '../components/Icon';

function Reports() {
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchDaily = async () => {
    setLoading(true);
    try {
      const { data } = await reportService.getDaily(date);
      setDailyReport(data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekly = async () => {
    try {
      const { data } = await reportService.getWeekly();
      setWeeklyData(data);
    } catch (err) {
      console.error('Failed to load weekly data:', err);
    }
  };

  useEffect(() => { fetchDaily(); fetchWeekly(); }, []);

  const exportCSV = () => {
    if (!dailyReport?.tests?.length) return;
    const headers = ['ID', 'Customer', 'Test Type', 'Result', 'Staff', 'Date'];
    const rows = dailyReport.tests.map((t) => [
      t.id, t.customer_name, t.test_type, t.result, t.staff_name,
      new Date(t.date_recorded).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="reports-page">
        <h1 className="page-title">Reports</h1>

        <GlassCard className="report-controls">
          <div className="date-picker">
            <label>Select Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="btn btn-primary" onClick={fetchDaily}>Load Report</button>
          </div>
          <button className="btn btn-secondary" onClick={exportCSV}
            disabled={!dailyReport?.tests?.length}>
            <Icon name="download" size={17} /> Export CSV
          </button>
        </GlassCard>

        <GlassCard className="daily-report">
          <h2>Daily Report — {date}</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              <p className="report-summary">
                <strong>{dailyReport?.count || 0}</strong> tests recorded on this date
              </p>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Test Type</th>
                      <th>Result</th>
                      <th>Staff</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dailyReport?.tests || []).map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.customer_name}</td>
                        <td>{t.test_type}</td>
                        <td>{t.result}</td>
                        <td>{t.staff_name}</td>
                        <td>{new Date(t.date_recorded).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                    {(!dailyReport?.tests || dailyReport.tests.length === 0) && (
                      <tr><td colSpan="6" className="empty-state">No tests recorded on this date</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard className="weekly-report">
          <h2>Weekly Statistics (Last 7 Days)</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((row, i) => (
                  <tr key={i}>
                    <td>{new Date(row.date).toLocaleDateString()}</td>
                    <td>{row.test_type}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
                {weeklyData.length === 0 && (
                  <tr><td colSpan="3" className="empty-state">No data for the past week</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default Reports;
