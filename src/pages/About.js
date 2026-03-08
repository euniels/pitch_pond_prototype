import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Brain, Users, Heart, ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
    {
        q: "What is PitchPond?",
        a: "PitchPond is the Philippines' most trusted crowdfunding and equity investment platform. We connect visionary Filipino founders with impact-driven investors through transparent, milestone-based funding."
    },
    {
        q: "How does verification work?",
        a: "We offer multi-level verification: Basic (email + phone), Partial (government ID check), and Fully Verified (SEC/DTI registration, bank account proof, and video call). Each level unlocks more platform features and builds greater trust with backers."
    },
    {
        q: "What are milestones?",
        a: "Milestones are pre-defined goals set by founders during campaign creation. Campaign funds are held in escrow and released only when founders hit and verify each milestone, protecting backers' contributions."
    },
    {
        q: "How is the Success Predictor calculated?",
        a: "Our AI Success Predictor analyzes multiple factors including pitch completeness, founder verification level, traction metrics, market validation, engagement rate, and historical patterns from similar campaigns."
    },
    {
        q: "What fees does PitchPond charge?",
        a: "Donation campaigns: 3-5% platform fee. Investment/equity campaigns: 7-10% platform fee. Pro Founder plan reduces fees. Payment processing fees (2-3%) apply separately."
    },
    {
        q: "Is my investment protected?",
        a: "All funds are held in milestone-based escrow. Money is released to founders only upon verified milestone completion. However, all investments carry inherent risk — please review each campaign's risk disclosure carefully."
    },
    {
        q: "Can I cancel a contribution?",
        a: "Donation contributions can be refunded within 7 days if the campaign hasn't ended. For investment campaigns, terms vary based on the specific campaign's equity agreement. Check each campaign's terms before investing."
    },
    {
        q: "How do I contact support?",
        a: "Email us at support@pitchpond.ph or use the Help Center for FAQs and guides. Pro and Premium users receive priority support with guaranteed 24-hour response times."
    }
];

export default function About() {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="about-page">
            <section className="about-hero">
                <h1>About PitchPond</h1>
                <p>Where great Filipino ideas find their roots. We're building a trusted platform that connects visionary founders with impact-driven investors through transparent, milestone-based funding.</p>
            </section>

            {/* Values */}
            <section className="section">
                <div className="section-header">
                    <h2>Our Values</h2>
                </div>
                <div className="values-grid">
                    <div className="value-card">
                        <ShieldCheck size={32} className="value-icon" />
                        <h3>Trust First</h3>
                        <p>Multi-layer verification and transparent risk scoring protect all users</p>
                    </div>
                    <div className="value-card">
                        <Brain size={32} className="value-icon" />
                        <h3>Data-Driven</h3>
                        <p>AI-powered success prediction helps founders and investors make informed decisions</p>
                    </div>
                    <div className="value-card">
                        <Users size={32} className="value-icon" />
                        <h3>Community</h3>
                        <p>We connect Filipino entrepreneurs with supportive backers nationwide</p>
                    </div>
                    <div className="value-card">
                        <Heart size={32} className="value-icon" />
                        <h3>Impact</h3>
                        <p>Focused on sustainable, scalable ventures that benefit communities</p>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="section section-alt">
                <div className="section-header">
                    <h2>Frequently Asked Questions</h2>
                </div>
                <div className="faq-list">
                    {faqData.map((faq, i) => (
                        <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                            <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <h3>{faq.q}</h3>
                                {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {openFaq === i && (
                                <div className="faq-answer">
                                    <p>{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="section section-cta">
                <h2>Ready to Make Waves?</h2>
                <p>Join thousands of Filipino founders and investors building the future together on PitchPond.</p>
                <div className="cta-actions">
                    <Link to="/signin" className="btn btn-primary btn-lg">Get Started</Link>
                    <Link to="/explore" className="btn btn-outline btn-lg">Browse Campaigns</Link>
                </div>
            </section>
        </div>
    );
}
