import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Clock, TrendingUp, Star, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

function formatCurrency(amount) {
    return '₱' + amount.toLocaleString();
}

function VerificationBadge({ level }) {
    if (level === 'verified') return <span className="badge badge-verified"><ShieldCheck size={14} /> Verified</span>;
    if (level === 'partial') return <span className="badge badge-partial"><ShieldAlert size={14} /> Partial</span>;
    return <span className="badge badge-unverified"><ShieldX size={14} /> Unverified</span>;
}

export default function CampaignCard({ campaign }) {
    const percent = Math.round((campaign.raised / campaign.goal) * 100);

    return (
        <Link to={`/campaign/${campaign.id}`} className="campaign-card">
            <div className="campaign-card-image">
                <img
                    src={campaign.image}
                    alt={campaign.title}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(campaign.category)}`;
                    }}
                />
                <div className="campaign-card-badges">
                    <span className={`badge badge-type ${campaign.type === 'investment' ? 'badge-investment' : 'badge-donation'}`}>
                        {campaign.type === 'investment' ? '📈 Investment' : '💝 Donation'}
                    </span>
                    {campaign.featured && (
                        <span className="badge badge-featured"><Star size={12} /> Featured</span>
                    )}
                </div>
            </div>

            <div className="campaign-card-body">
                <div className="campaign-card-verification">
                    <VerificationBadge level={campaign.verified} />
                </div>

                <h3 className="campaign-card-title">{campaign.title}</h3>

                <div className="campaign-card-meta">
                    <span className="campaign-location"><MapPin size={14} /> {campaign.location}</span>
                    <span className="campaign-category">{campaign.category}</span>
                </div>

                <p className="campaign-card-desc">{campaign.description}</p>

                <div className="campaign-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
                    </div>
                    <div className="progress-stats">
                        <span className="progress-amount">
                            <strong>{formatCurrency(campaign.raised)}</strong> of {formatCurrency(campaign.goal)}
                        </span>
                    </div>
                    <div className="progress-details">
                        <span><Users size={14} /> {campaign.backers} backers</span>
                        <span><Clock size={14} /> {campaign.daysLeft} days left</span>
                        <span className="progress-percent">{percent}%</span>
                    </div>
                </div>

                <div className="campaign-card-prediction">
                    <TrendingUp size={14} />
                    <span>Success Prediction <strong>{campaign.successPrediction}%</strong></span>
                </div>
            </div>
        </Link>
    );
}
