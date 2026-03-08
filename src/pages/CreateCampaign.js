import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
    Leaf, ChevronRight, ChevronLeft, CheckCircle2,
    DollarSign, Calendar, FileText, Tag, Image, Target
} from 'lucide-react';

const CATEGORIES = [
    'Agriculture', 'Technology', 'Healthcare', 'Education', 'Environment',
    'Social Enterprise', 'Creative Industries', 'Food & Beverage', 'Retail', 'Finance'
];

const TYPES = [
    { value: 'investment', label: '📈 Equity / Investment', desc: 'Offer equity or revenue share to investors' },
    { value: 'donation', label: '❤️ Donation / Reward', desc: 'Raise funds through donations and rewards' },
];

const STEPS = ['Basics', 'Funding', 'Story', 'Review'];

const EMPTY = {
    title: '', category: '', type: '', tagline: '',
    goal: '', daysLeft: '', minBacking: '',
    description: '', image: '', tags: '',
};

export default function CreateCampaign({ currentUser, onAddCampaign }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState(EMPTY);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    if (!currentUser || currentUser.role !== 'Founder') return <Navigate to="/dashboard" />;

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const validateStep = () => {
        const e = {};
        if (step === 0) {
            if (!form.title.trim()) e.title = 'Campaign title is required';
            if (!form.category) e.category = 'Please select a category';
            if (!form.type) e.type = 'Please select a campaign type';
            if (!form.tagline.trim()) e.tagline = 'A short tagline is required';
        }
        if (step === 1) {
            if (!form.goal || isNaN(form.goal) || Number(form.goal) <= 0) e.goal = 'Enter a valid funding goal';
            if (!form.daysLeft || isNaN(form.daysLeft) || Number(form.daysLeft) <= 0) e.daysLeft = 'Enter campaign duration (days)';
            if (!form.minBacking || isNaN(form.minBacking) || Number(form.minBacking) <= 0) e.minBacking = 'Enter minimum backing amount';
        }
        if (step === 2) {
            if (!form.description.trim() || form.description.trim().length < 50)
                e.description = 'Campaign story must be at least 50 characters';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validateStep()) setStep(s => s + 1); };
    const back = () => { setErrors({}); setStep(s => s - 1); };

    const handleSubmit = () => {
        const newCampaign = {
            id: `new-${Date.now()}`,
            title: form.title,
            tagline: form.tagline,
            category: form.category,
            type: form.type,
            goal: Number(form.goal),
            raised: 0,
            backers: 0,
            daysLeft: Number(form.daysLeft),
            description: form.description,
            image: form.image || `https://placehold.co/600x400/e2e8f0/94a3b8?text=${encodeURIComponent(form.category)}`,
            successPrediction: 0,
            verified: 'unverified',
            milestones: [],
        };
        if (onAddCampaign) onAddCampaign(newCampaign);
        setSubmitted(true);
        setTimeout(() => navigate('/dashboard'), 3500);
    };

    if (submitted) {
        return (
            <div className="create-success-page">
                <div className="create-success-card">
                    <CheckCircle2 size={64} className="success-icon" />
                    <h2>Campaign Submitted!</h2>
                    <p>Your campaign <strong>"{form.title}"</strong> has been submitted for review. Our team will verify and approve it within 2–3 business days.</p>
                    <p className="success-note">Redirecting to your dashboard…</p>
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="create-page">
            {/* Header */}
            <div className="create-header">
                <Link to="/dashboard" className="create-back-link">
                    <ChevronLeft size={18} /> Back to Dashboard
                </Link>
                <div className="create-header-title">
                    <Leaf size={22} className="brand-icon" />
                    <h1>Create New Venture</h1>
                </div>
                <p>Launch your crowdfunding campaign on PitchPond</p>
            </div>

            {/* Stepper */}
            <div className="create-stepper">
                {STEPS.map((label, i) => (
                    <React.Fragment key={i}>
                        <div className={`stepper-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                            <div className="stepper-circle">
                                {i < step ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                            </div>
                            <span>{label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`stepper-line ${i < step ? 'done' : ''}`} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="create-body">
                <div className="create-form-card">

                    {/* ── Step 0: Basics ── */}
                    {step === 0 && (
                        <div className="form-step">
                            <h2 className="step-title"><Tag size={20} /> Campaign Basics</h2>

                            <div className="form-group">
                                <label>Campaign Title *</label>
                                <input
                                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                                    placeholder="e.g. FarmFresh: Urban Agriculture in Metro Manila"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                />
                                {errors.title && <span className="field-error">{errors.title}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        className={`form-input ${errors.category ? 'input-error' : ''}`}
                                        value={form.category}
                                        onChange={e => set('category', e.target.value)}
                                    >
                                        <option value="">Select a category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.category && <span className="field-error">{errors.category}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Campaign Type *</label>
                                <div className={`type-cards ${errors.type ? 'input-error-outline' : ''}`}>
                                    {TYPES.map(t => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            className={`type-card ${form.type === t.value ? 'selected' : ''}`}
                                            onClick={() => set('type', t.value)}
                                        >
                                            <strong>{t.label}</strong>
                                            <span>{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.type && <span className="field-error">{errors.type}</span>}
                            </div>

                            <div className="form-group">
                                <label>Short Tagline *</label>
                                <input
                                    className={`form-input ${errors.tagline ? 'input-error' : ''}`}
                                    placeholder="One sentence that captures your venture"
                                    value={form.tagline}
                                    maxLength={100}
                                    onChange={e => set('tagline', e.target.value)}
                                />
                                <small className="input-hint">{form.tagline.length}/100 characters</small>
                                {errors.tagline && <span className="field-error">{errors.tagline}</span>}
                            </div>

                            <div className="form-group">
                                <label>Tags (optional)</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. sustainable, urban, AI, food security (comma separated)"
                                    value={form.tags}
                                    onChange={e => set('tags', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Funding ── */}
                    {step === 1 && (
                        <div className="form-step">
                            <h2 className="step-title"><DollarSign size={20} /> Funding Details</h2>

                            <div className="form-group">
                                <label>Funding Goal (₱) *</label>
                                <div className="input-prefix-wrap">
                                    <span className="input-prefix">₱</span>
                                    <input
                                        className={`form-input input-with-prefix ${errors.goal ? 'input-error' : ''}`}
                                        type="number"
                                        placeholder="500000"
                                        value={form.goal}
                                        onChange={e => set('goal', e.target.value)}
                                    />
                                </div>
                                {errors.goal && <span className="field-error">{errors.goal}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Campaign Duration (days) *</label>
                                    <div className="input-prefix-wrap">
                                        <Calendar size={16} className="input-icon" />
                                        <input
                                            className={`form-input input-with-prefix ${errors.daysLeft ? 'input-error' : ''}`}
                                            type="number"
                                            placeholder="30"
                                            min="1"
                                            max="180"
                                            value={form.daysLeft}
                                            onChange={e => set('daysLeft', e.target.value)}
                                        />
                                    </div>
                                    {errors.daysLeft && <span className="field-error">{errors.daysLeft}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Minimum Backing (₱) *</label>
                                    <div className="input-prefix-wrap">
                                        <span className="input-prefix">₱</span>
                                        <input
                                            className={`form-input input-with-prefix ${errors.minBacking ? 'input-error' : ''}`}
                                            type="number"
                                            placeholder="1000"
                                            value={form.minBacking}
                                            onChange={e => set('minBacking', e.target.value)}
                                        />
                                    </div>
                                    {errors.minBacking && <span className="field-error">{errors.minBacking}</span>}
                                </div>
                            </div>

                            {form.goal && (
                                <div className="funding-preview">
                                    <Target size={16} />
                                    <span>Funding Goal: <strong>₱{Number(form.goal).toLocaleString()}</strong></span>
                                    {form.daysLeft && <span> · Duration: <strong>{form.daysLeft} days</strong></span>}
                                    {form.minBacking && <span> · Min Backing: <strong>₱{Number(form.minBacking).toLocaleString()}</strong></span>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Story ── */}
                    {step === 2 && (
                        <div className="form-step">
                            <h2 className="step-title"><FileText size={20} /> Campaign Story</h2>

                            <div className="form-group">
                                <label>Campaign Description *</label>
                                <textarea
                                    className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                                    placeholder="Tell your story. What problem are you solving? What is your solution? What will you do with the funding? Share your vision, mission, and why backers should trust you…"
                                    value={form.description}
                                    rows={8}
                                    onChange={e => set('description', e.target.value)}
                                />
                                <small className="input-hint">{form.description.length} characters (minimum 50)</small>
                                {errors.description && <span className="field-error">{errors.description}</span>}
                            </div>

                            <div className="form-group">
                                <label>Cover Image URL (optional)</label>
                                <div className="input-prefix-wrap">
                                    <Image size={16} className="input-icon" />
                                    <input
                                        className="form-input input-with-prefix"
                                        placeholder="https://images.unsplash.com/..."
                                        value={form.image}
                                        onChange={e => set('image', e.target.value)}
                                    />
                                </div>
                                {form.image && (
                                    <img
                                        src={form.image}
                                        alt="Cover preview"
                                        className="image-preview"
                                        onError={e => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Review ── */}
                    {step === 3 && (
                        <div className="form-step">
                            <h2 className="step-title"><CheckCircle2 size={20} /> Review & Submit</h2>
                            <p className="review-subtitle">Please review your campaign details before submitting for approval.</p>

                            <div className="review-grid">
                                <div className="review-section">
                                    <h4>Campaign Basics</h4>
                                    <div className="review-row"><span>Title</span><strong>{form.title}</strong></div>
                                    <div className="review-row"><span>Category</span><strong>{form.category}</strong></div>
                                    <div className="review-row"><span>Type</span><strong className={`badge ${form.type === 'investment' ? 'badge-investment' : 'badge-donation'} badge-sm`}>{form.type}</strong></div>
                                    <div className="review-row"><span>Tagline</span><strong>{form.tagline}</strong></div>
                                    {form.tags && <div className="review-row"><span>Tags</span><strong>{form.tags}</strong></div>}
                                </div>

                                <div className="review-section">
                                    <h4>Funding Details</h4>
                                    <div className="review-row"><span>Goal</span><strong>₱{Number(form.goal).toLocaleString()}</strong></div>
                                    <div className="review-row"><span>Duration</span><strong>{form.daysLeft} days</strong></div>
                                    <div className="review-row"><span>Min Backing</span><strong>₱{Number(form.minBacking).toLocaleString()}</strong></div>
                                </div>

                                <div className="review-section review-story">
                                    <h4>Campaign Story</h4>
                                    <p>{form.description}</p>
                                </div>
                            </div>

                            <div className="review-notice">
                                <Shield size={16} />
                                <span>After submission, the PitchPond admin team will review and verify your campaign within 2–3 business days before it goes live.</span>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="form-nav">
                        {step > 0 ? (
                            <button type="button" className="btn btn-outline" onClick={back}>
                                <ChevronLeft size={16} /> Back
                            </button>
                        ) : (
                            <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button type="button" className="btn btn-primary" onClick={next}>
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primary btn-submit" onClick={handleSubmit}>
                                <CheckCircle2 size={16} /> Submit Campaign
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Need this for the review step icon
function Shield({ size }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}
