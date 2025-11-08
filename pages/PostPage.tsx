import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostsContext } from '../contexts/PostsContext';

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const postsContext = useContext(PostsContext);

  if (!postsContext) {
    return <div>Loading...</div>;
  }

  const post = postsContext.posts.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }
  
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <img className="h-96 w-full object-cover" src={post.imageUrl} alt={post.title} />
      <div className="p-6 sm:p-8 md:p-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-lg text-gray-700 dark:text-gray-300 leading-relaxed space-y-6 whitespace-pre-wrap">
          {post.content}
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
            <Link to="/" className="text-primary-600 hover:text-primary-800 dark:hover:text-primary-400 font-semibold transition-colors">
                &larr; Back to all posts
            </Link>
        </div>
      </div>
    </article>
  );
};

export default PostPage;