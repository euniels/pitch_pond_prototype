import React, { useState, useMemo } from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import campaigns, { categories } from '../data/campaigns';
import CampaignCard from '../components/CampaignCard';

const types = ['All Types', 'investment', 'donation'];
const statuses = ['Active', 'All'];
const verifications = ['All Levels', 'verified', 'partial', 'unverified'];
const riskLevels = ['All Risk Levels', 'low', 'medium', 'high'];

export default function Explore() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [type, setType] = useState('All Types');
    const [status, setStatus] = useState('Active');
    const [verification, setVerification] = useState('All Levels');
    const [riskLevel, setRiskLevel] = useState('All Risk Levels');
    const [showFilters, setShowFilters] = useState(false);

    const filtered = useMemo(() => {
        return campaigns.filter(c => {
            if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
            if (category !== 'All Categories' && c.category !== category) return false;
            if (type !== 'All Types' && c.type !== type) return false;
            if (status === 'Active' && c.daysLeft <= 0) return false;
            if (verification !== 'All Levels' && c.verified !== verification) return false;
            if (riskLevel !== 'All Risk Levels' && c.riskLevel !== riskLevel) return false;
            return true;
        });
    }, [search, category, type, status, verification, riskLevel]);

    const resetFilters = () => {
        setSearch('');
        setCategory('All Categories');
        setType('All Types');
        setStatus('Active');
        setVerification('All Levels');
        setRiskLevel('All Risk Levels');
    };

    return (
        <div className="explore-page">
            <section className="explore-hero">
                <h1>Explore Campaigns</h1>
                <p>Discover opportunities that matter to you</p>
            </section>

            <section className="explore-content">
                <div className="explore-search-bar">
                    <div className="search-input-wrapper">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                </div>

                <div className={`explore-filters ${showFilters ? 'open' : ''}`}>
                    <div className="filter-group">
                        <label>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Type</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            {types.map(t => <option key={t} value={t}>{t === 'All Types' ? t : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Verification</label>
                        <select value={verification} onChange={e => setVerification(e.target.value)}>
                            {verifications.map(v => <option key={v} value={v}>{v === 'All Levels' ? v : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Risk Level</label>
                        <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)}>
                            {riskLevels.map(r => <option key={r} value={r}>{r === 'All Risk Levels' ? r : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                        <RotateCcw size={14} /> Reset Filters
                    </button>
                </div>

                <p className="results-count"><strong>{filtered.length}</strong> campaigns found</p>

                <div className="campaign-grid">
                    {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <p>No campaigns match your filters. Try adjusting your search criteria.</p>
                        <button className="btn btn-outline" onClick={resetFilters}>Reset Filters</button>
                    </div>
                )}
            </section>
        </div>
    );
}
