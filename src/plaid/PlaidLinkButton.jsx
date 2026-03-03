import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken } from './plaidApi';

const PlaidLinkButton = ({ userId, onSuccess, onExit, style }) => {
    const [linkToken, setLinkToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch link token when component mounts or userId changes
    useEffect(() => {
        let cancelled = false;
        const fetchToken = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await createLinkToken(userId);
                if (!cancelled) setLinkToken(data.link_token);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchToken();
        return () => { cancelled = true; };
    }, [userId]);

    const handleSuccess = useCallback(async (publicToken, metadata) => {
        try {
            await exchangePublicToken(publicToken, userId);
            onSuccess?.(metadata);
        } catch (err) {
            console.error('Token exchange failed:', err);
            setError('Failed to link account');
        }
    }, [userId, onSuccess]);

    const handleExit = useCallback((err, metadata) => {
        if (err) console.warn('Plaid Link exit error:', err);
        onExit?.(err, metadata);
    }, [onExit]);

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: handleSuccess,
        onExit: handleExit,
    });

    if (error) {
        return (
            <button
                onClick={() => window.location.reload()}
                style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                    ...style,
                }}
            >
                ⚠️ Connection Error — Tap to Retry
            </button>
        );
    }

    return (
        <button
            onClick={() => open()}
            disabled={!ready || loading}
            style={{
                width: '100%', padding: '14px 20px', borderRadius: 14,
                background: (!ready || loading)
                    ? 'rgba(255,255,255,0.04)'
                    : 'linear-gradient(135deg, #FFD54F, #FFB300)',
                border: (!ready || loading)
                    ? '1px solid rgba(255,255,255,0.08)'
                    : 'none',
                color: (!ready || loading) ? 'rgba(255,255,255,0.3)' : '#000',
                fontSize: 14, fontWeight: 700, cursor: (!ready || loading) ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: (!ready || loading) ? 'none' : '0 4px 20px rgba(255,213,79,0.3)',
                transition: 'all 0.3s ease',
                ...style,
            }}
        >
            {loading ? (
                <>
                    <span style={{ animation: 'pulse-ring 1s ease infinite' }}>⏳</span>
                    Connecting to Plaid...
                </>
            ) : (
                <>
                    <span style={{ fontSize: 18 }}>🏦</span>
                    Link Bank Account
                </>
            )}
        </button>
    );
};

export default PlaidLinkButton;
