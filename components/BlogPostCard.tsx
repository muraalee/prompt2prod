import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const excerpt = post.content.substring(0, 150) + '...';
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/post/${post.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
        <img className="h-56 w-full object-cover" src={post.imageUrl} alt={post.title} />
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {post.title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 flex-grow">{excerpt}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full dark:bg-gray-700 dark:text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{formattedDate}</p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;