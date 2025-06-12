import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { setUser, setLoading, setError, clearError } from '../redux/userSlice';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose, isVisible }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className={`alert ${type === 'error' ? 'alert-danger' : 'alert-success'} alert-dismissible d-flex align-items-center`} role="alert">
                <div className="me-2">
                    {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                </div>
                <div className="flex-grow-1">{message}</div>
                <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
        </div>
    );
};

const LoginComponent = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector(state => state.user);
    const navigate = useNavigate();

    const [loginMethod, setLoginMethod] = useState('social');
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'error'
    });

    const showToast = (message, type = 'error') => {
        setToast({
            isVisible: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    useEffect(() => {
        if (error) {
            showToast(error, 'error');
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        dispatch(clearError());
        hideToast();
    };

    const handleGoogleSignIn = async () => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());
            hideToast();

            const result = await signInWithPopup(auth, googleProvider);
            const userData = {
                uid: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified,
                phoneNumber: result.user.phoneNumber,
                metadata: result.user.metadata
            };
            dispatch(setUser({ user: userData, authMethod: 'google' }));
            showToast('Successfully signed in with Google!', 'success');
            navigate('/profile');
        } catch (error) {
            console.error('Google sign in error:', error);
            const errorMessage = getErrorMessage(error);
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        if (isSignUp && formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        try {
            dispatch(setLoading(true));
            dispatch(clearError());
            hideToast();

            let result;
            if (isSignUp) {
                result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            } else {
                result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
            }

            const userData = {
                uid: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                emailVerified: result.user.emailVerified,
                phoneNumber: result.user.phoneNumber,
                metadata: result.user.metadata
            };
            dispatch(setUser({ user: userData, authMethod: 'email' }));
            showToast(isSignUp ? 'Account created successfully!' : 'Successfully signed in!', 'success');
            navigate('/profile');
        } catch (error) {
            console.error('Email auth error:', error);
            const errorMessage = getErrorMessage(error);
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        try {
            dispatch(setLoading(true));
            dispatch(clearError());
            hideToast();

            await sendPasswordResetEmail(auth, formData.email);
            setResetEmailSent(true);
            showToast('Password reset email sent! Check your inbox.', 'success');
        } catch (error) {
            console.error('Password reset error:', error);
            const errorMessage = getErrorMessage(error);
            dispatch(setError(errorMessage));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getErrorMessage = (error) => {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check your credentials.';
            case 'auth/email-already-in-use':
                return 'Email is already registered';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/invalid-email':
                return 'Invalid email address format';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed. Please try again.';
            case 'auth/cancelled-popup-request':
                return 'Sign-in was cancelled. Please try again.';
            default:
                return error.message || 'An error occurred during authentication';
        }
    };

    if (showForgotPassword) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-4">
                            <div className="card shadow">
                                <div className="card-body p-4">
                                    <button
                                        className="btn btn-outline-secondary btn-sm mb-3"
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setResetEmailSent(false);
                                        }}
                                    >
                                        <ArrowLeft size={16} className="me-1" />
                                        Back
                                    </button>
                                    <div className="text-center mb-4">
                                        <div className="mb-3">
                                            <Lock size={48} className="text-primary" />
                                        </div>
                                        <h2 className="h4 mb-2">Reset Password</h2>
                                        <p className="text-muted">
                                            Enter your email address and we'll send you a link to reset your password.
                                        </p>
                                    </div>
                                    {resetEmailSent ? (
                                        <div className="alert alert-success d-flex align-items-center">
                                            <CheckCircle size={16} className="me-2" />
                                            Password reset email sent! Check your inbox.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleForgotPassword}>
                                            <div className="mb-3">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <Mail size={20} />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control"
                                                        placeholder="Enter your email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail size={20} className="me-2" />
                                                        Send Reset Email
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="card shadow">
                            <div className="card-body p-4">
                                <div className="text-center mb-4">
                                    <div className="mb-3">
                                        <span style={{ fontSize: '3rem' }}>🚀</span>
                                    </div>
                                    <h2 className="h3 mb-2">Welcome Back</h2>
                                    <p className="text-muted">
                                        Choose your preferred sign in method to access your personalized dashboard.
                                    </p>
                                </div>
                                {loginMethod === 'social' && (
                                    <div>
                                        <button
                                            onClick={handleGoogleSignIn}
                                            className="btn btn-outline-primary w-100 mb-3"
                                            disabled={loading}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" className="me-2">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Continue with Google
                                        </button>
                                        <div className="text-center my-3">
                                            <span className="text-muted">or</span>
                                        </div>
                                        <button
                                            onClick={() => setLoginMethod('email')}
                                            className="btn btn-outline-secondary w-100"
                                        >
                                            <Mail size={20} className="me-2" />
                                            Email & Password
                                        </button>
                                    </div>
                                )}
                                {loginMethod === 'email' && (
                                    <div>
                                        <button
                                            className="btn btn-outline-secondary btn-sm mb-3"
                                            onClick={() => setLoginMethod('social')}
                                        >
                                            <ArrowLeft size={16} className="me-1" />
                                            Back
                                        </button>
                                        <div className="text-center mb-4">
                                            <h3 className="h5">{isSignUp ? 'Create Account' : 'Sign In'}</h3>
                                            <p className="text-muted">Enter your email and password</p>
                                        </div>
                                        <form onSubmit={handleEmailAuth}>
                                            <div className="mb-3">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <Mail size={20} />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control"
                                                        placeholder="Enter your email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="input-group">
                                                    <span className="input-group-text">
                                                        <Lock size={20} />
                                                    </span>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        className="form-control"
                                                        placeholder="Enter your password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>
                                            {isSignUp && (
                                                <div className="mb-3">
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            <Lock size={20} />
                                                        </span>
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            name="confirmPassword"
                                                            className="form-control"
                                                            placeholder="Confirm your password"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="submit"
                                                className="btn btn-primary w-100 mb-3"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Please wait...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail size={20} className="me-2" />
                                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                        <div className="text-center">
                                            <p className="mb-2">
                                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 ms-1"
                                                    onClick={() => setIsSignUp(!isSignUp)}
                                                >
                                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                                </button>
                                            </p>
                                            {!isSignUp && (
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0"
                                                    onClick={() => setShowForgotPassword(true)}
                                                >
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {loading && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginComponent;