
import { createContext } from 'react';
import type { BlogPost } from '../types';

interface PostsContextType {
  posts: BlogPost[];
  addPost: (newPost: BlogPost) => void;
}

export const PostsContext = createContext<PostsContextType | undefined>(undefined);
