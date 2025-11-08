
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { BlogPost } from './types';
import { PostsContext } from './contexts/PostsContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [posts, setPosts] = useLocalStorage<BlogPost[]>('blog-posts', []);

  const postsContextValue = useMemo(() => ({
    posts,
    addPost: (newPost: BlogPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    }
  }), [posts, setPosts]);

  return (
    <ThemeProvider>
      <PostsContext.Provider value={postsContextValue}>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/post/:postId" element={<PostPage />} />
                <Route path="/create" element={<CreatePostPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </PostsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
