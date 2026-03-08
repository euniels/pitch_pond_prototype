import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, Moon, Sun } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, darkMode, onToggleDark }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-brand">
                    <Leaf size={28} className="brand-icon" />
                    <span className="brand-text">PitchPond</span>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link
                        to="/explore"
                        className={`nav-link ${isActive('/explore') ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Explore
                    </Link>
                    <Link
                        to="/pricing"
                        className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        Pricing
                    </Link>
                    <Link
                        to="/about"
                        className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                        onClick={() => setMenuOpen(false)}
                    >
                        About
                    </Link>
                    {currentUser && (
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                    )}
                </div>

                <div className="navbar-actions">
                    <button
                        className="btn btn-ghost btn-sm dark-toggle"
                        onClick={onToggleDark}
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {currentUser ? (
                        <div className="user-menu">
                            <Link to="/profile" className="user-avatar-link" title="View Profile">
                                <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-sm" />
                            </Link>
                            <Link to="/profile" className="user-name-sm">{currentUser.name.split(' ')[0]}</Link>
                            <button className="btn btn-outline btn-sm" onClick={() => { onLogout(); navigate('/'); }}>
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/signin" className="btn btn-outline btn-sm">Sign In</Link>
                            <Link to="/signin" className="btn btn-primary btn-sm">Get Started</Link>
                        </>
                    )}
                    <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
