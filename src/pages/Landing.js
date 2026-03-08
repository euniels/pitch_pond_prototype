import React from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Users, Award, BarChart3, ShieldCheck,
    Brain, Lock, Heart, Trophy, Sprout, Rocket,
    Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import campaigns, { testimonials } from '../data/campaigns';
import CampaignCard from '../components/CampaignCard';

export default function Landing() {
    const featured = campaigns.filter(c => c.featured).slice(0, 3);
    const [testimonialIdx, setTestimonialIdx] = React.useState(0);

    return (
        <div className="landing-page">
            {/* HERO */}
            <section className="hero">
                <div className="hero-badge">🌸 The Philippines' Most Trusted Crowdfunding Platform</div>
                <h1>Where Great Ideas<br /><span className="text-gradient">Find Their Roots</span></h1>
                <p className="hero-subtitle">
                    Whether you're a founder with a vision or an investor seeking impact, PitchPond
                    connects dreams with the capital they deserve — through donations or equity.
                </p>
                <div className="hero-actions">
                    <Link to="/explore" className="btn btn-primary btn-lg">Explore Campaigns</Link>
                    <Link to="/signin" className="btn btn-outline btn-lg">Start a Campaign</Link>
                </div>
                <p className="hero-demo">
                    Try demo as{' '}
                    <Link to="/signin">Founder</Link>,{' '}
                    <Link to="/signin">Investor</Link>, or{' '}
                    <Link to="/signin">Admin</Link>
                </p>

                <div className="hero-stats">
                    <div className="stat-card">
                        <TrendingUp size={24} className="stat-icon" />
                        <strong>340+</strong>
                        <span>Campaigns Funded</span>
                    </div>
                    <div className="stat-card">
                        <BarChart3 size={24} className="stat-icon" />
                        <strong>₱128M+</strong>
                        <span>Total Raised</span>
                    </div>
                    <div className="stat-card">
                        <Users size={24} className="stat-icon" />
                        <strong>12,500+</strong>
                        <span>Active Backers</span>
                    </div>
                    <div className="stat-card">
                        <Award size={24} className="stat-icon" />
                        <strong>78%</strong>
                        <span>Success Rate</span>
                    </div>
                </div>
            </section>

            {/* FEATURED CAMPAIGNS */}
            <section className="section">
                <div className="section-header">
                    <h2>Featured Campaigns</h2>
                    <p className="section-subtitle">Hand-picked opportunities making a difference</p>
                    <Link to="/explore" className="btn btn-outline btn-sm">View All</Link>
                </div>
                <div className="campaign-grid">
                    {featured.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="section section-alt">
                <div className="section-header">
                    <h2>How PitchPond Works</h2>
                    <p className="section-subtitle">Simple steps to fund your dream or grow your portfolio</p>
                </div>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-icon"><Sprout size={32} /></div>
                        <span className="step-label">🌱 STEP 01</span>
                        <h3>Create Your Profile</h3>
                        <p>Sign up as a Founder or Investor, complete verification to build trust with the community.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><Rocket size={32} /></div>
                        <span className="step-label">🚀 STEP 02</span>
                        <h3>Launch or Discover</h3>
                        <p>Founders build campaigns with our guided wizard. Investors browse with smart filters and AI predictions.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-icon"><TrendingUp size={32} /></div>
                        <span className="step-label">📈 STEP 03</span>
                        <h3>Grow Together</h3>
                        <p>Funds released via milestone escrow. Track progress with real-time dashboards and community updates.</p>
                    </div>
                </div>
            </section>

            {/* WHY PITCHPOND */}
            <section className="section">
                <div className="section-header">
                    <h2>Why PitchPond?</h2>
                    <p className="section-subtitle">Built different — with trust, transparency, and Filipino entrepreneurship at the core.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <ShieldCheck size={32} className="feature-icon" />
                        <h3>Trust &amp; Verification</h3>
                        <p>Multi-level founder verification with ID checks, business registration (SEC/DTI), and bank proof. Every venture displays a clickable license badge.</p>
                    </div>
                    <div className="feature-card">
                        <Brain size={32} className="feature-icon" />
                        <h3>AI Success Predictor</h3>
                        <p>Our transparent scoring engine predicts campaign success based on completion, traction, verification, and engagement metrics.</p>
                    </div>
                    <div className="feature-card">
                        <Lock size={32} className="feature-icon" />
                        <h3>Milestone-Based Escrow</h3>
                        <p>Funds are held in escrow and released only when founders hit verified milestones. Your contribution, protected every step of the way.</p>
                    </div>
                    <div className="feature-card">
                        <Heart size={32} className="feature-icon" />
                        <h3>True Crowdfunding</h3>
                        <p>Every backer matters — from ₱500 to ₱5M. Pooled community capital drives real Philippine ventures forward. Together we fund the future.</p>
                    </div>
                    <div className="feature-card">
                        <Trophy size={32} className="feature-icon" />
                        <h3>Quarterly Rankings</h3>
                        <p>Every 2–3 months, the Fastest Growing Venture and Top Investor earn a 1-week spotlight on the dashboard for maximum visibility.</p>
                    </div>
                    <div className="feature-card">
                        <BarChart3 size={32} className="feature-icon" />
                        <h3>Campaign Analytics</h3>
                        <p>Real-time dashboards for founders — track views, backer trends, traffic sources, and funding velocity all in one place.</p>
                    </div>
                </div>
            </section>

            {/* POWER IN NUMBERS */}
            <section className="section section-alt">
                <div className="section-header">
                    <h2>Power in Numbers</h2>
                    <p className="section-subtitle crowdfunding-quote">
                        💡 <strong>The Essence of Crowdfunding</strong> — Crowdfunding isn't just about money — it's about community. When 10, 100, or 1,000 people each contribute a little, dreams that seemed impossible suddenly become real. Every peso counts. Every backer is a believer. That's the magic of PitchPond.
                    </p>
                </div>

                <div className="power-highlights">
                    <div className="power-item">
                        <span className="power-emoji">🌱</span>
                        <strong>Anyone can back</strong>
                        <span>Start from ₱500</span>
                    </div>
                    <div className="power-item">
                        <span className="power-emoji">🔒</span>
                        <strong>Funds protected</strong>
                        <span>Escrow until milestones hit</span>
                    </div>
                    <div className="power-item">
                        <span className="power-emoji">📢</span>
                        <strong>Become an owner</strong>
                        <span>Equity campaigns available</span>
                    </div>
                    <div className="power-item">
                        <span className="power-emoji">🏆</span>
                        <strong>Get recognized</strong>
                        <span>Quarterly top backer awards</span>
                    </div>
                </div>

                <div className="campaign-types">
                    <div className="type-card">
                        <h3>Donation Campaign</h3>
                        <span className="type-fee">3–5% fee</span>
                        <p>Back a cause you believe in. Pure community spirit.</p>
                    </div>
                    <div className="type-card type-card-highlighted">
                        <h3>Investment Campaign</h3>
                        <span className="type-fee">7–10% fee</span>
                        <p>Get equity in the next big Filipino startup.</p>
                    </div>
                </div>

                <div className="spotlight-banner">
                    <Trophy size={24} />
                    <div>
                        <strong>Quarterly Spotlight Awards</strong>
                        <p>Top investor &amp; fastest venture featured for 1 week</p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="section">
                <div className="section-header">
                    <h2>Trusted by Filipino Builders</h2>
                </div>
                <div className="testimonials-carousel">
                    <button className="carousel-btn" onClick={() => setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length)}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="testimonial-card">
                        <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="testimonial-avatar" />
                        <div className="testimonial-info">
                            <strong>{testimonials[testimonialIdx].name}</strong>
                            <span>{testimonials[testimonialIdx].role}</span>
                        </div>
                        <p className="testimonial-quote">"{testimonials[testimonialIdx].quote}"</p>
                        <div className="testimonial-stars">
                            {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                                <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                            ))}
                        </div>
                    </div>
                    <button className="carousel-btn" onClick={() => setTestimonialIdx(i => (i + 1) % testimonials.length)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            {/* CTA */}
            <section className="section section-cta">
                <h2>Ready to Make Waves?</h2>
                <p>Join thousands of Filipino founders and investors building the future together.</p>
                <div className="cta-actions">
                    <Link to="/signin" className="btn btn-primary btn-lg">Get Started Free</Link>
                    <Link to="/explore" className="btn btn-outline btn-lg">Browse Campaigns</Link>
                </div>
            </section>
        </div>
    );
}
