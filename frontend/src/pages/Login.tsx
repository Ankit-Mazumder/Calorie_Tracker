import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login, register, updateUserProfile } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [error, setError] = useState('');
    const [guestData, setGuestData] = useState({ name: 'Guest', age: '30', height: '170', weight: '70' });
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        age: '',
        height: '',
        weight: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.username || formData.username.trim() === '') return "Username is required.";
        if (!formData.password || formData.password.trim() === '') return "Password is required.";

        if (isRegister) {
            if (!formData.name || formData.name.trim() === '') return "Name is required.";

            const age = parseInt(formData.age);
            if (!formData.age || isNaN(age) || age <= 0 || age > 120) return "Please enter a valid age between 1 and 120.";

            const height = parseFloat(formData.height);
            if (!formData.height || isNaN(height) || height <= 0 || height > 300) return "Please enter a valid height in cm.";

            const weight = parseFloat(formData.weight);
            if (!formData.weight || isNaN(weight) || weight <= 0 || weight > 500) return "Please enter a valid weight in kg.";
        }
        return null;
    };

    const handleGuestLogin = () => {
        setShowGuestModal(true);
        setError('');
    };

    const submitGuestLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const age = parseInt(guestData.age);
            if (!guestData.age || isNaN(age) || age <= 0 || age > 120) return setError("Please enter a valid age.");
            const height = parseFloat(guestData.height);
            if (!guestData.height || isNaN(height) || height <= 0 || height > 300) return setError("Please enter a valid height.");
            const weight = parseFloat(guestData.weight);
            if (!guestData.weight || isNaN(weight) || weight <= 0 || weight > 500) return setError("Please enter a valid weight.");

            const res = await login({ username: 'guest', password: 'guestpassXYZ123' });
            localStorage.setItem('token', res.access_token);
            // Now update the user stats
            await updateUserProfile({
                name: guestData.name,
                age: age,
                height: height,
                weight: weight
            });
            auth.login(res.access_token);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Failed to login as guest.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (isRegister) {
                await register({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    age: parseInt(formData.age),
                    height: parseFloat(formData.height),
                    weight: parseFloat(formData.weight)
                });
                const res = await login({ username: formData.username, password: formData.password });
                auth.login(res.access_token);
                navigate('/');
            } else {
                const res = await login({ username: formData.username, password: formData.password });
                auth.login(res.access_token);
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        }
    };

    if (showGuestModal) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', position: 'relative' }}>
                <h1 style={{ marginBottom: '1rem' }}>Your Body Stats</h1>
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                    <form onSubmit={submitGuestLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {error && <div style={{ color: 'var(--color-fat)', padding: '0.5rem', border: '1px solid var(--color-fat)', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Name (Optional)</label>
                            <input className="input-field" type="text" name="name" value={guestData.name} onChange={(e) => setGuestData({ ...guestData, name: e.target.value })} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem' }}>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Age</label>
                                <input className="input-field" type="number" name="age" value={guestData.age} onChange={(e) => setGuestData({ ...guestData, age: e.target.value })} placeholder="Yrs" min="1" step="1" />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Height</label>
                                <input className="input-field" type="number" name="height" value={guestData.height} onChange={(e) => setGuestData({ ...guestData, height: e.target.value })} placeholder="cm" min="1" step="0.1" />
                            </div>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Weight</label>
                                <input className="input-field" type="number" name="weight" value={guestData.weight} onChange={(e) => setGuestData({ ...guestData, weight: e.target.value })} placeholder="kg" min="1" step="0.1" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Start Tracker
                        </button>
                        <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none' }} onClick={() => setShowGuestModal(false)}>
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', position: 'relative' }}>
            <h1 style={{ marginBottom: '1rem' }}>{isRegister ? 'Create an Account' : 'Welcome Back'}</h1>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {error && <div style={{ color: 'var(--color-fat)', padding: '0.5rem', border: '1px solid var(--color-fat)', borderRadius: '4px', textAlign: 'center' }}>{error}</div>}

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Username</label>
                        <input className="input-field" type="text" name="username" value={formData.username} onChange={handleChange} />
                    </div>

                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">Password</label>
                        <input className="input-field" type="password" name="password" value={formData.password} onChange={handleChange} />
                    </div>

                    {isRegister && (
                        <>
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Name</label>
                                <input className="input-field" type="text" name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Age</label>
                                    <input className="input-field" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Yrs" min="1" step="1" />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Height</label>
                                    <input className="input-field" type="number" name="height" value={formData.height} onChange={handleChange} placeholder="cm" min="1" step="0.1" />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label">Weight</label>
                                    <input className="input-field" type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="kg" min="1" step="0.1" />
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        {isRegister ? 'Sign Up' : 'Log In'}
                    </button>

                    <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} onClick={handleGuestLogin}>
                        Continue as Guest
                    </button>

                    <p style={{ textAlign: 'center', marginTop: '1rem', cursor: 'pointer', color: 'var(--accent-primary)' }} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
