import React, { useState } from 'react';

/**
 * DashboardScreen for Group Leaders displaying pending applications,
 * scheduling action prompts, and real-time intake state dispatches.
 */
export default function DashboardScreen({ initialApplications = [], onScheduleInterview, onAccept, onReject }) {
  const [applications, setApplications] = useState(initialApplications);
  const [processingId, setProcessingId] = useState(null);

  const handleAction = async (id, actionType, payload) => {
    setProcessingId(id);
    try {
      if (actionType === 'schedule' && onScheduleInterview) {
        await onScheduleInterview(id, payload);
        // Optimistic update
        setApplications((prev) =>
          prev.map((app) => (app.application_id === id ? { ...app, status: 'Interview Scheduled' } : app))
        );
      } else if (actionType === 'accept' && onAccept) {
        await onAccept(id);
        setApplications((prev) =>
          prev.map((app) => (app.application_id === id ? { ...app, status: 'Accepted' } : app))
        );
      } else if (actionType === 'reject' && onReject) {
        await onReject(id, payload);
        setApplications((prev) =>
          prev.map((app) => (app.application_id === id ? { ...app, status: 'Rejected' } : app))
        );
      }
    } catch (err) {
      alert(err.message || `Action failed`);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingApps = applications.filter((app) => app.status === 'Pending');
  const scheduledApps = applications.filter((app) => app.status === 'Interview Scheduled');

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Leader Intake Dashboard</h1>
        <p style={styles.subtitle}>Review new candidates and manage pending group interview pipelines</p>
      </header>

      {/* Pending Applications Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Applications ({pendingApps.length})</h2>
        {pendingApps.length === 0 ? (
          <p style={styles.empty}>No pending intake applications to review.</p>
        ) : (
          <div style={styles.list}>
            {pendingApps.map((app) => (
              <div key={app.application_id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3 style={styles.name}>
                    {app.mother?.full_name || 'Candidate'}
                  </h3>
                  <span style={styles.badgePending}>Pending Review</span>
                </div>

                <div style={styles.details}>
                  <span>📅 Applied: {new Date(app.application_date).toLocaleDateString()}</span>
                  <span>👶 Children Ages: {app.mother?.children_ages?.join(', ') || 'N/A'}</span>
                </div>

                <div style={styles.actions}>
                  <button
                    onClick={() => handleAction(app.application_id, 'schedule', ['Tomorrow Morning', 'Next Tuesday Afternoon'])}
                    disabled={processingId === app.application_id}
                    style={styles.btnSchedule}
                  >
                    Propose Interviews
                  </button>
                  <button
                    onClick={() => handleAction(app.application_id, 'accept')}
                    disabled={processingId === app.application_id}
                    style={styles.btnAccept}
                  >
                    Direct Accept
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason feedback for mother:');
                      if (reason !== null) handleAction(app.application_id, 'reject', reason);
                    }}
                    disabled={processingId === app.application_id}
                    style={styles.btnReject}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Awaiting Interview Confirmation Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Awaiting Interview Confirmation ({scheduledApps.length})</h2>
        {scheduledApps.length === 0 ? (
          <p style={styles.empty}>No ongoing interviews expecting mother confirmation.</p>
        ) : (
          <div style={styles.list}>
            {scheduledApps.map((app) => (
              <div key={app.application_id} style={styles.cardScheduled}>
                <div style={styles.cardTop}>
                  <h3 style={styles.name}>
                    {app.mother?.full_name || 'Candidate'}
                  </h3>
                  <span style={styles.badgeScheduled}>Interview Proposed</span>
                </div>
                <p style={styles.note}>
                  {app.interview_confirmed_by_mother
                    ? `✓ Confirmed Block: ${app.interview_time_slot}`
                    : '⏳ Email link dispatched. Awaiting candidate selection.'}
                </p>
                {app.interview_confirmed_by_mother && (
                  <button
                    onClick={() => handleAction(app.application_id, 'accept')}
                    disabled={processingId === app.application_id}
                    style={styles.btnAcceptFull}
                  >
                    Approve Intake Post-Interview
                  </button>
                )}
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
  header: { marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' },
  title: { fontSize: '22px', fontWeight: 'bold', color: '#111827', margin: 0 },
  subtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  section: { marginBottom: '28px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' },
  empty: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { border: '1px solid #d1d5db', borderRadius: '8px', padding: '14px', backgroundColor: '#fff' },
  cardScheduled: { border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', backgroundColor: '#eff6ff' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  name: { fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: 0 },
  badgePending: { backgroundColor: '#fef3c7', color: '#d97706', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' },
  badgeScheduled: { backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' },
  details: { display: 'flex', gap: '16px', fontSize: '12px', color: '#4b5563', marginBottom: '12px' },
  note: { fontSize: '12px', color: '#3b82f6', margin: '4px 0 10px 0' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  btnSchedule: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
  btnAccept: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
  btnAcceptFull: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', width: '100%', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  btnReject: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' },
};
