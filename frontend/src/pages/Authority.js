import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportsTable from '../components/ReportsTable';
import ReportDetailCard from '../components/ReportDetailCard';
import StatusCircles from '../components/StatusCircles';
import './Authority.css';

const Authority = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    seen: 0,
    unseen: 0,
    reviewed: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    console.log('[Authority useEffect] Running check. Path:', location.pathname, 'Stored userType:', userType);

    if (userType !== 'authority') {
      console.log('[Authority useEffect] Auth check FAILED. Redirecting to /login...');
      navigate('/login');
      return;
    }
    console.log('[Authority useEffect] Auth check PASSED.');

    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/images');
        const data = await response.json();
        if (data.success) {
          setReports(data.images.map(img => ({
            id: img._id,
            profile: 'https://via.placeholder.com/40',
            username: img.userEmail,
            date: new Date(img.uploadedAt).toLocaleDateString(),
            time: new Date(img.uploadedAt).toLocaleTimeString(),
            status: img.classification === 'Pending' ? 'Unseen' : 'Seen',
            description: img.imageName,
            location: 'Location data not available',
            image: img.imageUrl,
            predictedImage: img.predictedImageUrl || img.imageUrl,
            predicted: img.classification !== 'Pending'
          })));

          const seenCount = data.images.filter(img => img.classification !== 'Pending').length;
          const unseenCount = data.images.length - seenCount;
          const reviewedCount = data.images.filter(img => img.classification === 'Reviewed').length;
          const resolvedCount = data.images.filter(img => img.classification === 'Resolved').length;
          const pendingCount = data.images.filter(img => img.classification === 'Pending').length;

          setStats({
            seen: seenCount,
            unseen: unseenCount,
            reviewed: reviewedCount,
            pending: pendingCount,
            resolved: resolvedCount
          });
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [navigate, location.pathname]);

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
      const response = await fetch('http://localhost:5000/api/vit-classify', {
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
      }
    } catch (error) {
      console.error('Error predicting damage:', error);
    }
  };

  const renderContent = () => {
    console.log('[Authority renderContent] Rendering for path:', location.pathname);
    switch (location.pathname) {
      case '/authority':
        return (
          <>
            <div className="dashboard">
              <h2>Welcome to Authority Dashboard</h2>
              <div className="stats-overview">
                 <StatusCircles stats={{ seen: stats.seen, unseen: stats.unseen }} />
                 <StatusCircles stats={{ reviewed: stats.reviewed, pending: stats.pending, resolved: stats.resolved }} />
              </div>
            </div>
            <div className="reports-section">
               <h2>Recent Reports</h2>
               <ReportsTable reports={reports.slice(0, 5)} onView={handleView} />
            </div>
          </>
        );
      case '/authority/ReportsPage':
        return (
          <div className="reports-section">
            <h2>All Reports</h2>
            <ReportsTable reports={reports} onView={handleView} />
          </div>
        );
      case '/authority/Status':
         return (
           <div className="stats-overview">
             <div className="status-row">
               <StatusCircles stats={{ seen: stats.seen, unseen: stats.unseen }} />
             </div>
             <div className="status-row">
               <StatusCircles stats={{ reviewed: stats.reviewed, pending: stats.pending, resolved: stats.resolved }} />
             </div>
           </div>
         );
      case '/authority/Settings':
         return (
           <div className="settings-section">
             <h2>Settings</h2>
           </div>
         );
      default:
        console.log(`Unknown authority path: ${location.pathname}, redirecting to /authority`);
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

export default Authority;
