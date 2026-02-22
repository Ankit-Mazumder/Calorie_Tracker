import React, { useEffect, useState } from 'react';
import { getGoals, setGoal, updateGoal } from '../api';

const Goals = () => {
    const defaultGoal = {
        daily_calories: 2000,
        daily_protein: 150,
        daily_carbs: 200,
        daily_fat: 65,
        target_weight: null
    };

    const [goal, setGoalData] = useState(defaultGoal);
    const [originalGoal, setOriginalGoal] = useState(defaultGoal);
    const [goalId, setGoalId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await getGoals();
                if (res.length > 0) {
                    const current = res[0];
                    setGoalId(current.id);
                    const fetchedGoal = {
                        daily_calories: current.daily_calories || 0,
                        daily_protein: current.daily_protein || 0,
                        daily_carbs: current.daily_carbs || 0,
                        daily_fat: current.daily_fat || 0,
                        target_weight: current.target_weight || ''
                    };
                    setGoalData(fetchedGoal);
                    setOriginalGoal(fetchedGoal);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGoals();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGoalData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleReset = () => {
        setGoalData(originalGoal);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let savedGoal;
            if (goalId) {
                savedGoal = await updateGoal(goalId, goal);
            } else {
                savedGoal = await setGoal(goal);
                setGoalId(savedGoal.id);
            }

            const fetchedGoal = {
                daily_calories: savedGoal.daily_calories || 0,
                daily_protein: savedGoal.daily_protein || 0,
                daily_carbs: savedGoal.daily_carbs || 0,
                daily_fat: savedGoal.daily_fat || 0,
                target_weight: savedGoal.target_weight || ''
            };
            setOriginalGoal(fetchedGoal);
            alert('Goals updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update goals.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Personal Health Goals</h1>

            <div className="card" style={{ maxWidth: '600px' }}>
                <form onSubmit={handleSave}>
                    <div className="input-group">
                        <label className="input-label" style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Daily Target Calories</label>
                        <input
                            type="number"
                            name="daily_calories"
                            className="input-field"
                            style={{ fontSize: '1.5rem', padding: '1rem', textAlign: 'center' }}
                            value={goal.daily_calories}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem', marginBottom: '2rem' }}>
                        <div className="input-group">
                            <label className="input-label" style={{ color: 'var(--color-protein)' }}>Protein (g)</label>
                            <input type="number" name="daily_protein" className="input-field" value={goal.daily_protein} onChange={handleInputChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ color: 'var(--color-carbs)' }}>Carbs (g)</label>
                            <input type="number" name="daily_carbs" className="input-field" value={goal.daily_carbs} onChange={handleInputChange} />
                        </div>
                        <div className="input-group">
                            <label className="input-label" style={{ color: 'var(--color-fat)' }}>Fat (g)</label>
                            <input type="number" name="daily_fat" className="input-field" value={goal.daily_fat} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Target Weight (kg/lbs)</label>
                        <input type="number" name="target_weight" className="input-field" value={goal.target_weight || ''} onChange={handleInputChange} placeholder="Optional" />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ flex: 1, border: '1px solid var(--accent-primary)', color: 'var(--text-main)', background: 'transparent' }} onClick={handleReset} disabled={saving}>
                            Reset
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Goals'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Goals;
