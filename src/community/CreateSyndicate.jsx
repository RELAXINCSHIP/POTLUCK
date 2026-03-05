import React, { useState } from 'react';

const EMOJIS = ['🚀', '💎', '🦍', '🔥', '💰', '🎯', '🎰', '👀', '🤝', '⚡'];

export default function CreateSyndicate({ onBack, onCreate }) {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('🚀');
    const [isPublic, setIsPublic] = useState(true);

    const handleCreate = () => {
        if (!name.trim()) return;

        const newSyndicate = {
            id: `syn_${Date.now()}`,
            name,
            emoji,
            is_public: isPublic,
            members: [{ avatar_emoji: '😎' }],
            member_count: 1,
            combined_entries: 0,
            pool_unlocked: false,
            time_to_draw: '14d 12h'
        };

        onCreate(newSyndicate);
    };

    return (
        <div style={{ padding: '24px 20px', flex: 1, overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>←</button>
                <div style={{ fontSize: 18, fontWeight: 700 }}>New Syndicate</div>
                <div style={{ width: 24 }}></div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {EMOJIS.map(e => (
                            <div key={e} onClick={() => setEmoji(e)} style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: emoji === e ? 'rgba(255,213,79,0.2)' : 'rgba(255,255,255,0.05)',
                                border: emoji === e ? '1px solid #FFD54F' : '1px solid transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20, cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                {e}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>Syndicate Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Diamond Hands 💎"
                        style={{
                            width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Public Syndicate</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Anyone can discover and join</div>
                    </div>
                    <div
                        onClick={() => setIsPublic(!isPublic)}
                        style={{
                            width: 50, height: 28, borderRadius: 14, cursor: 'pointer',
                            background: isPublic ? '#FFD54F' : 'rgba(255,255,255,0.1)',
                            position: 'relative', transition: 'background 0.3s'
                        }}
                    >
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%', background: isPublic ? '#000' : '#fff',
                            position: 'absolute', top: 2, left: isPublic ? 24 : 2, transition: 'left 0.3s'
                        }}></div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleCreate}
                disabled={!name.trim()}
                style={{
                    width: '100%', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 700,
                    background: name.trim() ? 'linear-gradient(135deg, #FFD54F, #FFB300)' : 'rgba(255,255,255,0.1)',
                    color: name.trim() ? '#000' : 'rgba(255,255,255,0.3)',
                    border: 'none', cursor: name.trim() ? 'pointer' : 'default',
                    transition: 'all 0.3s'
                }}
            >
                Create Syndicate
            </button>
        </div>
    );
}
