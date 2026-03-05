import React from 'react';
import './SavingsStyles.css';

export default function GoalsPage({ goals, setGoals, onNavigate }) {
    const fmt = (n) => n?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0';

    const handleAddGoal = () => {
        const newGoal = {
            id: Date.now(),
            title: "New Goal",
            saved: 0,
            target: 10000,
            image: "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
        };
        setGoals([...goals, newGoal]);
        onNavigate('goal', newGoal);
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>Savings Hub</div>
                    <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>Your Goals</div>
                </div>
                <button onClick={handleAddGoal} style={{
                    background: "rgba(129,199,132,0.15)", color: "#81C784", border: "1px solid rgba(129,199,132,0.3)",
                    width: 40, height: 40, borderRadius: 12, fontSize: 24, fontWeight: 300,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}>
                    +
                </button>
            </div>

            {goals.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.02)",
                    borderRadius: 20, border: "1px dashed rgba(255,255,255,0.1)", marginTop: 20
                }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No goals set yet</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
                        Create a savings bucket to track your progress towards a specific target.
                    </div>
                    <button onClick={handleAddGoal} style={{
                        background: "linear-gradient(135deg, #FFD54F, #FFB300)", color: "#000",
                        border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer"
                    }}>
                        Create First Goal
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {goals.map(goal => {
                        const progress = Math.min(100, ((goal.saved || 0) / (goal.target || 1)) * 100);

                        return (
                            <div key={goal.id} onClick={() => onNavigate('goal', goal)} style={{
                                borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                                background: `linear-gradient(135deg, rgba(8,8,8,0.7), rgba(8,8,8,0.9)), url(${goal.image}) center/cover`,
                                border: '1px solid rgba(255,255,255,0.08)', padding: "20px",
                                display: 'flex', flexDirection: 'column', minHeight: 140, position: 'relative'
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "auto" }}>
                                    <span style={{
                                        background: 'rgba(129,199,132,0.2)', color: '#81C784', border: '1px solid rgba(129,199,132,0.3)',
                                        padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1
                                    }}>Bucket</span>

                                    {progress >= 100 && (
                                        <span style={{ fontSize: 20 }}>🎉</span>
                                    )}
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                                        {goal.title}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                                        <div style={{ fontSize: 15, color: '#fff', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                                            <span style={{ color: '#81C784' }}>${fmt(goal.saved)}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 4px' }}>/</span>
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>${fmt(goal.target)}</span>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: progress >= 100 ? '#81C784' : '#FFD54F' }}>
                                            {progress.toFixed(0)}%
                                        </div>
                                    </div>

                                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginTop: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
                                            background: progress >= 100 ? '#81C784' : 'linear-gradient(90deg, #FFD54F, #FFB300)',
                                            width: `${progress}%`,
                                            boxShadow: progress >= 100 ? '0 0 10px rgba(129,199,132,0.5)' : 'none'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
