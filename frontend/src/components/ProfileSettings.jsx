import React, { useState } from "react";
import "./ProfileSettings.css";

const ProfileSettings = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const profileName = "BUDIDHA NIKHITHA GOUD";
  const profileInitials = "BU";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Password change submitted", form);
    // Add backend logic if needed
  };

  return (
    <div className="profile-settings-container">
      <div className="left-panel">
        <div className="profile-pic-circle">
          <div className="profile-placeholder">{profileInitials}</div>
        </div>
        <p className="username">{profileName}</p>

        <button className="btn-link">🔐 Change Password</button>
      </div>

      <div className="right-panel">
        <h2>Password Settings</h2>
        <p>Change or reset your account password</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Old Password:</label>
            <input
              type="password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              placeholder="Old password"
              required
            />
          </div>
          <div className="input-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password"
              required
            />
          </div>
          <div className="input-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
