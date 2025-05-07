import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { name: 'Home', path: '/authority' },
    { name: 'Reports', path: '/authority/ReportsPage' },
    { name: 'Area-wise Uploads', path: '/authority/areawise-uploads' },
    { name: 'Status', path: '/authority/Status' },
    { name: 'Profile', path: '/authority/Settings' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('email');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={styles.logo}>Smart Road</h2>
          <ul style={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  style={{
                    ...styles.link,
                    backgroundColor: location.pathname.startsWith(item.path) ? '#2e2e48' : 'transparent',
                    fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'normal',
                  }}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogoutClick}
                style={{
                  ...styles.link,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  color: '#ff4444',
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div style={styles.logoutDialogOverlay}>
          <div style={styles.logoutDialog}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>Confirm Logout</h3>
            <p style={{ margin: '0 0 24px 0', color: '#555' }}>Are you sure you want to log out?</p>
            <div style={styles.dialogButtons}>
              <button onClick={cancelLogout} style={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={confirmLogout} style={{ ...styles.confirmButton, marginLeft: '10px' }}>
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    height: '100vh',
    position: 'fixed',
    top: '0',
    left: 0,
    backgroundColor: '#1e1e2f',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    justifyContent: 'flex-start',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  logo: {
    fontSize: '24px',
    marginBottom: '30px',
    fontWeight: 'bold',
    color: '#00ffff',
  },
  navLinks: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
    display: 'block',
  },
  logoutDialogOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  logoutDialog: {
    background: 'white',
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    width: 'auto',
    minWidth: '300px',
    maxWidth: '450px',
    textAlign: 'center',
  },
  dialogButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '24px',
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    backgroundColor: '#f0f0f0',
    color: '#333',
    cursor: 'pointer',
    fontWeight: '500',
  },
  confirmButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#d9534f',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default Navbar;
