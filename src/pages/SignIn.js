import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoUsers } from '../data/campaigns';
import { LogIn, Shield } from 'lucide-react';

export default function SignIn({ onLogin }) {
    const navigate = useNavigate();

    const handleLogin = (user) => {
        onLogin(user);
        navigate('/dashboard');
    };

    const getRoleIcon = (role) => {
        if (role === 'Founder') return '🚀';
        if (role === 'Platform Admin') return '🛡️';
        return '💼';
    };

    return (
        <div className="signin-page">
            <div className="signin-card">
                <div className="signin-header">
                    <LogIn size={32} className="signin-icon" />
                    <h1>PitchPond</h1>
                    <p>Sign in to access your account</p>
                </div>

                <div className="demo-accounts">
                    <div className="demo-label">
                        <Shield size={16} />
                        <span>Demo Accounts</span>
                        <small>Click any role to instantly sign in</small>
                    </div>

                    {demoUsers.map(user => (
                        <button
                            key={user.id}
                            className="demo-user-card"
                            onClick={() => handleLogin(user)}
                        >
                            <img src={user.avatar} alt={user.name} className="demo-avatar" />
                            <div className="demo-user-info">
                                <strong>{user.name}</strong>
                                <span className="demo-role">
                                    {getRoleIcon(user.role)} {user.role}
                                </span>
                                <small>{user.description}</small>
                                <span className="demo-email">{user.email}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <p className="signin-disclaimer">
                    This is a demo platform. No real authentication required.
                </p>
            </div>
        </div>
    );
}
