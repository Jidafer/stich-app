    import React, { useState, useEffect, useRef } from 'react';
    import api from '../api';
    import io from 'socket.io-client'; 

    // --- Настройки чата ---
    const SOCKET_SERVER_URL = 'http://localhost:5000'; 
    // --- ---

    // Импортируем хук для работы с чатом (путь исправлен)
     import { useChatSocket } from '../chat/useChatSocket';

    const App = () => {
        const [posts, setPosts] = useState([]);
        const [newPost, setNewPost] = useState({ title: '', content: '' });
        const [editingId, setEditingId] = useState(null);
        const [username, setUsername] = useState(''); 
        const [chatMessage, setChatMessage] = useState(''); 
        const [chatMessages, setChatMessages] = useState([]); 

        // Подключение к Socket.io
        const socketRef = useRef();

        // ❗️ ВЫЗЫВАЕМ ХУК useChatSocket ПРЯМО ЗДЕСЬ, а не в useEffect
        // Передаем в него socketRef.current, чтобы он мог им пользоваться
        useChatSocket(socketRef.current, username, chatMessage, setChatMessages);

        useEffect(() => {
            // Инициализируем соединение только один раз
            if (!socketRef.current) {
                socketRef.current = io(SOCKET_SERVER_URL);
            }
            
            // Обработчики для чата
            const socket = socketRef.current;

            // При получении истории чата
            socket.on('chat:history', (history) => {
                setChatMessages(history);
            });

            // При получении нового сообщения
            socket.on('chat:message', (message) => {
                setChatMessages((prevMessages) => [...prevMessages, message]);
            });

            // Очистка при размонтировании компонента
            return () => {
                socket.disconnect();
            };
        }, []); // ❗️ ВАЖНО: Добавляем пустой массив зависимостей, чтобы useEffect вызвался один раз


        // --- Функции для постов (твой существующий код) ---
        const fetchPosts = async () => {
            try {
                const { data } = await api.get('/posts');
                setPosts(data);
            } catch (err) {
                console.error("Ошибка загрузки постов:", err);
            }
        };

        useEffect(() => {
            fetchPosts();
        }, []); // ❗️ ВАЖНО: Добавляем пустой массив зависимостей здесь тоже
                const createPost = async () => {
            try {
                await api.post('/posts', newPost);
                setNewPost({ title: '', content: '' });
                fetchPosts();
            } catch (err) {
                alert("Нужно войти в систему для создания поста!");
            }
        };

        const handleDelete = async (id) => {
            if (window.confirm("Реально удалить?")) {
                try {
                    await api.delete(`/posts/${id}`); 
                    fetchPosts();
                } catch (err) {
                    alert("Ошибка при удалении. Возможно, это не ваш пост.");
                }
            }
        };

        const startEdit = (post) => {
            setEditingId(post.id);
            setNewPost({ title: post.title, content: post.content });
            window.scrollTo(0, 0); 
        };

        const saveEdit = async () => {
            try {
                await api.put(`/posts/${editingId}`, newPost);
                setEditingId(null);
                setNewPost({ title: '', content: '' });
                fetchPosts();
            } catch (err) {
                alert("Ошибка при сохранении поста.");
            }
        };

        // --- Функции для чата ---
        const handleJoinChat = () => {
            if (!username.trim()) {
                alert("Пожалуйста, введите ваше имя для чата.");
                return;
            }
            socketRef.current.emit('chat:join', { room: 'main', nickname: username }, (ack) => {
                if (ack.ok) {
                    console.log('Успешно вошли в чат!');
                } else {
                    alert(`Ошибка входа в чат: ${ack.error}`);
                }
            });
        };

        const handleSendMessage = () => {
            if (chatMessage.trim() && socketRef.current) {
                socketRef.current.emit('chat:message', { room: 'main', text: chatMessage }, (ack) => {
                    if (ack.ok) {
                        setChatMessage(''); // Очищаем поле после отправки
                    } else {
                        alert(`Ошибка отправки: ${ack.error}`);
                    }
                });
            }
        };

        // --- Рендер ---
        return (
            <div style={{ display: 'flex', maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', gap: '30px' }}>
                
                {/* Левая колонка: Форма и лента постов */}
                <div style={{ flex: '1' }}>
                    <h1 style={{ textAlign: 'center', color: '#1877f2', fontSize: '3rem', marginBottom: '30px' }}>Stich Social</h1>
                    
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                        <h3>{editingId ? '📝 Редактировать пост' : '✍️ Создать пост'}</h3>
                        <input 
                            placeholder="Заголовок" 
                            value={newPost.title} 
                            onChange={e => setNewPost({...newPost, title: e.target.value})} 
                            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                        <textarea 
                            placeholder="Что у вас нового?" 
                            value={newPost.content} 
                            onChange={e => setNewPost({...newPost, content: e.target.value})} 
                            style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '100px', boxSizing: 'border-box' }}
                        />
                        <button 
                            onClick={editingId ? saveEdit : createPost}
                            style={{ width: '100%', padding: '12px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {editingId ? 'Сохранить изменения' : 'Опубликовать'}
                        </button>
                         {editingId && (
                            <button onClick={() => { setEditingId(null); setNewPost({title: '', content: ''}); }} style={{ marginTop: '10px', width: '100%', padding: '10px', cursor: 'pointer' }}>
                                Отмена
                            </button>
                        )}
                    </div>

                    <h2 style={{ color: '#444' }}>Лента новостей</h2>
                    <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />

                    {posts.map(post => (
                        <div key={post.id} style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
                            <p style={{ color: '#333', lineHeight: '1.5' }}>{post.content}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                <small style={{ color: '#888' }}>
                                    👤 <strong>{post.author?.username || 'Аноним'}</strong> • {new Date(post.createdAt).toLocaleString()}
                                </small>
                                <div>
                                    <button onClick={() => startEdit(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>📝</button>
                                    <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '10px' }}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Правая колонка: Чат */}
                <div style={{ width: '350px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Чат с поддержкой</h3>
                    
                    {/* Ввод имени пользователя */}
                    {!username ? (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <input 
                                type="text" 
                                placeholder="Ваше имя" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ flexGrow: 1, padding: '10px', marginRight: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                            />
                            <button onClick={handleJoinChat} style={{ padding: '10px 15px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Войти
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Окно чата */}
                            <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px', marginBottom: '15px', borderRadius: '5px', background: '#f9f9f9' }}>
                                {chatMessages.map((msg, index) => (
                                    <div key={index} style={{ marginBottom: '10px' }}>
                                        <small style={{ color: msg.isSystem ? '#888' : '#1877f2', fontWeight: 'bold' }}>
                                            {msg.nickname || 'Система'}:
                                        </small>
                                        <span style={{ marginLeft: '5px' }}>{msg.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Поле ввода сообщения */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    placeholder="Сообщение..." 
                                    value={chatMessage} 
                                    onChange={(e) => setChatMessage(e.target.value)}
                                   onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                    style={{ flexGrow: 1, padding: '10px', marginRight: '5px', borderRadius: '5px', border: '1px solid #ddd' }}
                                />
                                <button onClick={handleSendMessage} style={{ padding: '10px 15px', background: '#1877f2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                    Отправить
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    export default App;
