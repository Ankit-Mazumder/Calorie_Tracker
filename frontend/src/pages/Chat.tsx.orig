import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../api';

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi there! I am your AI nutrition assistant. I can help you log meals, answer nutrition questions, or summarize your week. What can I do for you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatWithAI(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', text: response.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1>AI Assistant</h1>
                <h2>Ask me anything about your nutrition</h2>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.role === 'user' ? 'var(--accent-secondary)' : 'var(--bg-main)',
                            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                            padding: '1rem 1.5rem',
                            borderRadius: '1rem',
                            borderBottomRightRadius: msg.role === 'user' ? '0' : '1rem',
                            borderBottomLeftRadius: msg.role === 'assistant' ? '0' : '1rem',
                            maxWidth: '75%',
                            border: msg.role === 'assistant' ? '1px solid var(--border-light)' : 'none'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                    {loading && (
                        <div style={{ alignSelf: 'flex-start', padding: '1rem', color: 'var(--text-muted)' }}>
                            Assistant is typing...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 2rem' }}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
