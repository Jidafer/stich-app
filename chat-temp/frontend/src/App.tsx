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
        window.scrollTo(0, 0); 
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

            {}
            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>{editingId ? 'Редактировать пост' : 'Создать новый пост'}</h3>
                <input 
                    placeholder="Заголовок" 
                    value={newPost.title} 
                    onChange={e => setNewPost({...newPost, title: e.target.value})}