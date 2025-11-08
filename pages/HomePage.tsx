import React, { useContext, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { PostsContext } from '../contexts/PostsContext';
import BlogPostCard from '../components/BlogPostCard';

const HomePage: React.FC = () => {
  const postsContext = useContext(PostsContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');

  if (!postsContext) {
    return <div>Loading...</div>; // or some error state
  }

  const { posts } = postsContext;

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return posts;
    return posts.filter(post => post.tags?.includes(selectedTag));
  }, [posts, selectedTag]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Latest Posts</h1>

      {allTags.length > 0 && (
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Filter by Tag</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {allTags.map(tag => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900'
                }`}
              >
                #{tag}
              </Link>
            ))}
            {selectedTag && (
              <Link
                to="/"
                className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                &times; Clear Filter
              </Link>
            )}
          </div>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            {selectedTag ? `No posts tagged with "${selectedTag}" yet!` : "No posts yet!"}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {selectedTag ? "Try clearing the filter or creating a new post." : "Be the first to create a post."}
          </p>
          <button
            onClick={() => navigate('/create')}
            className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
          >
            Create New Post
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;