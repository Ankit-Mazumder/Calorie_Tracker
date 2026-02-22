import { useEffect, useState, useRef } from 'react';
import api from '../api';
import Header from '../components/Header';
import { uploadMealsPDF } from '../api';

const Meals = () => {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filters
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState('');

    const fetchMeals = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = { skip: 0, limit: 100 };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (mealType) params.meal_type = mealType;

            const res = await api.get('/meals', { params });
            setMeals(res.data.items || []);
        } catch (err) {
            console.error('Failed to fetch meals:', err);
            setError('Failed to load meals.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [startDate, endDate, mealType]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this meal?')) return;
        try {
            await api.delete(`/meals/${id}`);
            fetchMeals(); // Refresh list
        } catch (err) {
            console.error('Failed to delete meal:', err);
            alert('Failed to delete meal.');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError('');
        try {
            const result = await uploadMealsPDF(file);
            alert(result.message);
            fetchMeals(); // Refresh the list
        } catch (err: any) {
            console.error('File upload failed:', err);
            setError(err.response?.data?.detail || 'Failed to upload and parse PDF. Please ensure it follows the tabular format.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1>Meal History</h1>
                    <h2>View and filter your nutrition logs</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading & Parsing...' : 'Import Diary (PDF)'}
                    </button>
                    <Header />
                </div>
            </div>

            {/* Filters Area */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', padding: '1rem 1.5rem' }}>
                <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                    <label className="input-label">Start Date</label>
                    <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                    <label className="input-label">End Date</label>
                    <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="input-group" style={{ margin: 0, flex: 1, minWidth: '150px' }}>
                    <label className="input-label">Meal Type</label>
                    <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                        <option value="">All Meals</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                    </select>
                </div>
            </div>

            {/* Data Grid Area */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                {error && <div style={{ color: 'var(--color-fat)', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>{error}</div>}

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                            <tr>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date & Type</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Food</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calories</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Macros</th>
                                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div className="pulse-glow" style={{ display: 'inline-block' }}>Loading meals...</div>
                                    </td>
                                </tr>
                            ) : meals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No meals found for this filter combination.
                                    </td>
                                </tr>
                            ) : (
                                meals.map((meal) => (
                                    <tr key={meal.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{new Date(meal.date).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>{meal.meal_type}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{meal.food_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{meal.quantity}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                            {Math.round(meal.calories)} <span style={{ fontSize: '0.75em', fontWeight: 'normal', color: 'var(--text-muted)' }}>kcal</span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <span style={{ color: 'var(--color-protein)' }}>P: <strong style={{ color: 'var(--text-main)' }}>{Math.round(meal.protein)}g</strong></span>
                                                <span style={{ color: 'var(--color-carbs)' }}>C: <strong style={{ color: 'var(--text-main)' }}>{Math.round(meal.carbs)}g</strong></span>
                                                <span style={{ color: 'var(--color-fat)' }}>F: <strong style={{ color: 'var(--text-main)' }}>{Math.round(meal.fat)}g</strong></span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleDelete(meal.id)}
                                                style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Meals;
