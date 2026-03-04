import React, { useState, useEffect } from 'react';
import api from '../api'; 
import Auth from './Auth'; 

function App() {
    const [isAuth, setIsAuth] = useState(!!localStorage.getItem('token'));
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });

 
    const fetchPosts = async () => {
        try {
            const { data } = await api.get('/posts');
            setPosts(data);
        } catch (err) { console.error("Ошибка загрузки", err); }
    };

    useEffect(() => { fetchPosts(); }, []);

    const createPost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/posts', newPost);
            setNewPost({ title: '', content: '' });
            fetchPosts(); 
        } catch (err) { alert("Нужно войти в систему!"); }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Stich Social App</h1>

            {!isAuth ? (
                <Auth onLogin={() => setIsAuth(true)} />
            ) : (
                <div style={{ background: '#f9f9f9', padding: '15px' }}>
                    <h3>Создать новый пост</h3>
                    <form onSubmit={createPost}>
                        <input placeholder="Заголовок" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required /><br/>
                        <textarea placeholder="Что у вас нового?" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} required /><br/>
                        <button type="submit">Опубликовать</button>
                    </form>
                    <button onClick={() => { localStorage.removeItem('token'); setIsAuth(false); }}>Выйти</button>
                </div>
            )}

            <hr />
            <h2>Лента</h2>
            {posts.map(post => (
                <div key={post.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <small>Автор: <b>{post.author?.username}</b></small>
                </div>
            ))}
        </div>
    );
}

export default App;