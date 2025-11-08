
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import CreatePostPage from './pages/CreatePostPage';
import Header from './components/Header';
import Footer from './components/Footer';
import type { BlogPost } from './types';
import { PostsContext } from './contexts/PostsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import * as firebaseService from './services/firebaseService';
import { isFirebaseConfigured } from './firebaseConfig';
import Alert from './components/Alert';

function App() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetchPosts = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await firebaseService.getPosts();
      setPosts(fetchedPosts);
    } catch (e) {
      console.error("Failed to fetch posts:", e);
      setError("Could not load posts from the database. Please check your connection and Firebase configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured()) {
        refetchPosts();
    } else {
        setLoading(false);
    }
  }, [refetchPosts]);

  const addPost = async (newPostData: firebaseService.NewBlogPost) => {
    const newPostId = await firebaseService.addPost(newPostData);
    await refetchPosts(); // Refetch to get the latest list
    return newPostId;
  };

  const postsContextValue = useMemo(() => ({
    posts,
    loading,
    addPost,
    refetchPosts,
  }), [posts, loading, refetchPosts]);

  return (
    <ThemeProvider>
      <PostsContext.Provider value={postsContextValue}>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {!isFirebaseConfigured() ? (
                <div className="max-w-2xl mx-auto">
                    <Alert type="error" message="Firebase is not configured. Please add your configuration details in firebaseConfig.ts to enable data storage." />
                </div>
              ) : error ? (
                 <div className="max-w-2xl mx-auto">
                    <Alert type="error" message={error} />
                 </div>
              ) : (
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/post/:postId" element={<PostPage />} />
                  <Route path="/create" element={<CreatePostPage />} />
                </Routes>
              )}
            </main>
            <Footer />
          </div>
        </HashRouter>
      </PostsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
