import React, { useState } from 'react';

/**
 * RosterScreen displaying active peer group members.
 * Enforces peer contact masking / conditional hydration logic based on participant activation status.
 */
export default function RosterScreen({ initialMembers = [], groupName = 'Support Group Roster' }) {
  const [members] = useState(initialMembers);
  const [maskedView, setMaskedView] = useState(true);

  // Filter members based on persona access rules
  const activeCount = members.filter((m) => m.status === 'Active Participant').length;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <h1 style={styles.title}>{groupName}</h1>
          <span style={styles.badgeCount}>👥 {activeCount} Active</span>
        </div>
        <p style={styles.subtitle}>Peer roster list. Contact details are conditionally masked until active participation.</p>

        <div style={styles.toggleWrap}>
          <label style={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={maskedView}
              onChange={(e) => setMaskedView(e.target.checked)}
            />
            Simulate Peer Contact Masking (Privacy Gate)
          </label>
        </div>
      </header>

      <main style={styles.list}>
        {members.length === 0 ? (
          <p style={styles.empty}>No registered candidates in this group roster.</p>
        ) : (
          members.map((member) => {
            const isActive = member.status === 'Active Participant';
            // Contact masking hydration logic
            const displayEmail = !maskedView || isActive ? member.email : '••••••••@peer.masked';
            const displayPhone = !maskedView || isActive ? member.phone || 'N/A' : '••••••••••';

            return (
              <div key={member.id} style={isActive ? styles.cardActive : styles.cardPending}>
                <div style={styles.memberHeader}>
                  <h3 style={styles.name}>{member.name}</h3>
                  <span style={isActive ? styles.statusActive : styles.statusPending}>
                    {member.status}
                  </span>
                </div>

                <div style={styles.contactDetails}>
                  <span style={styles.contactItem}>📧 {displayEmail}</span>
                  <span style={styles.contactItem}>📞 {displayPhone}</span>
                </div>

                {!isActive && maskedView && (
                  <p style={styles.maskWarning}>
                    🔒 Contact details hidden. Full hydration enabled automatically upon transition to Active Participant.
                  </p>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '14px' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: 0 },
  badgeCount: { backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' },
  subtitle: { fontSize: '13px', color: '#6b7280', margin: '4px 0 12px 0' },
  toggleWrap: { backgroundColor: '#f9fafb', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', border: '1px solid #e5e7eb' },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#374151', fontWeight: '500' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cardActive: { border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px', backgroundColor: '#ecfdf5' },
  cardPending: { border: '1px solid #f3f4f6', borderRadius: '8px', padding: '12px', backgroundColor: '#fff' },
  memberHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  name: { fontSize: '15px', fontWeight: '600', color: '#1f2937', margin: 0 },
  statusActive: { fontSize: '11px', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' },
  statusPending: { fontSize: '11px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' },
  contactDetails: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#4b5563' },
  contactItem: { fontFamily: 'monospace', fontSize: '12px' },
  maskWarning: { fontSize: '11px', color: '#d97706', margin: '8px 0 0 0', fontStyle: 'italic' },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '24px' },
};
