import { useState } from 'react';
import { createMeal, extractNutritionFromImage } from '../api';

const LogMeal = () => {
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoResult, setPhotoResult] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        meal_type: 'Breakfast',
        food_name: '',
        quantity: '1 serving',
        date: new Date().toISOString().split('T')[0],
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: '',
        minerals: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['calories', 'protein', 'carbs', 'fat'].includes(name) ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createMeal(formData);
            setSuccessMessage(true);
            setTimeout(() => setSuccessMessage(false), 3000);
            // Reset form briefly
            setFormData(prev => ({ ...prev, food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0 }));
            setPreviewUrl(null);
            setPhotoResult(null);
        } catch (err) {
            console.error(err);
            alert('Failed to log meal.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Preview rendering
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setPhotoResult(null);

        setPhotoLoading(true);
        try {
            const data = await extractNutritionFromImage(file);

            // Add a small artificial delay so the user can enjoy the playfully magical scanner UI
            await new Promise(resolve => setTimeout(resolve, 1500));

            setPhotoResult(data);
            if (data.warning) {
                setWarningMessage(data.warning);
            } else {
                setWarningMessage(null);
            }

            // Auto-fill form
            setFormData(prev => ({
                ...prev,
                food_name: data.food_name || prev.food_name,
                calories: data.calories || prev.calories,
                protein: data.protein || prev.protein,
                carbs: data.carbs || prev.carbs,
                fat: data.fat || prev.fat,
            }));
        } catch (err) {
            console.error(err);
            alert('Failed to extract data from image.');
        } finally {
            setPhotoLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h1 style={{ marginBottom: '1rem' }}>Log a Meal</h1>

            {successMessage && (
                <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', borderRadius: 'var(--border-radius-md)', textAlign: 'center', fontWeight: 'bold', animation: 'slideUp 0.3s ease-out' }}>
                    🎉 Meal logged successfully!
                </div>
            )}
            {warningMessage && (
                <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 'var(--border-radius-md)', textAlign: 'center', fontWeight: 'bold' }}>
                    ⚠️ {warningMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>
                {/* Manual Form Area */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.25rem' }}>Manual Entry</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Date</label>
                            <input type="date" name="date" className="input-field" value={formData.date} onChange={handleInputChange} required />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Meal Type</label>
                            <select name="meal_type" className="input-field" value={formData.meal_type} onChange={handleInputChange}>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Dinner">Dinner</option>
                                <option value="Snack">Snack</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Food Name</label>
                            <input type="text" name="food_name" className="input-field" placeholder="e.g. Grilled Chicken Salad" value={formData.food_name} onChange={handleInputChange} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Calories (kcal)</label>
                                <input type="number" name="calories" className="input-field" min="0" step="1" value={formData.calories} onChange={handleInputChange} required />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Quantity</label>
                                <input type="text" name="quantity" className="input-field" value={formData.quantity} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Protein (g)</label>
                                <input type="number" name="protein" className="input-field" min="0" step="0.1" value={formData.protein} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Carbs (g)</label>
                                <input type="number" name="carbs" className="input-field" min="0" step="0.1" value={formData.carbs} onChange={handleInputChange} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Fat (g)</label>
                                <input type="number" name="fat" className="input-field" min="0" step="0.1" value={formData.fat} onChange={handleInputChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Meal'}
                        </button>
                    </form>
                </div>

                {/* AI Scanner Area */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div className="card" style={{ border: '2px dashed var(--accent-secondary)', background: 'rgba(99, 102, 241, 0.05)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {!previewUrl ? (
                            <>
                                <h2 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${photoLoading ? 'pulse-glow' : ''}`}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                    </svg>
                                    AI Magic Scanner
                                </h2>

                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Upload a photo of your food plate or a nutrition label. The AI will analyze it and pre-fill the form instantly!
                                </p>
                            </>
                        ) : (
                            <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, marginBottom: '1.5rem', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={previewUrl} alt="Food preview" style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: photoLoading ? 0.7 : 1, transition: 'opacity 0.3s' }} />
                                {photoLoading && (
                                    <>
                                        <div className="scanner-overlay"></div>
                                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(15, 23, 42, 0.8)', padding: '0.5rem 1.5rem', borderRadius: '9999px', color: 'var(--accent-primary)', fontWeight: 600, border: '1px solid var(--accent-primary)' }} className="pulse-glow">
                                            Extracting Calories...
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {photoLoading ? (
                            <button disabled className="btn btn-primary" style={{ width: '100%', cursor: 'not-allowed', textAlign: 'center' }}>
                                Analyzing Image...
                            </button>
                        ) : previewUrl ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <label className="btn btn-primary" style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
                                    Retake
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                </label>
                                <button type="button" className="btn" style={{ background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'center', margin: 0 }} onClick={() => { setPreviewUrl(null); setPhotoResult(null); }}>
                                    Delete
                                </button>
                            </div>
                        ) : (
                            <label className="btn btn-primary" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
                                Select Photo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                            </label>
                        )}

                        {photoResult && !photoLoading && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--accent-primary)' }}>
                                <span style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>🌟 Extracted Successfully!</span>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                    Identified <strong style={{ color: 'var(--text-main)' }}>{photoResult.food_name}</strong> at {photoResult.calories} kcal. The form has been magically updated!
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogMeal;
