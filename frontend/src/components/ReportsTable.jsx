import React from 'react';
import './ReportsTable.css';

const ReportsTable = ({ reports, onView }) => {
  return (
    <div className="table-container">
      <h2>Damage Reports</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Username</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="table-row">
              <td>
                <img
                  src={r.profile}
                  alt="profile"
                  width="40"
                  height="40"
                  className="profile-img"
                />
              </td>
              <td>{r.username}</td>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>
                <span className={`status-badge ${r.status === 'Seen' ? 'status-seen' : 'status-unseen'}`}>
                  {r.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => onView(r.id)}
                  className="view-button"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsTable;
