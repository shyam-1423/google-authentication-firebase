import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { clearUser } from '../redux/userSlice';
import {
    User,
    Mail,
    Phone,
    LogOut,
    Shield,
    Calendar,
    Edit3
} from 'lucide-react';

const UserCard = () => {
    const { user, authMethod } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (user?.photoURL) {
            setImageError(false);
            setImageLoaded(false);
            setImageLoading(true);

            const img = new Image();
            img.onload = () => {
                setImageLoaded(true);
                setImageLoading(false);
                setImageError(false);
            };
            img.onerror = () => {
                setImageError(true);
                setImageLoading(false);
                setImageLoaded(false);
            };
            img.src = user.photoURL;
        } else {
            setImageLoading(false);
            setImageError(true);
        }
    }, [user?.photoURL]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await signOut(auth);
            dispatch(clearUser());
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAuthMethodInfo = () => {
        switch (authMethod) {
            case 'google':
                return { icon: '🔗', label: 'Google Account', color: '#4285F4' };
            case 'email':
                return { icon: '📧', label: 'Email Account', color: '#34A853' };
            case 'phone':
                return { icon: '📱', label: 'Phone Number', color: '#FF9800' };
            case 'facebook':
                return { icon: '👥', label: 'Facebook Account', color: '#1877F2' };
            default:
                return { icon: '🔐', label: 'Secure Account', color: '#6C757D' };
        }
    };

    if (!user) return null;

    const authInfo = getAuthMethodInfo();
    const joinDate = user.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString()
        : 'Recently';

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center py-4">
                            <div className="position-relative d-inline-block">
                                {imageLoading ? (
                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                        style={{ width: '100px', height: '100px' }}>
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : imageError || !user.photoURL ? (
                                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center position-relative"
                                        style={{ width: '100px', height: '100px' }}>
                                        <User size={32} className="text-muted" />
                                        <span className="position-absolute top-50 start-50 translate-middle fw-bold text-dark">
                                            {getInitials(user.displayName)}
                                        </span>
                                    </div>
                                ) : (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || 'Profile'}
                                        className="rounded-circle"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        onError={() => setImageError(true)}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                )}
                                <span
                                    className="position-absolute bottom-0 end-0 badge rounded-pill"
                                    style={{ backgroundColor: authInfo.color }}
                                    title={authInfo.label}
                                >
                                    {authInfo.icon}
                                </span>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <h4 className="card-title mb-2">
                                    {user.displayName || 'Anonymous User'}
                                </h4>
                                <p className="text-muted d-flex align-items-center justify-content-center">
                                    <Shield size={14} className="me-1" />
                                    {authInfo.label}
                                </p>
                            </div>
                            <div className="row">
                                {user.email && (
                                    <div className="col-12 mb-3">
                                        <div className="d-flex align-items-center">
                                            <Mail size={16} className="text-muted me-2" />
                                            <span className="text-break">{user.email}</span>
                                        </div>
                                    </div>
                                )}
                                {user.phoneNumber && (
                                    <div className="col-12 mb-3">
                                        <div className="d-flex align-items-center">
                                            <Phone size={16} className="text-muted me-2" />
                                            <span>{user.phoneNumber}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="col-12 mb-3">
                                    <div className="d-flex align-items-center">
                                        <Calendar size={16} className="text-muted me-2" />
                                        <span>Joined {joinDate}</span>
                                    </div>
                                </div>
                                {user.emailVerified !== undefined && (
                                    <div className="col-12 mb-3">
                                        <div className="d-flex align-items-center">
                                            <Shield size={16} className="text-muted me-2" />
                                            <span className={user.emailVerified ? 'text-success' : 'text-warning'}>
                                                {user.emailVerified ? '✅ Email Verified' : '⚠️ Email Not Verified'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2 justify-content-center mt-4">
                                <button className="btn btn-outline-primary btn-sm">
                                    <Edit3 size={14} className="me-1" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-danger btn-sm"
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-1" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Signing out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={14} className="me-1" />
                                            Sign Out
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;