import React, { useState, useEffect } from 'react';
import api from '../api';

const App = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [editingId, setEditingId] = useState(null);
    const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));

    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/posts');
            setPosts(data);
        } catch (err) {
            console.error("Ошибка загрузки:", err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const createPost = async () => {
        try {
            await api.post('/posts', newPost);
            setNewPost({ title: '', content: '' });
            fetchPosts();
        } catch (err) {
            alert("Нужно войти в систему!");
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
        window.scrollTo(0, 0); // Прокрутка к форме наверх
    };

    const saveEdit = async () => {
        try {
            await api.put(`/posts/${editingId}`, newPost);
            setEditingId(null);
            setNewPost({ title: '', content: '' });
            fetchPosts();
        } catch (err) {
            alert("Ошибка при сохранении");
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center' }}>Stich Social App</h1>

            {/* ФОРМА (Всегда сверху для удобства) */}
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>{editingId ? 'Редактировать пост' : 'Создать новый пост'}</h3>
                <input 
                    placeholder="Заголовок" 
                    value={newPost.title} 
                    onChange={e => setNewPost({...newPost, title: e.target.value})}
                                        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                /><br/>
                <textarea 
                    placeholder="Что у вас нового?" 
                    value={newPost.content} 
                    onChange={e => setNewPost({...newPost, content: e.target.value})} 
                    style={{ width: '100%', marginBottom: '10px', padding: '8px', minHeight: '80px' }}
                /><br/>
                
                {editingId ? (
                    <button onClick={saveEdit} style={{ background: 'orange', color: 'white', padding: '10px' }}>
                        💾 Сохранить изменения
                    </button>
                ) : (
                    <button onClick={createPost} style={{ background: '#1877f2', color: 'white', padding: '10px' }}>
                        ➕ Опубликовать
                    </button>
                )}
                
                {editingId && (
                    <button onClick={() => { setEditingId(null); setNewPost({title: '', content: ''}); }} style={{ marginLeft: '10px' }}>
                        Отмена
                    </button>
                )}
            </div>

            <hr />

            {/* ЛЕНТА ПОСТОВ */}
            <h2>Лента</h2>
            {posts.map(post => (
                <div key={post.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '15px', 
                    marginBottom: '15px', 
                    borderRadius: '8px',
                    backgroundColor: '#fff'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
                    <p style={{ color: '#333' }}>{post.content}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                        <small style={{ color: '#888' }}>
                            Автор: <strong>{post.author?.username || 'Аноним'}</strong> • {new Date(post.createdAt).toLocaleString()}
                        </small>
                        
                        <div>
                            <button onClick={() => startEdit(post)} style={{ marginRight: '10px' }}>📝</button>
                            <button onClick={() => handleDelete(post.id)} style={{ color: 'red' }}>🗑</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default App;