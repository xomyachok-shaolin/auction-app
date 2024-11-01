// ParticipantLogin.js
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './AuthStyles.css';

const ParticipantLogin = () => {
    const [participantId, setParticipantId] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        if (!participantId) {
            setError('Пожалуйста, введите ваш ID участника.');
            return;
        }

        try {
            const response = await fetch(`/getParticipantToken/${participantId}`);
            if (response.ok) {
                const data = await response.json();
                history.push(`/participant/${data.token}`);
            } else {
                setError('Участник не найден.');
            }
        } catch (error) {
            console.error('Ошибка при получении токена участника:', error);
            setError('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
        }
    };

    return (
        <div className="auth-container">
            <h2>Вход для участников</h2>
            {error && <div className="error-message">{error}</div>}
            <input
                type="text"
                placeholder="Введите ваш ID участника"
                value={participantId}
                onChange={e => setParticipantId(e.target.value)}
            />
            <button onClick={handleLogin}>Войти</button>
        </div>
    );
};

export default ParticipantLogin;
