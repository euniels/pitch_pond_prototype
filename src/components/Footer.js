import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <Leaf size={24} className="brand-icon" />
                            <span className="brand-text">PitchPond</span>
                        </div>
                        <p className="footer-tagline">
                            Where great ideas find their roots. Crowdfunding &amp; equity investment for the Philippines.
                        </p>
                    </div>

                    <div className="footer-columns">
                        <div className="footer-col">
                            <h4>Platform</h4>
                            <Link to="/explore">Explore Campaigns</Link>
                            <Link to="/pricing">Pricing</Link>
                            <Link to="/about">About Us</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Support</h4>
                            <Link to="/about">FAQ</Link>
                            <Link to="/about">Help Center</Link>
                            <Link to="/signin">Sign In</Link>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <span>Terms of Service</span>
                            <span>Privacy Policy</span>
                            <span>Risk Disclaimer</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 PitchPond. All rights reserved. Demo platform for illustrative purposes.</p>
                    <p className="footer-flag">🇵🇭 Made for Filipino entrepreneurs</p>
                </div>
            </div>
        </footer>
    );
}
