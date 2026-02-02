import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserDetails, updatePassword, updateAvatar, updateCoverImage } from '../api/user.api';
import { useFeedback } from '../context/FeedbackContext';
import './Settings.css';

const Settings = () => {
    const { user, checkAuth } = useAuth();
    const { showToast } = useFeedback();
    const [activeSection, setActiveSection] = useState(null);

    // Update Details State
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        fullName: user?.fullName || ''
    });

    // Update Password State
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Media Upload State
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [dragActive, setDragActive] = useState({ avatar: false, cover: false });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            processFile(file, type);
        }
    };

    const processFile = (file, type) => {
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === 'avatar') {
                setAvatarPreview(reader.result);
                setAvatarFile(file);
            } else {
                setCoverPreview(reader.result);
                setCoverFile(file);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e, type, active) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: active }));
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(prev => ({ ...prev, [type]: false }));

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0], type);
        }
    };

    const handleUpdateDetails = async (e) => {
        e.preventDefault();

        // Validation: Ensure no fields are empty
        if (!formData.username?.trim() || !formData.email?.trim() || !formData.fullName?.trim()) {
            showToast('All fields are mandatory.', 'error');
            return;
        }

        // Validation: At least one field should be changed from original
        const isChanged =
            formData.username !== user.username ||
            formData.email !== user.email ||
            formData.fullName !== user.fullName;

        if (!isChanged) {
            showToast('No changes detected.', 'info');
            return;
        }

        try {
            setLoading(true);

            const response = await updateUserDetails(formData);

            if (response.data?.success) {
                showToast('Account details updated successfully!', 'success');
                await checkAuth(); // Refresh user context
            }
        } catch (error) {
            console.error("Update details error:", error);
            const errorMsg = error.response?.data?.message || "Failed to update account details.";
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        // Validation: Both fields are mandatory
        if (!passwordData.oldPassword || !passwordData.newPassword) {
            showToast('Both old and new passwords are required.', 'error');
            return;
        }

        // Optional UI side validation for matching passwords (not strictly asked but good practice)
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        try {
            setLoading(true);

            const response = await updatePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            if (response.status === 200 || response.status === 204) {
                showToast('Password updated successfully!', 'success');
                setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            }
        } catch (error) {
            console.error("Update password error:", error);
            const errorMsg = error.response?.data?.message || "Failed to update password. Please check your old password.";
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMediaUpload = async (type) => {
        const file = type === 'avatar' ? avatarFile : coverFile;
        if (!file) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append(type, file);

            const uploadFn = type === 'avatar' ? updateAvatar : updateCoverImage;
            const response = await uploadFn(formData);

            if (response.data?.success) {
                showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully!`, 'success');
                if (type === 'avatar') {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                } else {
                    setCoverFile(null);
                    setCoverPreview(null);
                }
                await checkAuth(); // Refresh user context
            }
        } catch (error) {
            console.error(`${type} upload error:`, error);
            const errorMsg = error.response?.data?.message || `Failed to update ${type}.`;
            showToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setActiveSection(activeSection === section ? null : section);
        // Clear previews when closing
        if (activeSection === 'avatar') { setAvatarFile(null); setAvatarPreview(null); }
        if (activeSection === 'cover') { setCoverFile(null); setCoverPreview(null); }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Account Settings</h1>
                <p>Manage your profile and security</p>
            </div>

            <div className="settings-grid">
                <section className={`settings-section ${activeSection === 'details' ? 'active' : ''}`}>
                    <div className="section-summary" onClick={() => toggleSection('details')}>
                        <div className="section-title-group">
                            <h2>Profile Information</h2>
                            <p>Update your handle, email and name</p>
                        </div>
                        <span className="expand-icon">{activeSection === 'details' ? '−' : '+'}</span>
                    </div>

                    {activeSection === 'details' && (
                        <form onSubmit={handleUpdateDetails} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="your_handle"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Your Full Name"
                                />
                            </div>
                            <button
                                type="submit"
                                className="settings-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                </section>

                <section className={`settings-section ${activeSection === 'avatar' ? 'active' : ''}`}>
                    <div className="section-summary" onClick={() => toggleSection('avatar')}>
                        <div className="section-title-group">
                            <h2>Profile Picture</h2>
                            <p>Update your channel avatar</p>
                        </div>
                        <span className="expand-icon">{activeSection === 'avatar' ? '−' : '+'}</span>
                    </div>

                    {activeSection === 'avatar' && (
                        <div className="settings-form">
                            <div
                                className={`upload-zone ${dragActive.avatar ? 'drag-active' : ''} avatar-zone`}
                                onDragEnter={(e) => handleDrag(e, 'avatar', true)}
                                onDragLeave={(e) => handleDrag(e, 'avatar', false)}
                                onDragOver={(e) => handleDrag(e, 'avatar', true)}
                                onDrop={(e) => handleDrop(e, 'avatar')}
                            >
                                <input
                                    type="file"
                                    id="avatar-input"
                                    className="hidden-input"
                                    onChange={(e) => handleFileChange(e, 'avatar')}
                                    accept="image/*"
                                />
                                <label htmlFor="avatar-input" className="upload-label">
                                    {avatarPreview ? (
                                        <div className="preview-container avatar-preview">
                                            <img src={avatarPreview} alt="Preview" />
                                            <div className="preview-overlay">Change Image</div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">📸</span>
                                            <p>Drag & Drop or click to upload Avatar</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {avatarFile && (
                                <button
                                    className="settings-submit-btn"
                                    onClick={() => handleMediaUpload('avatar')}
                                    disabled={loading}
                                >
                                    {loading ? 'Uploading...' : 'Update Avatar'}
                                </button>
                            )}
                        </div>
                    )}
                </section>

                <section className={`settings-section ${activeSection === 'cover' ? 'active' : ''}`}>
                    <div className="section-summary" onClick={() => toggleSection('cover')}>
                        <div className="section-title-group">
                            <h2>Cover Image</h2>
                            <p>Update your channel banner</p>
                        </div>
                        <span className="expand-icon">{activeSection === 'cover' ? '−' : '+'}</span>
                    </div>

                    {activeSection === 'cover' && (
                        <div className="settings-form">
                            <div
                                className={`upload-zone ${dragActive.cover ? 'drag-active' : ''} cover-zone`}
                                onDragEnter={(e) => handleDrag(e, 'cover', true)}
                                onDragLeave={(e) => handleDrag(e, 'cover', false)}
                                onDragOver={(e) => handleDrag(e, 'cover', true)}
                                onDrop={(e) => handleDrop(e, 'cover')}
                            >
                                <input
                                    type="file"
                                    id="cover-input"
                                    className="hidden-input"
                                    onChange={(e) => handleFileChange(e, 'cover')}
                                    accept="image/*"
                                />
                                <label htmlFor="cover-input" className="upload-label">
                                    {coverPreview ? (
                                        <div className="preview-container cover-preview">
                                            <img src={coverPreview} alt="Preview" />
                                            <div className="preview-overlay">Change Banner</div>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">🖼️</span>
                                            <p>Drag & Drop or click to upload Cover Image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {coverFile && (
                                <button
                                    className="settings-submit-btn"
                                    onClick={() => handleMediaUpload('cover')}
                                    disabled={loading}
                                >
                                    {loading ? 'Uploading...' : 'Update Cover Image'}
                                </button>
                            )}
                        </div>
                    )}
                </section>

                <section className={`settings-section ${activeSection === 'password' ? 'active' : ''}`}>
                    <div className="section-summary" onClick={() => toggleSection('password')}>
                        <div className="section-title-group">
                            <h2>Security</h2>
                            <p>Manage your password and authentication</p>
                        </div>
                        <span className="expand-icon">{activeSection === 'password' ? '−' : '+'}</span>
                    </div>

                    {activeSection === 'password' && (
                        <form onSubmit={handleUpdatePassword} className="settings-form">
                            <div className="form-group">
                                <label htmlFor="oldPassword">Current Password</label>
                                <input
                                    type="password"
                                    id="oldPassword"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="settings-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                </section>

                <section className="settings-section danger-zone inactive">
                    <div className="section-summary">
                        <div className="section-title-group">
                            <h2>Danger Zone</h2>
                            <p>Delete account and data</p>
                        </div>
                        <span className="status-badge">Locked</span>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
