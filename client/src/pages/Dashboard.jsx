import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StatWidget from '../components/StatWidget';
import { reportService } from '../services/dataService';
import '../styles/Dashboard.css';

const COLORS = ['#0d9488', '#4f7cac', '#d39b45', '#c87965', '#648d78', '#8d7aae'];

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const chartGrid = theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const chartTick = theme === 'light' ? '#666' : '#ccc';
  const tooltipBg = theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(30,30,60,0.9)';
  const tooltipColor = theme === 'light' ? '#333' : '#fff';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await reportService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Layout><div className="loading">Loading dashboard...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-heading"><div><span className="eyebrow">OVERVIEW</span><h1 className="page-title">Dashboard</h1><p className="page-subtitle">A clear view of your pharmacy’s activity.</p></div><span className="secure-indicator"><span /> Secure workspace</span></div>

        <div className="stats-grid">
          <StatWidget icon="users" label="Total Customers" value={summary?.totalCustomers || 0} color="#0d9488" />
          <StatWidget icon="flask" label="Tests Today" value={summary?.testsToday || 0} color="#4f7cac" />
          <StatWidget icon="chart" label="Most Common Test" value={summary?.mostCommonTest?.test_type || 'N/A'} color="#d39b45" />
          <StatWidget icon="history" label="Recent Activity" value={summary?.recentTests?.length || 0} color="#c87965" />
        </div>

        <div className="charts-grid">
          <GlassCard className="chart-card">
            <h3>Tests Per Day (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary?.testsPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="date" tick={{ fill: chartTick, fontSize: 12 }}
                  tickFormatter={(d) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fill: chartTick }} />
                <Tooltip contentStyle={{ background: tooltipBg, border: 'none', borderRadius: 8, color: tooltipColor }}
                  labelStyle={{ color: tooltipColor }} />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="chart-card">
            <h3>Common Tests</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={summary?.commonTests || []} dataKey="count" nameKey="test_type"
                  cx="50%" cy="50%" outerRadius={100} label={({ test_type, count }) => `${test_type} (${count})`}>
                  {(summary?.commonTests || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <GlassCard className="recent-activity">
          <h3>Recent Patient Activity</h3>
          <div className="activity-list">
            {(summary?.recentTests || []).map((test) => (
              <div key={test.id} className="activity-item">
                <div className="activity-icon"><span className="activity-dot" /></div>
                <div className="activity-info">
                  <span className="activity-name">{test.customer_name}</span>
                  <span className="activity-detail">{test.test_type} — {test.result}</span>
                </div>
                <span className="activity-time">
                  {new Date(test.date_recorded).toLocaleDateString()}
                </span>
              </div>
            ))}
            {(!summary?.recentTests || summary.recentTests.length === 0) && (
              <p className="empty-state">No recent activity</p>
            )}
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}

export default Dashboard;
