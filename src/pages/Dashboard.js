import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Users, DollarSign, Clock, BarChart3, Target, Eye,
    Plus, CheckCircle2, Circle, Loader2, Bell, Settings,
    FileText, ArrowUpRight
} from 'lucide-react';
import campaigns from '../data/campaigns';

function formatCurrency(amount) {
    return '₱' + amount.toLocaleString();
}

/* ─── FOUNDER DASHBOARD ─── */
export function FounderDashboard({ user, userCampaigns = [] }) {
    const baseCampaigns = campaigns.slice(0, 3);
    const myCampaigns = [...userCampaigns, ...baseCampaigns];

    const totalRaised = myCampaigns.reduce((sum, c) => sum + (c.raised || 0), 0);
    const totalBackers = myCampaigns.reduce((sum, c) => sum + (c.backers || 0), 0);
    const scoredCampaigns = myCampaigns.filter(c => c.successPrediction);
    const avgPrediction = scoredCampaigns.length
        ? Math.round(scoredCampaigns.reduce((sum, c) => sum + c.successPrediction, 0) / scoredCampaigns.length)
        : 0;

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <img src={user.avatar} alt={user.name} className="dashboard-avatar" />
                    <div>
                        <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p>Founder Dashboard</p>
                    </div>
                </div>
                <Link to="/create-campaign" className="btn btn-primary btn-sm">
                    <Plus size={16} /> Create Venture
                </Link>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card-dash">
                    <DollarSign size={24} className="stat-icon-green" />
                    <div>
                        <strong>{formatCurrency(totalRaised)}</strong>
                        <span>Total Raised</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <Users size={24} className="stat-icon-blue" />
                    <div>
                        <strong>{totalBackers}</strong>
                        <span>Total Backers</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <FileText size={24} className="stat-icon-purple" />
                    <div>
                        <strong>{myCampaigns.length}</strong>
                        <span>Active Campaigns</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <TrendingUp size={24} className="stat-icon-amber" />
                    <div>
                        <strong>{avgPrediction}%</strong>
                        <span>Avg Success Score</span>
                    </div>
                </div>
            </div>

            {/* My Campaigns */}
            <div className="dashboard-section">
                <h2>My Campaigns</h2>
                <div className="dashboard-table-wrap">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Raised</th>
                                <th>Goal</th>
                                <th>Progress</th>
                                <th>Backers</th>
                                <th>Days Left</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myCampaigns.map((c, idx) => {
                                const pct = c.goal ? Math.round(((c.raised || 0) / c.goal) * 100) : 0;
                                const isNew = !c.id || c.id.startsWith('new-');
                                return (
                                    <tr key={c.id || idx}>
                                        <td>
                                            {isNew ? (
                                                <span className="table-campaign-link">
                                                    {c.title.length > 40 ? c.title.substring(0, 40) + '...' : c.title}
                                                    <span className="badge badge-partial badge-sm" style={{ marginLeft: '0.4rem' }}>Pending Review</span>
                                                </span>
                                            ) : (
                                                <Link to={`/campaign/${c.id}`} className="table-campaign-link">
                                                    {c.title.length > 40 ? c.title.substring(0, 40) + '...' : c.title}
                                                </Link>
                                            )}
                                        </td>
                                        <td>{formatCurrency(c.raised || 0)}</td>
                                        <td>{formatCurrency(c.goal)}</td>
                                        <td>
                                            <div className="mini-progress">
                                                <div className="mini-progress-bar">
                                                    <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>{c.backers || 0}</td>
                                        <td>{c.daysLeft || '—'}d</td>
                                        <td>
                                            {isNew ? (
                                                <span className="table-campaign-link" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Under review</span>
                                            ) : (
                                                <Link to={`/campaign/${c.id}`} className="btn btn-ghost btn-xs">
                                                    <Eye size={14} /> View
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Milestones */}
            <div className="dashboard-section">
                <h2>Upcoming Milestones</h2>
                <div className="milestone-dashboard-list">
                    {myCampaigns.flatMap(c =>
                        c.milestones
                            .filter(m => m.status !== 'completed')
                            .map((m, i) => (
                                <div key={`${c.id}-${i}`} className="milestone-dash-card">
                                    <div className="milestone-dash-icon">
                                        {m.status === 'in-progress' ? <Loader2 size={20} className="spinning" /> : <Circle size={20} />}
                                    </div>
                                    <div className="milestone-dash-info">
                                        <strong>{m.title}</strong>
                                        <small>{c.title.substring(0, 30)}...</small>
                                    </div>
                                    <span className={`milestone-status-badge ${m.status}`}>
                                        {m.status === 'in-progress' ? 'In Progress' : 'Pending'}
                                    </span>
                                </div>
                            ))
                    ).slice(0, 5)}
                </div>
            </div>
        </div>
    );
}

/* ─── INVESTOR DASHBOARD ─── */
export function InvestorDashboard({ user }) {
    const backed = campaigns.slice(0, 5); // mock backed campaigns

    const totalInvested = backed.reduce((sum, c) => sum + Math.round(c.raised / c.backers), 0);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <img src={user.avatar} alt={user.name} className="dashboard-avatar" />
                    <div>
                        <h1>Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p>Investor Dashboard</p>
                    </div>
                </div>
                <Link to="/explore" className="btn btn-primary btn-sm">
                    <Target size={16} /> Discover Campaigns
                </Link>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card-dash">
                    <DollarSign size={24} className="stat-icon-green" />
                    <div>
                        <strong>{formatCurrency(totalInvested)}</strong>
                        <span>Total Invested</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <FileText size={24} className="stat-icon-blue" />
                    <div>
                        <strong>{backed.length}</strong>
                        <span>Campaigns Backed</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <TrendingUp size={24} className="stat-icon-purple" />
                    <div>
                        <strong>{Math.round(backed.reduce((s, c) => s + c.successPrediction, 0) / backed.length)}%</strong>
                        <span>Avg Success Score</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <BarChart3 size={24} className="stat-icon-amber" />
                    <div>
                        <strong>{backed.filter(c => c.type === 'investment').length}</strong>
                        <span>Equity Holdings</span>
                    </div>
                </div>
            </div>

            {/* Portfolio */}
            <div className="dashboard-section">
                <h2>My Portfolio</h2>
                <div className="portfolio-grid">
                    {backed.map(c => {
                        const pct = Math.round((c.raised / c.goal) * 100);
                        return (
                            <Link key={c.id} to={`/campaign/${c.id}`} className="portfolio-card">
                                <img src={c.image} alt={c.title} />
                                <div className="portfolio-info">
                                    <h4>{c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title}</h4>
                                    <div className="mini-progress">
                                        <div className="mini-progress-bar">
                                            <div className="mini-progress-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span>{pct}%</span>
                                    </div>
                                    <div className="portfolio-meta">
                                        <span className={`badge badge-type badge-sm ${c.type === 'investment' ? 'badge-investment' : 'badge-donation'}`}>
                                            {c.type === 'investment' ? 'Investment' : 'Donation'}
                                        </span>
                                        <span>{c.daysLeft} days left</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Recommended */}
            <div className="dashboard-section">
                <h2>Recommended for You</h2>
                <div className="portfolio-grid">
                    {campaigns.filter(c => !backed.includes(c)).slice(0, 3).map(c => (
                        <Link key={c.id} to={`/campaign/${c.id}`} className="portfolio-card">
                            <img src={c.image} alt={c.title} />
                            <div className="portfolio-info">
                                <h4>{c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title}</h4>
                                <div className="portfolio-meta">
                                    <span>AI Score: {c.successPrediction}%</span>
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─── ADMIN DASHBOARD ─── */
export function AdminDashboard({ user }) {
    const pending = campaigns.filter(c => c.verified !== 'verified');
    const totalFunded = campaigns.reduce((s, c) => s + c.raised, 0);

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div className="dashboard-welcome">
                    <img src={user.avatar} alt={user.name} className="dashboard-avatar" />
                    <div>
                        <h1>Admin Panel</h1>
                        <p>Platform Management</p>
                    </div>
                </div>
                <div className="dashboard-admin-actions">
                    <button className="btn btn-outline btn-sm"><Settings size={16} /> Settings</button>
                    <button className="btn btn-outline btn-sm"><Bell size={16} /> Notifications</button>
                </div>
            </div>

            {/* Stats */}
            <div className="dashboard-stats">
                <div className="stat-card-dash">
                    <FileText size={24} className="stat-icon-green" />
                    <div>
                        <strong>{campaigns.length}</strong>
                        <span>Total Campaigns</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <DollarSign size={24} className="stat-icon-blue" />
                    <div>
                        <strong>{formatCurrency(totalFunded)}</strong>
                        <span>Total Raised</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <Users size={24} className="stat-icon-purple" />
                    <div>
                        <strong>{campaigns.reduce((s, c) => s + c.backers, 0)}</strong>
                        <span>Total Backers</span>
                    </div>
                </div>
                <div className="stat-card-dash">
                    <Clock size={24} className="stat-icon-amber" />
                    <div>
                        <strong>{pending.length}</strong>
                        <span>Pending Verification</span>
                    </div>
                </div>
            </div>

            {/* Pending Verifications */}
            <div className="dashboard-section">
                <h2>Pending Verifications</h2>
                <div className="dashboard-table-wrap">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Campaign</th>
                                <th>Founder</th>
                                <th>Type</th>
                                <th>Verification</th>
                                <th>Raised</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.slice(0, 8).map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <Link to={`/campaign/${c.id}`} className="table-campaign-link">
                                            {c.title.length > 35 ? c.title.substring(0, 35) + '...' : c.title}
                                        </Link>
                                    </td>
                                    <td>{c.founder}</td>
                                    <td>
                                        <span className={`badge badge-type badge-sm ${c.type === 'investment' ? 'badge-investment' : 'badge-donation'}`}>
                                            {c.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-sm badge-${c.verified}`}>
                                            {c.verified}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(c.raised)}</td>
                                    <td>
                                        <button className="btn btn-primary btn-xs">Approve</button>
                                        <button className="btn btn-ghost btn-xs">Review</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Milestone Approvals */}
            <div className="dashboard-section">
                <h2>Milestone Approvals</h2>
                <div className="milestone-dashboard-list">
                    {campaigns.slice(0, 5).flatMap(c =>
                        c.milestones
                            .filter(m => m.status === 'in-progress')
                            .map((m, i) => (
                                <div key={`${c.id}-${i}`} className="milestone-dash-card">
                                    <div className="milestone-dash-icon">
                                        <Loader2 size={20} className="spinning" />
                                    </div>
                                    <div className="milestone-dash-info">
                                        <strong>{m.title}</strong>
                                        <small>{c.title.substring(0, 30)}... — {formatCurrency(m.amount)}</small>
                                    </div>
                                    <div className="milestone-dash-actions">
                                        <button className="btn btn-primary btn-xs">
                                            <CheckCircle2 size={14} /> Approve
                                        </button>
                                        <button className="btn btn-ghost btn-xs">Reject</button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}
