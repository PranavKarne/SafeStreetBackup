import React, { useState } from 'react';
import './ReportDetailCard.css';

const ReportDetailCard = ({ report, onClose, onPredict }) => {
  const [hasPredicted, setHasPredicted] = useState(false);
  const [severity, setSeverity] = useState('low');
  const [workStatus, setWorkStatus] = useState('pending');

  const handlePredict = () => {
    if (!hasPredicted) {
      onPredict(report.id); // Callback to parent
      setHasPredicted(true);
    }
  };

  return (
    <div className="report-detail-wrapper">
      <div className="report-card">
        {/* Close (X) Button */}
        <button className="close-button" onClick={onClose}>✕</button>

        {/* User Info */}
        <div className="user-info">
          <img src={report.profile} alt="avatar" className="user-avatar" />
          <span className="username">{report.username}</span>
        </div>

        {/* Report Image */}
        <div className="report-image">
          <img src={report.image} alt="report" />
        </div>

        {/* Meta Info */}
        <div className="report-meta">
          <span>{report.date}</span>
          <span>{report.time}</span>
        </div>

        {/* Description & Location */}
        <div className="report-description">{report.description}</div>
        <div className="report-location"><strong>Location:</strong> {report.address}</div>

        {/* Predict Button */}
        {!hasPredicted && (
          <button className="predict-button" onClick={handlePredict}>
            Predict
          </button>
        )}

        {/* Prediction Info */}
        {hasPredicted && (
          <div className="prediction-details">
            <div><strong>Damage Type:</strong> {report.damageType || 'Pothole'}</div>

            <div className="dropdown-group">
              <label><strong>Severity:</strong></label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="dropdown-group">
              <label><strong>Work Status:</strong></label>
              <select value={workStatus} onChange={(e) => setWorkStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCard;
