
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostsContext } from '../contexts/PostsContext';
import * as geminiService from '../services/geminiService';
import Spinner from '../components/Spinner';
import LoadingMessage from '../components/LoadingMessage';
import Alert from '../components/Alert';
import type { NewBlogPost } from '../services/firebaseService';

type LoadingState = 'idle' | 'title' | 'content' | 'image' | 'saving';

const CreatePostPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const postsContext = useContext(PostsContext);
  const navigate = useNavigate();

  const handleGenerateTitle = async () => {
    if (!content) {
      setError('Please write some content first to generate a title.');
      return;
    }
    setLoading('title');
    setError(null);
    try {
      const generatedTitle = await geminiService.generateTitle(content);
      setTitle(generatedTitle);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading('idle');
    }
  };
  
  const handleGenerateContent = async () => {
    if (!title) {
        setError('Please provide a topic in the title field to generate content.');
        return;
    }
    setLoading('content');
    setError(null);
    try {
        const generatedContent = await geminiService.generateContent(title);
        setContent(generatedContent);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading('idle');
    }
  };

  const handleGenerateImage = async () => {
    const prompt = title || content;
    if (!prompt) {
      setError('Please provide a title or content to generate an image.');
      return;
    }
    setLoading('image');
    setError(null);
    try {
      const generatedImageUrl = await geminiService.generateImage(prompt);
      setImageUrl(generatedImageUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading('idle');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postsContext) {
        setError("Posts context is not available.");
        return;
    }
    if (!title || !content || !imageUrl) {
        setError('Title, content, and an image are required to create a post.');
        return;
    }
    setLoading('saving');
    setError(null);
    
    try {
        const postTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        const newPost: NewBlogPost = {
            title,
            content,
            imageUrl,
            tags: postTags,
        };

        const newPostId = await postsContext.addPost(newPost);
        navigate(`/post/${newPostId}`);
    } catch (e: any) {
        console.error("Failed to save post:", e);
        setError("Failed to save post. Please check your connection and try again.");
    } finally {
        setLoading('idle');
    }
  };

  const isLoading = loading !== 'idle';

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Create New Post</h1>
      
      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your awesome post title"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            placeholder="Write your story here... or let AI help you!"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., tech, travel, cooking"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
            <button type="button" onClick={handleGenerateTitle} disabled={isLoading} className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[40px]">
                {loading === 'title' ? <LoadingMessage type="title" size="sm" /> : '✨ Generate Title with AI'}
            </button>
            <button type="button" onClick={handleGenerateContent} disabled={isLoading} className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[40px]">
                {loading === 'content' ? <LoadingMessage type="content" size="sm" /> : '✍️ Generate Content with AI'}
            </button>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Generated preview" className="mx-auto h-48 w-auto rounded-md object-contain" />
                    ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8l-6 6h-6a4 4 0 00-4 4v16a4 4 0 004 4h24a4 4 0 004-4V12a4 4 0 00-4-4h-4.586l-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                    <div className="flex justify-center text-sm">
                        <button type="button" onClick={handleGenerateImage} disabled={isLoading} className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md px-4 py-2 font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 disabled:opacity-75 disabled:cursor-not-allowed">
                            {loading === 'image' ? (
                                <div className="text-gray-700 dark:text-gray-300">
                                    <LoadingMessage type="image" size="sm" />
                                </div>
                            ) : (
                                <span>🖼️ Generate an image with AI</span>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Provide a title or content first</p>
                </div>
            </div>
        </div>
        
        <div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed min-h-[48px]">
             {loading === 'saving' ? <LoadingMessage type="saving" size="sm" /> : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
