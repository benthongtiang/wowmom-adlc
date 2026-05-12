import React, { useState } from 'react';

/**
 * MetricsScreen for Platform Administrators displaying global funnel analytics,
 * capacity boundaries, and manual authorization gateways for leaders.
 */
export default function MetricsScreen({ initialMetrics, initialPendingLeaders = [], onApproveLeader }) {
  const [pendingLeaders, setPendingLeaders] = useState(initialPendingLeaders);
  const [approvingId, setApprovingId] = useState(null);

  // Fallback structure metrics
  const metrics = initialMetrics || {
    totalMothers: 142,
    totalGroups: 18,
    fullGroups: 4,
    activeApplications: 38,
    conversionRate: '76.4%',
    capacityUtilization: '88.2%',
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      if (onApproveLeader) {
        await onApproveLeader(id);
      }
      setPendingLeaders((prev) => prev.filter((leader) => leader.leader_id !== id));
    } catch (err) {
      alert(err.message || 'Authorization failed');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Admin Oversight & Funnel Metrics</h1>
        <p style={styles.subtitle}>Global telemetry mapping and manual account authorization gateway</p>
      </header>

      {/* Global Funnel Conversion Metrics */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Platform Funnel Conversion Metrics</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Total Registered Mothers</span>
            <span style={styles.metricValue}>{metrics.totalMothers}</span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Active / Full Groups</span>
            <span style={styles.metricValue}>
              {metrics.totalGroups} <span style={styles.subValue}>({metrics.fullGroups} Full)</span>
            </span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>In-Flight Applications</span>
            <span style={styles.metricValue}>{metrics.activeApplications}</span>
          </div>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Intake Conversion Rate</span>
            <span style={styles.metricValueHighlight}>{metrics.conversionRate}</span>
          </div>
          <div style={styles.metricCardWide}>
            <span style={styles.metricLabel}>Global Capacity Utilization Gate</span>
            <div style={styles.barWrap}>
              <div style={{ ...styles.barFill, width: metrics.capacityUtilization }}></div>
            </div>
            <span style={styles.barCaption}>{metrics.capacityUtilization} of available slots occupied</span>
          </div>
        </div>
      </section>

      {/* Manual Leader Authorization Queue Gateway */}
      <section style={styles.section}>
        <div style={styles.queueHeader}>
          <h2 style={styles.sectionTitle}>Leader Authorization Queue Gateway</h2>
          <span style={styles.badgePendingCount}>{pendingLeaders.length} Awaiting Oversight</span>
        </div>

        {pendingLeaders.length === 0 ? (
          <p style={styles.empty}>All registered leader accounts have been successfully reviewed and authorized.</p>
        ) : (
          <div style={styles.list}>
            {pendingLeaders.map((leader) => (
              <div key={leader.leader_id} style={styles.leaderCard}>
                <div style={styles.leaderDetails}>
                  <h3 style={styles.leaderName}>{leader.name}</h3>
                  <span style={styles.leaderEmail}>{leader.email}</span>
                  <p style={styles.bioQuote}>"{leader.bio || 'Applicant intent parameters provided.'}"</p>
                </div>

                <button
                  onClick={() => handleApprove(leader.leader_id)}
                  disabled={approvingId === leader.leader_id}
                  style={styles.btnApprove}
                >
                  {approvingId === leader.leader_id ? 'Authorizing...' : 'Authorize Role Access'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles = {
  container: { padding: '16px', maxWidth: '650px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '14px' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 },
  subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', margin: 0 },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  metricCard: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
  metricCardWide: { gridColumn: 'span 2', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  metricLabel: { fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  metricValue: { fontSize: '20px', fontWeight: '700', color: '#1f2937' },
  metricValueHighlight: { fontSize: '20px', fontWeight: '700', color: '#059669' },
  subValue: { fontSize: '12px', fontWeight: '500', color: '#ef4444' },
  barWrap: { width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2563eb' },
  barCaption: { fontSize: '11px', color: '#6b7280', textAlign: 'right' },
  queueHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  badgePendingCount: { backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  leaderCard: { border: '1px solid #d1d5db', borderRadius: '8px', padding: '14px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  leaderDetails: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  leaderName: { fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 },
  leaderEmail: { fontSize: '12px', color: '#4b5563', fontFamily: 'monospace' },
  bioQuote: { fontSize: '12px', color: '#6b7280', fontStyle: 'italic', margin: '6px 0 0 0' },
  btnApprove: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  empty: { fontSize: '13px', color: '#10b981', fontStyle: 'italic', backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '6px', border: '1px solid #a7f3d0' },
};
