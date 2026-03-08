import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    MapPin, Users, Clock, TrendingUp, ShieldCheck, ShieldAlert, ShieldX,
    MessageCircle, BarChart3, Target, Calendar,
    AlertTriangle, CheckCircle2, Circle, Loader2, ArrowLeft
} from 'lucide-react';
import campaigns from '../data/campaigns';

function formatCurrency(amount) {
    return '₱' + amount.toLocaleString();
}

function VerificationBadge({ level }) {
    if (level === 'verified') return <span className="badge badge-verified-lg"><ShieldCheck size={16} /> Fully Verified</span>;
    if (level === 'partial') return <span className="badge badge-partial-lg"><ShieldAlert size={16} /> Partially Verified</span>;
    return <span className="badge badge-unverified-lg"><ShieldX size={16} /> Unverified</span>;
}

function RiskBadge({ level }) {
    const colors = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' };
    const labels = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk' };
    return (
        <div className={`risk-badge ${colors[level]}`}>
            <AlertTriangle size={16} />
            <span>{labels[level]}</span>
            <small>Based on verification, disclosures, and activity patterns</small>
        </div>
    );
}

export default function CampaignDetail({ currentUser }) {
    const { id } = useParams();
    const campaign = campaigns.find(c => c.id === id);
    const [activeTab, setActiveTab] = useState('overview');
    const [comment, setComment] = useState('');
    const [backAmount, setBackAmount] = useState('');

    if (!campaign) {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>Campaign not found</h2>
                <Link to="/explore" className="btn btn-primary">Browse Campaigns</Link>
            </div>
        );
    }

    const percent = Math.round((campaign.raised / campaign.goal) * 100);
    const tabs = ['overview', 'updates', 'milestones', 'backers', 'analytics'];

    return (
        <div className="campaign-detail-page">
            {/* Hero Image */}
            <div className="cd-hero">
                <img src={campaign.image} alt={campaign.title} />
                <div className="cd-hero-overlay">
                    <Link to="/explore" className="btn btn-ghost btn-sm cd-back">
                        <ArrowLeft size={16} /> Back to Explore
                    </Link>
                    <div className="cd-hero-badges">
                        <span className={`badge badge-type-lg ${campaign.type === 'investment' ? 'badge-investment' : 'badge-donation'}`}>
                            {campaign.type === 'investment' ? '📈 Investment' : '💝 Donation'}
                        </span>
                        <VerificationBadge level={campaign.verified} />
                        <span className="badge badge-category">{campaign.category}</span>
                    </div>
                </div>
            </div>

            <div className="cd-content">
                {/* Left Column - Main Content */}
                <div className="cd-main">
                    <div className="cd-title-block">
                        <h1>{campaign.title}</h1>
                        <div className="cd-meta">
                            <span><MapPin size={16} /> {campaign.location}</span>
                            <span>By <strong>{campaign.founder}</strong></span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="cd-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`cd-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="cd-tab-content">
                            <div className="cd-section">
                                <h3>The Problem</h3>
                                <p>{campaign.problem}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Our Solution</h3>
                                <p>{campaign.solution}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Market Opportunity</h3>
                                <p>{campaign.market}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Traction</h3>
                                <p>{campaign.traction}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Team</h3>
                                <p>{campaign.team}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Use of Funds</h3>
                                <p>{campaign.useOfFunds}</p>
                            </div>
                            <div className="cd-section">
                                <h3>Risk Disclosure</h3>
                                <p>{campaign.riskDisclosure}</p>
                            </div>

                            {/* Comments Section */}
                            <div className="cd-section cd-comments">
                                <h3><MessageCircle size={18} /> Comments &amp; Questions</h3>
                                <div className="comments-empty">
                                    <p>No comments yet</p>
                                </div>
                                {currentUser && (
                                    <div className="comment-form">
                                        <textarea
                                            placeholder="Ask a question or leave a comment..."
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                        />
                                        <button className="btn btn-primary btn-sm" disabled={!comment.trim()}>
                                            Post Comment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'updates' && (
                        <div className="cd-tab-content">
                            {campaign.updates.length === 0 ? (
                                <div className="empty-state">
                                    <Calendar size={48} className="empty-icon" />
                                    <p>No updates posted yet</p>
                                </div>
                            ) : (
                                <div className="updates-list">
                                    {campaign.updates.map((update, i) => (
                                        <div key={i} className="update-card">
                                            <span className="update-date">{update.date}</span>
                                            <h4>{update.title}</h4>
                                            <p>{update.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div className="cd-tab-content">
                            <div className="milestones-list">
                                {campaign.milestones.map((milestone, i) => (
                                    <div key={i} className={`milestone-card milestone-${milestone.status}`}>
                                        <div className="milestone-icon">
                                            {milestone.status === 'completed' && <CheckCircle2 size={24} />}
                                            {milestone.status === 'in-progress' && <Loader2 size={24} className="spinning" />}
                                            {milestone.status === 'pending' && <Circle size={24} />}
                                        </div>
                                        <div className="milestone-info">
                                            <h4>{milestone.title}</h4>
                                            <span className="milestone-amount">{formatCurrency(milestone.amount)}</span>
                                            <span className={`milestone-status-badge ${milestone.status}`}>
                                                {milestone.status === 'in-progress' ? 'In Progress' : milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'backers' && (
                        <div className="cd-tab-content">
                            <div className="empty-state">
                                <Users size={48} className="empty-icon" />
                                <p>Backer details are visible to logged-in users</p>
                                {!currentUser && <Link to="/signin" className="btn btn-primary btn-sm">Sign In to View</Link>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="cd-tab-content">
                            <div className="analytics-grid">
                                <div className="analytics-card">
                                    <BarChart3 size={24} />
                                    <strong>{campaign.backers * 12}</strong>
                                    <span>Total Views</span>
                                </div>
                                <div className="analytics-card">
                                    <Users size={24} />
                                    <strong>{campaign.backers}</strong>
                                    <span>Total Backers</span>
                                </div>
                                <div className="analytics-card">
                                    <TrendingUp size={24} />
                                    <strong>{formatCurrency(Math.round(campaign.raised / Math.max(1, 30 - campaign.daysLeft + 30)))}</strong>
                                    <span>Avg Daily Funding</span>
                                </div>
                                <div className="analytics-card">
                                    <Target size={24} />
                                    <strong>{percent}%</strong>
                                    <span>Funded</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="cd-sidebar">
                    {/* Funding Progress */}
                    <div className="cd-sidebar-card cd-funding">
                        <div className="cd-funding-amount">
                            <strong>{formatCurrency(campaign.raised)}</strong>
                            <span>of {formatCurrency(campaign.goal)}</span>
                        </div>
                        <div className="progress-bar progress-bar-lg">
                            <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
                        </div>
                        <span className="cd-funding-percent">{percent}% funded</span>

                        <div className="cd-funding-stats">
                            <div><Users size={16} /> <strong>{campaign.backers}</strong> backers</div>
                            <div><Clock size={16} /> <strong>{campaign.daysLeft}</strong> days left</div>
                        </div>

                        {campaign.type === 'investment' && campaign.equityOffered && (
                            <div className="cd-equity">
                                Equity Offered <strong>{campaign.equityOffered}%</strong>
                            </div>
                        )}

                        {/* Back / Invest */}
                        {currentUser ? (
                            <div className="cd-back-form">
                                <input
                                    type="number"
                                    placeholder={campaign.type === 'investment' ? 'Investment amount (₱)' : 'Donation amount (₱)'}
                                    value={backAmount}
                                    onChange={e => setBackAmount(e.target.value)}
                                    min="500"
                                />
                                <button className="btn btn-primary btn-block">
                                    {campaign.type === 'investment' ? 'Invest Now' : 'Back This Campaign'}
                                </button>
                            </div>
                        ) : (
                            <Link to="/signin" className="btn btn-primary btn-block">
                                Sign In to {campaign.type === 'investment' ? 'Invest' : 'Back'}
                            </Link>
                        )}
                    </div>

                    {/* AI Success Predictor */}
                    <div className="cd-sidebar-card cd-predictor">
                        <h4><TrendingUp size={18} /> AI Success Predictor</h4>
                        <div className="predictor-score">
                            <div className="predictor-circle">
                                <svg viewBox="0 0 36 36" className="predictor-svg">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="3"
                                        strokeDasharray={`${campaign.successPrediction}, 100`}
                                    />
                                </svg>
                                <span className="predictor-value">{campaign.successPrediction}%</span>
                            </div>
                        </div>
                        <div className="predictor-factors">
                            <h5>Key Factors:</h5>
                            {campaign.successFactors.map((factor, i) => (
                                <div key={i} className="factor-item">
                                    <CheckCircle2 size={14} /> {factor}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="cd-sidebar-card">
                        <h4>Risk Assessment</h4>
                        <RiskBadge level={campaign.riskLevel} />
                    </div>
                </div>
            </div>
        </div>
    );
}
