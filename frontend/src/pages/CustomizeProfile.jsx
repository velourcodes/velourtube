import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateAvatar, updateCoverImage } from '../api/user.api';
import './CustomizeProfile.css';

const CustomizeProfile = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFinish = async () => {
        if (!avatar && !coverImage) {
            navigate('/');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Upload Avatar if selected
            if (avatar) {
                const avatarData = new FormData();
                avatarData.append('avatar', avatar);
                await updateAvatar(avatarData);
            }

            // Upload Cover Image if selected
            if (coverImage) {
                const coverData = new FormData();
                coverData.append('coverImage', coverImage);
                await updateCoverImage(coverData);
            }

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload images. You can try again or skip.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/');
    };

    return (
        <div className="customize-container">
            <div className="customize-card">
                <div className="customize-header">
                    <h2 className="logo gradient-text" style={{ marginBottom: '1rem', display: 'block' }}>Velour Verse</h2>
                    <h3>Customize Your Space</h3>
                    <p>Make your profile unique with an avatar and cover photo</p>
                </div>

                {error && <div className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                <div className="upload-sections">
                    <div className="upload-group">
                        <label>Profile Avatar</label>
                        <div className="avatar-upload-wrapper">
                            <div className="avatar-preview">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" />
                                ) : (
                                    <span className="avatar-placeholder">👤</span>
                                )}
                            </div>
                            <div className="upload-info">
                                <input
                                    type="file"
                                    id="avatar"
                                    className="file-input-custom"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    className="file-btn"
                                    onClick={() => document.getElementById('avatar').click()}
                                >
                                    Choose Avatar
                                </button>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Recommended: 400x400 JPG or PNG
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="upload-group">
                        <label>Cover Image</label>
                        <div className="cover-upload-wrapper">
                            <div className="cover-preview">
                                {coverImagePreview ? (
                                    <img src={coverImagePreview} alt="Cover Preview" />
                                ) : (
                                    <span className="cover-placeholder">No cover image selected</span>
                                )}
                            </div>
                            <input
                                type="file"
                                id="coverImage"
                                className="file-input-custom"
                                accept="image/*"
                                onChange={handleCoverChange}
                            />
                            <button
                                className="file-btn"
                                onClick={() => document.getElementById('coverImage').click()}
                            >
                                Choose Cover Photo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="customize-actions">
                    <button
                        className="btn-skip"
                        onClick={handleSkip}
                        disabled={isLoading}
                    >
                        Add Later
                    </button>
                    <button
                        className="btn-primary btn-finish"
                        onClick={handleFinish}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Finish Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizeProfile;
