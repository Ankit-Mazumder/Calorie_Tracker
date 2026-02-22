import { useEffect, useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../api';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [goals, setGoals] = useState<any>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch goals
                const resGoals = await api.get('/goals');
                setGoals(resGoals.data);

                // Fetch summary for last 7 days
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);

                const resSummary = await api.get('/reports/summary', {
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                    }
                });
                setSummary(resSummary.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        if (!user || user.height == null || user.weight == null || user.age == null) return null;

        const h = parseFloat(user.height);
        const w = parseFloat(user.weight);
        const a = parseInt(user.age);

        if (isNaN(h) || isNaN(w) || isNaN(a) || h <= 0 || w <= 0 || a <= 0) return null;

        const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
        let category = '';
        let color = '';
        const bmiNum = parseFloat(bmi);

        if (bmiNum < 18.5) { category = 'Underweight'; color = '#3b82f6'; }
        else if (bmiNum < 25) { category = 'Normal'; color = 'var(--accent-primary)'; }
        else if (bmiNum < 30) { category = 'Overweight'; color = '#eab308'; }
        else { category = 'Obese'; color = 'var(--color-fat)'; }

        // Using Mifflin-St Jeor Equation (approximated for gender-neutral average)
        const maintenance = Math.round((10 * w) + (6.25 * h) - (5 * a) - 78);

        return { bmi, category, color, maintenance };
    }, [user]);

    const currentGoal: any = goals.length > 0 ? goals[0] : null;

    // Prepare line chart data (Calories over time)
    const { labels, lineChartData, lineOptions, macroData } = useMemo(() => {
        const _labels = summary?.daily ? Object.keys(summary.daily).sort() : [];
        const _calorieData = _labels.map(day => summary.daily[day].calories);

        const _lineChartData = {
            labels: _labels,
            datasets: [
                {
                    label: 'Calories Consumed',
                    data: _calorieData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#10b981',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        };

        const _lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
            }
        };

        // Prepare doughnut chart data (Macros for total period)
        const _macroData = {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [
                {
                    data: [
                        summary?.totals?.protein || 0,
                        summary?.totals?.carbs || 0,
                        summary?.totals?.fat || 0
                    ],
                    backgroundColor: [
                        '#FF477E', // Vibrant Rose for Protein
                        '#FFB703', // Bright Amber for Carbs
                        '#3A86FF'  // Electric Blue for Fat
                    ],
                    borderColor: '#0B101E', // Match deep rich navy background
                    borderWidth: 2,
                    hoverOffset: 6
                }
            ]
        };

        return { labels: _labels, lineChartData: _lineChartData, lineOptions: _lineOptions, macroData: _macroData };
    }, [summary]);

    if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '2rem' }}><div className="pulse-glow" style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 'bold' }}>Loading dashboard metrics...</div></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <h1>Dashboard</h1>
                    <h2>Your 7-Day Nutrition Overview</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}>
                    <Header />
                    {stats && (
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '1rem',
                            borderRadius: 'var(--border-radius-lg)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: '220px',
                            border: `1px solid ${stats.color}40`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            width: '100%'
                        }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem' }}>Your Body Stats</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>BMI</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: stats.color }}>{stats.bmi}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: stats.color, background: `${stats.color}20`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                        {stats.category}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Maintenance</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>~{stats.maintenance} kcal</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', flex: 1, minHeight: 0 }}>

                {/* Left Column: 2x2 Metrics Grid & Doughnut Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--accent-primary)' }}>
                            <div className="input-label" style={{ fontSize: '0.8rem' }}>Avg Daily Calories</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.2' }}>
                                {labels.length > 0 ? Math.round(summary?.totals?.calories / labels.length) : 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>kcal</span>
                            </div>
                            {currentGoal?.daily_calories && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Target: {currentGoal.daily_calories}</div>
                            )}
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--color-protein)' }}>
                            <div className="input-label" style={{ fontSize: '0.8rem' }}>Avg Protein</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: '1.2' }}>
                                {labels.length > 0 ? Math.round(summary?.totals?.protein / labels.length) : 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>g</span>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--color-carbs)' }}>
                            <div className="input-label" style={{ fontSize: '0.8rem' }}>Avg Carbs</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: '1.2' }}>
                                {labels.length > 0 ? Math.round(summary?.totals?.carbs / labels.length) : 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>g</span>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '1rem', borderTop: '4px solid var(--color-fat)' }}>
                            <div className="input-label" style={{ fontSize: '0.8rem' }}>Avg Fat</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: '1.2' }}>
                                {labels.length > 0 ? Math.round(summary?.totals?.fat / labels.length) : 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>g</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Macro Breakdown</h3>
                        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            {(summary?.totals?.protein > 0 || summary?.totals?.carbs > 0 || summary?.totals?.fat > 0) ? (
                                <Doughnut data={macroData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No macro data</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Large Line Chart */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Calorie Trend</h3>
                    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                        {labels.length > 0 ? (
                            <Line data={lineChartData} options={lineOptions} />
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data for this period</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
