import React, { useState } from 'react';
import './ReportDetailCard.css';

const ReportDetailCard = ({ report, onClose }) => {
  const [hasPredicted, setHasPredicted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [yoloImage, setYoloImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePredict = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(report.image);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'upload.jpg');

      const predictResponse = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await predictResponse.json();

      if (!predictResponse.ok) {
        throw new Error(data.message || 'Prediction failed.');
      }

      if (!data.labels || data.labels.length === 0) {
        setErrorMsg('No damages detected in this image.');
      }

      setPrediction({
        labels: data.labels || [],
        boxes: data.boxes || [],
        severity: data.severity || 'Not specified',
        action: data.action || 'No action available',
        solution: data.solution || 'No solution provided',
      });

      if (data.image) {
        setYoloImage(data.image);
      }

      setHasPredicted(true);
    } catch (error) {
      console.error('Prediction error:', error);
      setErrorMsg(error.message || 'An error occurred during prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-detail-wrapper">
      <div className="report-card">
        <button className="close-button" onClick={onClose}>✕</button>

        <div className="user-info">
          <img src={report.profile} alt="avatar" className="user-avatar" />
          <span className="username">{report.username}</span>
        </div>

        <div className="image-location-wrapper">
          <div className="report-image">
            <img src={report.image} alt="report" />
          </div>

          <div className="report-location">
            <strong>Location:</strong>
            <div>
              {report.roadLocation
                ? `${report.roadLocation.address}, ${report.roadLocation.city} - ${report.roadLocation.pincode}`
                : 'Location details not available'}
            </div>

            {report.latitude && report.longitude && (
              <div className="map-link">
                <a
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Map
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="report-meta">
          <span>{report.date}</span>
          <span>{report.time}</span>
        </div>

        <div className="report-description">
          {report.description || <em>No description provided.</em>}
        </div>

        {!hasPredicted && (
          <button className="predict-button" onClick={handlePredict} disabled={isLoading}>
            {isLoading ? 'Predicting...' : 'Predict'}
          </button>
        )}

        {errorMsg && (
          <div className="prediction-error">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {hasPredicted && prediction && (
          <div className="prediction-details">
            {prediction.labels.length > 0 ? (
              <>
                <div><strong>Damage Type:</strong> {prediction.labels.join(', ')}</div>

                {yoloImage ? (
                  <div className="yolo-image-container">
                    <img src={`data:image/jpeg;base64,${yoloImage}`} alt="YOLO result" />
                  </div>
                ) : (
                  <div><em>No bounding boxes found.</em></div>
                )}

                <div><strong>Severity:</strong> {prediction.severity}</div>
                <div><strong>Recommended Action:</strong> {prediction.action}</div>
                <div><strong>Repair Solution:</strong> {prediction.solution}</div>
              </>
            ) : (
              <div><em>No damages detected in the image.</em></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCard;
