import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportsTable from '../components/ReportsTable';
import ReportDetailCard from '../components/ReportDetailCard';
import StatusCircles from '../components/StatusCircles';
import './Authority.css';

const AuthorityDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    seen: 0,
    unseen: 0,
    reviewed: 0,
    pending: 0,
    resolved: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'reviewed', 'resolved'

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'authority') {
      navigate('/login');
      return;
    }

    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/images');
      const data = await response.json();
      
      if (data.success) {
        const processedReports = data.images.map(img => ({
          id: img._id,
          profile: 'https://via.placeholder.com/40',
          username: img.userEmail,
          date: new Date(img.uploadedAt).toLocaleDateString(),
          time: new Date(img.uploadedAt).toLocaleTimeString(),
          status: img.classification === 'Pending' ? 'Unseen' : 'Seen',
          description: img.imageName,
          roadLocation: img.roadLocation || {
            address: 'Unknown',
            city: 'Unknown',
            pincode: 'Unknown'
          },
          image: img.imageUrl,
          predictedImage: img.predictedImageUrl || img.imageUrl,
          predicted: img.classification !== 'Pending',
          classification: img.classification || 'Pending'
        }));

        setReports(processedReports);

        // Calculate statistics
        const seenCount = processedReports.filter(img => img.classification !== 'Pending').length;
        const unseenCount = processedReports.length - seenCount;
        const reviewedCount = processedReports.filter(img => img.classification === 'Reviewed').length;
        const resolvedCount = processedReports.filter(img => img.classification === 'Resolved').length;
        const pendingCount = processedReports.filter(img => img.classification === 'Pending').length;

        setStats({
          seen: seenCount,
          unseen: unseenCount,
          reviewed: reviewedCount,
          pending: pendingCount,
          resolved: resolvedCount,
          total: processedReports.length
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (id) => {
    const report = reports.find(r => r.id === id);
    setSelectedReport(report);
  };

  const handleClose = () => {
    setSelectedReport(null);
  };

  const handlePredict = async (id) => {
    try {
      const report = reports.find(r => r.id === id);
      const response = await fetch('http://localhost:5001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: report.image })
      });

      if (response.ok) {
        const updatedReports = reports.map(report =>
          report.id === id ? { ...report, predicted: true, status: 'Seen' } : report
        );
        setReports(updatedReports);
        // Refresh the reports to get updated data
        fetchReports();
      }
    } catch (error) {
      console.error('Error predicting damage:', error);
      setError('Failed to process prediction. Please try again.');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const getFilteredReports = () => {
    switch (filter) {
      case 'pending':
        return reports.filter(report => report.classification === 'Pending');
      case 'reviewed':
        return reports.filter(report => report.classification === 'Reviewed');
      case 'resolved':
        return reports.filter(report => report.classification === 'Resolved');
      default:
        return reports;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    switch (location.pathname) {
      case '/authority':
        return (
          <>
            <div className="dashboard">
              <h2>Authority Dashboard</h2>
              <div className="stats-overview">
                <StatusCircles stats={{ seen: stats.seen, unseen: stats.unseen }} />
                <StatusCircles stats={{ reviewed: stats.reviewed, pending: stats.pending, resolved: stats.resolved }} />
              </div>
              <div className="total-reports">
                Total Reports: {stats.total}
              </div>
            </div>
            <div className="reports-section">
              <div className="reports-header">
                <h2>Recent Reports</h2>
                <div className="filter-controls">
                  <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => handleFilterChange('all')}
                  >
                    All
                  </button>
                  <button 
                    className={filter === 'pending' ? 'active' : ''} 
                    onClick={() => handleFilterChange('pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={filter === 'reviewed' ? 'active' : ''} 
                    onClick={() => handleFilterChange('reviewed')}
                  >
                    Reviewed
                  </button>
                  <button 
                    className={filter === 'resolved' ? 'active' : ''} 
                    onClick={() => handleFilterChange('resolved')}
                  >
                    Resolved
                  </button>
                </div>
              </div>
              <ReportsTable reports={getFilteredReports().slice(0, 5)} onView={handleView} />
            </div>
          </>
        );
      case '/authority/ReportsPage':
        return (
          <div className="reports-section">
            <div className="reports-header">
              <h2>All Reports</h2>
              <div className="filter-controls">
                <button 
                  className={filter === 'all' ? 'active' : ''} 
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </button>
                <button 
                  className={filter === 'pending' ? 'active' : ''} 
                  onClick={() => handleFilterChange('pending')}
                >
                  Pending
                </button>
                <button 
                  className={filter === 'reviewed' ? 'active' : ''} 
                  onClick={() => handleFilterChange('reviewed')}
                >
                  Reviewed
                </button>
                <button 
                  className={filter === 'resolved' ? 'active' : ''} 
                  onClick={() => handleFilterChange('resolved')}
                >
                  Resolved
                </button>
              </div>
            </div>
            <ReportsTable reports={getFilteredReports()} onView={handleView} />
          </div>
        );
      case '/authority/Status':
        return (
          <div className="stats-overview">
            <h2>Status Overview</h2>
            <div className="status-row">
              <StatusCircles stats={{ seen: stats.seen, unseen: stats.unseen }} />
            </div>
            <div className="status-row">
              <StatusCircles stats={{ reviewed: stats.reviewed, pending: stats.pending, resolved: stats.resolved }} />
            </div>
            <div className="stats-details">
              <div className="stat-item">
                <h3>Total Reports</h3>
                <p>{stats.total}</p>
              </div>
              <div className="stat-item">
                <h3>Pending Reports</h3>
                <p>{stats.pending}</p>
              </div>
              <div className="stat-item">
                <h3>Reviewed Reports</h3>
                <p>{stats.reviewed}</p>
              </div>
              <div className="stat-item">
                <h3>Resolved Reports</h3>
                <p>{stats.resolved}</p>
              </div>
            </div>
          </div>
        );
      case '/authority/Settings':
        return (
          <div className="settings-section">
            <h2>Settings</h2>
            <div className="settings-content">
              <div className="settings-group">
                <h3>Account Settings</h3>
                <div className="setting-item">
                  <label>Email Notifications</label>
                  <input type="checkbox" />
                </div>
                <div className="setting-item">
                  <label>Auto-Refresh Reports</label>
                  <input type="checkbox" />
                </div>
              </div>
              <div className="settings-group">
                <h3>Display Settings</h3>
                <div className="setting-item">
                  <label>Reports per page</label>
                  <select>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        navigate('/authority');
        return null;
    }
  };

  return (
    <div className="authority-container">
      <Navbar />
      <main className="main-content">
        {renderContent()}
        {selectedReport && (
          <div className="report-detail-wrapper">
            <ReportDetailCard
              report={selectedReport}
              onClose={handleClose}
              onPredict={() => handlePredict(selectedReport.id)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthorityDashboard; 