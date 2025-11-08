
import { createContext } from 'react';
import type { BlogPost } from '../types';
import type { NewBlogPost } from '../services/firebaseService';

interface PostsContextType {
  posts: BlogPost[];
  loading: boolean;
  addPost: (newPost: NewBlogPost) => Promise<string>;
  refetchPosts: () => Promise<void>;
}

export const PostsContext = createContext<PostsContextType | undefined>(undefined);
