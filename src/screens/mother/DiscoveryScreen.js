import React, { useState, useEffect } from 'react';

/**
 * DiscoveryScreen component allowing Mothers to search, filter, and view support groups.
 * Implements real-time visual capacity tags, status gating, and application pipelines.
 */
export default function DiscoveryScreen({ initialGroups = [], onApply }) {
  const [groups, setGroups] = useState(initialGroups);
  const [filterTime, setFilterTime] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDistance, setFilterDistance] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [pipelineLogs, setPipelineLogs] = useState([]);

  useEffect(() => {
    // Simulated dynamic fetch/update based on filters
    let result = [...initialGroups];

    if (filterTime !== 'All') {
      result = result.filter((g) => g.meeting_time === filterTime);
    }

    if (filterStatus === 'Available') {
      result = result.filter((g) => g.group_status !== 'Full' && g.current_member_count < g.max_capacity);
    }

    if (filterDistance !== 'All') {
      const maxDist = parseFloat(filterDistance);
      result = result.filter((g) => g.distance !== null && g.distance !== undefined && g.distance <= maxDist);
    }

    if (searchQuery) {
      result = result.filter((g) => g.group_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    setGroups(result);
  }, [initialGroups, filterTime, filterStatus, filterDistance, searchQuery]);

  const handleApplyClick = async (group) => {
    if (group.group_status === 'Full' || group.current_member_count >= group.max_capacity) {
      return; // Disabled interaction
    }

    setApplyingId(group.group_id);
    try {
      if (onApply) {
        await onApply(group.group_id);
      }
      // Add progression step to local log
      setPipelineLogs((prev) => [
        {
          id: Date.now(),
          groupName: group.group_name,
          step: 'Submitted',
          status: 'Pending Review',
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (err) {
      alert(err.message || 'Application could not be submitted');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Find Your Support Group</h1>
        <p style={styles.subtitle}>Filter and discover WoW Mom communities matching your schedule</p>
      </header>

      {/* Discovery Filter Controls */}
      <section style={styles.filterSection}>
        <input
          type="text"
          placeholder="Search group name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.dropdowns}>
          <label style={styles.label}>
            Time:
            <select value={filterTime} onChange={(e) => setFilterTime(e.target.value)} style={styles.select}>
              <option value="All">Any Time</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </label>

          <label style={styles.label}>
            Distance:
            <select value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} style={styles.select}>
              <option value="All">Any Distance</option>
              <option value="2">Within 2 miles</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
            </select>
          </label>

          <label style={styles.label}>
            Availability:
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.select}>
              <option value="All">Show All</option>
              <option value="Available">Open Spots Only</option>
            </select>
          </label>
        </div>
      </section>

      {/* Target Capacity Cards Grid */}
      <main style={styles.grid}>
        {groups.length === 0 ? (
          <div style={styles.empty}>No groups match your preferred meeting ranges.</div>
        ) : (
          groups.map((group) => {
            const isFull = group.group_status === 'Full' || group.current_member_count >= group.max_capacity;

            return (
              <div key={group.group_id} style={{ ...styles.card, opacity: isFull ? 0.75 : 1 }}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.groupName}>{group.group_name}</h3>
                  <span style={isFull ? styles.tagFull : styles.tagActive}>
                    {isFull ? 'Full' : 'Available'}
                  </span>
                </div>

                <p style={styles.desc}>{group.description}</p>

                <div style={styles.metaGrid}>
                  <span style={styles.metaItem}>🕒 {group.meeting_time}</span>
                  <span style={styles.metaItem}>🔄 {group.meeting_frequency}</span>
                  <span style={styles.metaItem}>📍 {group.distance !== null && group.distance !== undefined ? `${group.distance.toFixed(1)} miles away` : (group.address || 'Remote / Disclosed on join')}</span>
                  <span style={styles.metaItem}>
                    👥 {group.current_member_count} / {group.max_capacity} spots
                  </span>
                </div>

                <button
                  onClick={() => handleApplyClick(group)}
                  disabled={isFull || applyingId === group.group_id}
                  style={isFull ? styles.btnDisabled : styles.btnApply}
                >
                  {applyingId === group.group_id ? 'Applying...' : isFull ? 'Capacity Reached' : 'Apply to Join'}
                </button>
              </div>
            );
          })
        )}
      </main>

      {/* Application Progression Pipeline Logs */}
      {pipelineLogs.length > 0 && (
        <footer style={styles.pipelineFooter}>
          <h4 style={styles.pipelineTitle}>My Application Activity</h4>
          <ul style={styles.logList}>
            {pipelineLogs.map((log) => (
              <li key={log.id} style={styles.logItem}>
                <strong>{log.groupName}</strong> — <span style={styles.stepBadge}>{log.step}</span> ({log.status}) at {log.timestamp}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '16px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '8px',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  dropdowns: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  select: {
    padding: '6px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    fontSize: '13px',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  tagActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  tagFull: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  desc: {
    fontSize: '14px',
    color: '#4b5563',
    margin: 0,
    lineHeight: '1.4',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: '8px',
    borderRadius: '6px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  btnApply: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '4px',
  },
  btnDisabled: {
    backgroundColor: '#9ca3af',
    color: '#f3f4f6',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: '600',
    cursor: 'not-allowed',
    textAlign: 'center',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    padding: '32px',
    color: '#9ca3af',
    fontSize: '14px',
  },
  pipelineFooter: {
    marginTop: '32px',
    borderTop: '2px solid #e5e7eb',
    paddingTop: '16px',
  },
  pipelineTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#374151',
    margin: '0 0 12px 0',
  },
  logList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logItem: {
    fontSize: '13px',
    backgroundColor: '#eff6ff',
    borderLeft: '4px solid #3b82f6',
    padding: '8px 12px',
    borderRadius: '0 4px 4px 0',
    color: '#1e3a8a',
  },
  stepBadge: {
    fontWeight: '600',
    textDecoration: 'underline',
  },
};
