import React, { useState } from 'react';
import api from '../api';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', email: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        try {
            const { data } = await api.post(endpoint, form);
            if (data.token) {
                localStorage.setItem('token', data.token);
                onLogin();
            }
        } catch (err) {
            alert(err.response?.data?.error || "Ошибка авторизации");
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd' }}>
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required /><br/>
                {!isLogin && <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />}<br/>
                <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required /><br/>
                <button type="submit">{isLogin ? 'Войти' : 'Создать аккаунт'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} style={{marginTop: '10px'}}>
                Переключить на {isLogin ? 'Регистрацию' : 'Вход'}
            </button>
        </div>
    );
};

export default Auth;