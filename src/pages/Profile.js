import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    Mail, Shield, Briefcase, TrendingUp, DollarSign,
    Users, Target, BarChart3, FileText, Clock, Star, MapPin
} from 'lucide-react';
import campaigns from '../data/campaigns';

function formatCurrency(amount) {
    return '₱' + amount.toLocaleString();
}

function getRoleBadgeClass(role) {
    if (role === 'Founder') return 'badge-investment';
    if (role === 'Platform Admin') return 'badge-verified';
    return 'badge-donation';
}

function getRoleIcon(role) {
    if (role === 'Founder') return '🚀';
    if (role === 'Platform Admin') return '🛡️';
    return '💼';
}

function getMemberSince(id) {
    const map = {
        'founder-1': 'February 2024',
        'investor-1': 'March 2024',
        'investor-2': 'May 2024',
        'admin-1': 'January 2023',
    };
    return map[id] || 'January 2025';
}

function getLocation(id) {
    const map = {
        'founder-1': 'Quezon City, Manila',
        'investor-1': 'Makati City, Philippines',
        'investor-2': 'Cebu City, Philippines',
        'admin-1': 'BGC, Taguig',
    };
    return map[id] || 'Philippines';
}

function getBio(id) {
    const map = {
        'founder-1': 'Filipino entrepreneur building sustainable urban agriculture solutions. Passionate about leveraging technology to solve food security challenges in Metro Manila. FarmFresh founder.',
        'investor-1': 'Impact investor focused on tech and health startups across the Philippines. Believes in data-driven investing using AI tools to identify high-potential ventures early.',
        'investor-2': 'Social enterprise advocate and backer who supports community-driven projects in Visayas and Mindanao. Passionate about creative industries and cultural preservation.',
        'admin-1': 'PitchPond platform administrator ensuring trust, safety, and quality across all campaigns. Responsible for founder verification and milestone approval processes.',
    };
    return map[id] || '';
}

/* ─── Role-specific stats ─── */
function FounderStats({ user }) {
    const myCampaigns = campaigns.slice(0, 3);
    const totalRaised = myCampaigns.reduce((s, c) => s + c.raised, 0);
    const totalBackers = myCampaigns.reduce((s, c) => s + c.backers, 0);
    const avgScore = Math.round(myCampaigns.reduce((s, c) => s + c.successPrediction, 0) / myCampaigns.length);

    return (
        <div className="profile-stats-grid">
            <div className="profile-stat">
                <DollarSign size={22} className="stat-icon-green" />
                <strong>{formatCurrency(totalRaised)}</strong>
                <span>Total Raised</span>
            </div>
            <div className="profile-stat">
                <Users size={22} className="stat-icon-blue" />
                <strong>{totalBackers}</strong>
                <span>Total Backers</span>
            </div>
            <div className="profile-stat">
                <FileText size={22} className="stat-icon-purple" />
                <strong>{myCampaigns.length}</strong>
                <span>Campaigns</span>
            </div>
            <div className="profile-stat">
                <TrendingUp size={22} className="stat-icon-amber" />
                <strong>{avgScore}%</strong>
                <span>Avg AI Score</span>
            </div>
        </div>
    );
}

function InvestorStats({ user }) {
    const backed = campaigns.slice(0, user.id === 'investor-1' ? 5 : 4);
    const equityHoldings = backed.filter(c => c.type === 'investment').length;
    const avgScore = Math.round(backed.reduce((s, c) => s + c.successPrediction, 0) / backed.length);

    return (
        <div className="profile-stats-grid">
            <div className="profile-stat">
                <FileText size={22} className="stat-icon-blue" />
                <strong>{backed.length}</strong>
                <span>Backed Projects</span>
            </div>
            <div className="profile-stat">
                <BarChart3 size={22} className="stat-icon-green" />
                <strong>{equityHoldings}</strong>
                <span>Equity Holdings</span>
            </div>
            <div className="profile-stat">
                <TrendingUp size={22} className="stat-icon-purple" />
                <strong>{avgScore}%</strong>
                <span>Avg AI Score</span>
            </div>
            <div className="profile-stat">
                <Star size={22} className="stat-icon-amber" />
                <strong>Top Backer</strong>
                <span>Q1 2026 Award</span>
            </div>
        </div>
    );
}

function AdminStats() {
    const pending = campaigns.filter(c => c.verified !== 'verified').length;
    const totalFunded = campaigns.reduce((s, c) => s + c.raised, 0);
    return (
        <div className="profile-stats-grid">
            <div className="profile-stat">
                <FileText size={22} className="stat-icon-blue" />
                <strong>{campaigns.length}</strong>
                <span>Total Campaigns</span>
            </div>
            <div className="profile-stat">
                <DollarSign size={22} className="stat-icon-green" />
                <strong>{formatCurrency(totalFunded)}</strong>
                <span>Platform Total Raised</span>
            </div>
            <div className="profile-stat">
                <Clock size={22} className="stat-icon-amber" />
                <strong>{pending}</strong>
                <span>Pending Verifications</span>
            </div>
            <div className="profile-stat">
                <Shield size={22} className="stat-icon-purple" />
                <strong>Admin</strong>
                <span>Full Access</span>
            </div>
        </div>
    );
}

/* ─── Activity feed (mock) ─── */
function getActivity(user) {
    if (user.role === 'Founder') return [
        { icon: '📈', text: 'FarmFresh campaign reached 65% funded', time: '2 days ago' },
        { icon: '🎯', text: 'Milestone "Deploy AI monitoring system" in progress', time: '5 days ago' },
        { icon: '💬', text: 'Posted update: AI system beta launch', time: '2 weeks ago' },
        { icon: '✅', text: 'Milestone "Secure farm locations" completed', time: '1 month ago' },
        { icon: '🚀', text: 'FarmFresh campaign went live', time: '2 months ago' },
    ];
    if (user.role === 'Platform Admin') return [
        { icon: '✅', text: 'Approved 3 milestone verifications', time: '1 day ago' },
        { icon: '🛡️', text: 'Verified 2 new founder accounts', time: '3 days ago' },
        { icon: '📋', text: 'Reviewed 5 pending campaign applications', time: '1 week ago' },
        { icon: '⚠️', text: 'Flagged unverified campaign for review', time: '2 weeks ago' },
        { icon: '📊', text: 'Generated Q1 2026 platform report', time: '3 weeks ago' },
    ];
    if (user.id === 'investor-1') return [
        { icon: '💰', text: 'Backed MedTech PH — ₱50,000 contribution', time: '3 days ago' },
        { icon: '📊', text: 'Portfolio AI score improved to 83%', time: '1 week ago' },
        { icon: '💬', text: 'Commented on FarmFresh campaign update', time: '2 weeks ago' },
        { icon: '💰', text: 'Backed FarmFresh — ₱75,000 contribution', time: '1 month ago' },
        { icon: '🏆', text: 'Earned Q1 2026 Top Backer Award', time: '1 month ago' },
    ];
    return [
        { icon: '💰', text: 'Backed Project Libreng Libro — ₱5,000 contribution', time: '1 week ago' },
        { icon: '💰', text: 'Backed Cebuano Comics Revival — ₱10,000', time: '2 weeks ago' },
        { icon: '💬', text: 'Left a review on CodeCamp Pilipinas', time: '3 weeks ago' },
        { icon: '💰', text: 'Backed Plastic Bank Philippines — ₱15,000', time: '1 month ago' },
        { icon: '🔔', text: 'Joined PitchPond platform', time: '2 months ago' },
    ];
}

export default function Profile({ currentUser }) {
    if (!currentUser) return <Navigate to="/signin" />;

    const activity = getActivity(currentUser);

    return (
        <div className="profile-page">
            <div className="profile-content">
                {/* Left Column */}
                <aside className="profile-aside">
                    <div className="profile-card">
                        <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="profile-avatar"
                        />
                        <h2 className="profile-name">{currentUser.name}</h2>
                        <span className={`badge ${getRoleBadgeClass(currentUser.role)} profile-role-badge`}>
                            {getRoleIcon(currentUser.role)} {currentUser.role}
                        </span>

                        <div className="profile-meta">
                            <div className="profile-meta-item">
                                <Mail size={15} />
                                <span>{currentUser.email}</span>
                            </div>
                            <div className="profile-meta-item">
                                <MapPin size={15} />
                                <span>{getLocation(currentUser.id)}</span>
                            </div>
                            <div className="profile-meta-item">
                                <Briefcase size={15} />
                                <span>Member since {getMemberSince(currentUser.id)}</span>
                            </div>
                        </div>

                        <p className="profile-bio">{getBio(currentUser.id)}</p>

                        <div className="profile-actions">
                            <Link to="/dashboard" className="btn btn-primary btn-block">
                                <Target size={16} /> Go to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="profile-card profile-verification">
                        <h4><Shield size={16} /> Verification Status</h4>
                        {currentUser.role === 'Platform Admin' ? (
                            <div className="verification-item verified">
                                <span>✅ Platform Administrator</span>
                                <small>Full access granted</small>
                            </div>
                        ) : (
                            <>
                                <div className="verification-item verified">
                                    <span>✅ Email Verified</span>
                                </div>
                                <div className="verification-item verified">
                                    <span>✅ Phone Verified</span>
                                </div>
                                <div className={`verification-item ${currentUser.role === 'Founder' ? 'verified' : 'pending'}`}>
                                    <span>{currentUser.role === 'Founder' ? '✅' : '⏳'} Government ID</span>
                                </div>
                                <div className={`verification-item ${currentUser.role === 'Founder' ? 'verified' : 'pending'}`}>
                                    <span>{currentUser.role === 'Founder' ? '✅' : '⏳'} Business Registration</span>
                                </div>
                            </>
                        )}
                    </div>
                </aside>

                {/* Right Column */}
                <div className="profile-main">
                    {/* Stats */}
                    <div className="profile-section">
                        <h3 className="profile-section-title">
                            <BarChart3 size={18} />
                            {currentUser.role === 'Founder' ? 'Campaign Stats' :
                                currentUser.role === 'Platform Admin' ? 'Platform Overview' : 'Investment Stats'}
                        </h3>
                        {currentUser.role === 'Founder' && <FounderStats user={currentUser} />}
                        {currentUser.role === 'Backer / Investor' && <InvestorStats user={currentUser} />}
                        {currentUser.role === 'Platform Admin' && <AdminStats />}
                    </div>

                    {/* Campaigns / Portfolio preview */}
                    {currentUser.role === 'Founder' && (
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h3 className="profile-section-title"><FileText size={18} /> My Campaigns</h3>
                                <Link to="/dashboard" className="btn btn-ghost btn-xs">View All</Link>
                            </div>
                            <div className="profile-campaigns-list">
                                {campaigns.slice(0, 3).map(c => {
                                    const pct = Math.round((c.raised / c.goal) * 100);
                                    return (
                                        <Link key={c.id} to={`/campaign/${c.id}`} className="profile-campaign-row">
                                            <img src={c.image} alt={c.title}
                                                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/60x60/e2e8f0/94a3b8?text=${encodeURIComponent(c.category)}`; }} />
                                            <div className="profile-campaign-info">
                                                <strong>{c.title.length > 45 ? c.title.substring(0, 45) + '…' : c.title}</strong>
                                                <div className="mini-progress">
                                                    <div className="mini-progress-bar">
                                                        <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span>{pct}%</span>
                                                </div>
                                            </div>
                                            <span className={`badge badge-sm ${c.verified === 'verified' ? 'badge-verified' : 'badge-partial'}`}>
                                                {c.verified}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {currentUser.role === 'Backer / Investor' && (
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h3 className="profile-section-title"><TrendingUp size={18} /> My Portfolio</h3>
                                <Link to="/dashboard" className="btn btn-ghost btn-xs">View All</Link>
                            </div>
                            <div className="profile-campaigns-list">
                                {campaigns.slice(0, currentUser.id === 'investor-1' ? 5 : 4).map(c => {
                                    const pct = Math.round((c.raised / c.goal) * 100);
                                    return (
                                        <Link key={c.id} to={`/campaign/${c.id}`} className="profile-campaign-row">
                                            <img src={c.image} alt={c.title}
                                                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = `https://placehold.co/60x60/e2e8f0/94a3b8?text=${encodeURIComponent(c.category)}`; }} />
                                            <div className="profile-campaign-info">
                                                <strong>{c.title.length > 45 ? c.title.substring(0, 45) + '…' : c.title}</strong>
                                                <div className="mini-progress">
                                                    <div className="mini-progress-bar">
                                                        <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span>{pct}%</span>
                                                </div>
                                            </div>
                                            <span className={`badge badge-sm ${c.type === 'investment' ? 'badge-investment' : 'badge-donation'}`}>
                                                {c.type}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Activity Feed */}
                    <div className="profile-section">
                        <h3 className="profile-section-title"><Clock size={18} /> Recent Activity</h3>
                        <div className="profile-activity">
                            {activity.map((item, i) => (
                                <div key={i} className="activity-item">
                                    <span className="activity-icon">{item.icon}</span>
                                    <div className="activity-info">
                                        <span>{item.text}</span>
                                        <small>{item.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
