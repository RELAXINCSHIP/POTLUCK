import React, { useState, useEffect } from 'react';
import { getAccounts } from './plaidApi';

const ACCOUNT_ICONS = {
    depository: '🏦',
    credit: '💳',
    loan: '🏠',
    investment: '📈',
    brokerage: '📊',
    other: '💰',
};

const LinkedAccounts = ({ userId, refreshKey, accounts: propAccounts = [] }) => {
    const [accounts, setAccounts] = useState(propAccounts);
    const [loading, setLoading] = useState(propAccounts.length === 0);
    const [linked, setLinked] = useState(propAccounts.length > 0);

    useEffect(() => {
        if (propAccounts.length > 0) {
            setAccounts(propAccounts);
            setLinked(true);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const data = await getAccounts(userId);
                if (!cancelled) {
                    setAccounts(data.accounts || []);
                    setLinked(data.linked || false);
                }
            } catch (err) {
                console.error('Error fetching accounts:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchAccounts();
        return () => { cancelled = true; };
    }, [userId, refreshKey, propAccounts]);

    if (loading) {
        return (
            <div style={{
                padding: 16, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13,
            }}>
                Loading accounts...
            </div>
        );
    }

    if (!linked || accounts.length === 0) return null;

    const fmt = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '—';

    return (
        <section style={{ marginTop: 24 }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
            }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Linked Accounts</span>
                <span style={{
                    fontSize: 10, fontWeight: 700, color: '#81C784',
                    background: 'rgba(129,199,132,0.12)', padding: '3px 8px', borderRadius: 6,
                    textTransform: 'uppercase', letterSpacing: 1,
                }}>
                    Live via Plaid
                </span>
            </div>

            {accounts.map(acct => (
                <div key={acct.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', marginBottom: 8,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.2s',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'rgba(255,213,79,0.08)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>
                            {ACCOUNT_ICONS[acct.type] || ACCOUNT_ICONS.other}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                                {acct.institution}
                            </div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                {acct.name} •••{acct.mask}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                            ${fmt(acct.balance_current)}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize' }}>
                            {acct.subtype || acct.type}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
};

export default LinkedAccounts;
