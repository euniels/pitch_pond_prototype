import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Building2 } from 'lucide-react';

export default function Pricing() {
    return (
        <div className="pricing-page">
            <section className="pricing-hero">
                <h1>Choose Your Plan</h1>
                <p>Unlock more features and maximize your success on PitchPond</p>
            </section>

            <section className="pricing-cards">
                <div className="pricing-card">
                    <div className="pricing-card-header">
                        <h3>Free Founder</h3>
                        <div className="pricing-price">
                            <span className="price-amount">₱0</span>
                            <span className="price-period">/ forever</span>
                        </div>
                    </div>
                    <ul className="pricing-features">
                        <li><Check size={16} className="check" /> Basic campaign listing</li>
                        <li><Check size={16} className="check" /> Standard analytics</li>
                        <li><Check size={16} className="check" /> Community support</li>
                        <li><Check size={16} className="check" /> 5% platform fee</li>
                        <li><Check size={16} className="check" /> Basic verification badge</li>
                    </ul>
                    <Link to="/signin" className="btn btn-outline btn-block">Get Started</Link>
                </div>

                <div className="pricing-card pricing-card-featured">
                    <div className="pricing-popular-badge"><Star size={14} /> Most Popular</div>
                    <div className="pricing-card-header">
                        <h3>Pro Founder</h3>
                        <div className="pricing-price">
                            <span className="price-amount">₱2,999</span>
                            <span className="price-period">/ per month</span>
                        </div>
                    </div>
                    <ul className="pricing-features">
                        <li><Check size={16} className="check" /> Featured campaign listing</li>
                        <li><Check size={16} className="check" /> Advanced analytics &amp; insights</li>
                        <li><Check size={16} className="check" /> Priority support</li>
                        <li><Check size={16} className="check" /> 3% platform fee</li>
                        <li><Check size={16} className="check" /> Boosted in recommendations</li>
                        <li><Check size={16} className="check" /> Custom branding options</li>
                        <li><Check size={16} className="check" /> Email campaign tools</li>
                    </ul>
                    <Link to="/signin" className="btn btn-primary btn-block">Upgrade Now</Link>
                </div>

                <div className="pricing-card">
                    <div className="pricing-card-header">
                        <h3>Investor Premium</h3>
                        <div className="pricing-price">
                            <span className="price-amount">₱1,499</span>
                            <span className="price-period">/ per month</span>
                        </div>
                    </div>
                    <ul className="pricing-features">
                        <li><Check size={16} className="check" /> Early access to campaigns</li>
                        <li><Check size={16} className="check" /> Advanced search filters</li>
                        <li><Check size={16} className="check" /> Portfolio analytics</li>
                        <li><Check size={16} className="check" /> Investment alerts</li>
                        <li><Check size={16} className="check" /> Priority deal flow</li>
                        <li><Check size={16} className="check" /> Exclusive investor webinars</li>
                    </ul>
                    <Link to="/signin" className="btn btn-outline btn-block">Upgrade Now</Link>
                </div>
            </section>

            <section className="enterprise-section">
                <div className="enterprise-card">
                    <Building2 size={32} />
                    <h3>Enterprise Solutions</h3>
                    <p>Need custom features, white-label solutions, or dedicated support? We offer tailored packages for organizations and institutional investors.</p>
                    <button className="btn btn-outline">Contact Sales</button>
                </div>
            </section>
        </div>
    );
}
