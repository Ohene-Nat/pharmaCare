import '../styles/StatWidget.css';
import Icon from './Icon';

function StatWidget({ icon, label, value, color = '#0d9488' }) {
  return (
    <div className="stat-widget glass-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="stat-icon" style={{ '--stat-color': color }}><Icon name={icon} size={21} /></div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default StatWidget;
