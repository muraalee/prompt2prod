import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface LoadingMessageProps {
  type: 'title' | 'content' | 'image' | 'saving';
  size?: 'sm' | 'md' | 'lg';
}

const LOADING_MESSAGES = {
  title: [
    "🤔 Gemini is brainstorming the perfect title...",
    "✨ Sprinkling some creative magic on your title...",
    "🎯 Finding that click-worthy headline...",
    "💭 Hmm... trying to be clever here...",
    "🎨 Crafting headline gold...",
    "🚀 Title generator going brrrr...",
    "🤖 Beep boop... calculating title awesomeness...",
    "💡 Genius title incoming in 3... 2...",
    "🎪 Consulting the circus of words...",
    "🧙‍♂️ Gemini put on its thinking cap...",
    "🎲 Rolling the creativity dice...",
    "📰 Extra! Extra! Great title almost ready!",
  ],
  content: [
    "✍️ Gemini is channeling its inner Shakespeare...",
    "📝 Writing a masterpiece... this might take a sec...",
    "🎭 Crafting words of pure wisdom...",
    "🌟 Making your blog post absolutely legendary...",
    "🔮 Summoning the content gods...",
    "📚 Reading all of Wikipedia... jk, almost done!",
    "🎪 Words are flowing like a majestic river...",
    "🦄 Unicorns are proofreading this as we speak...",
    "☕ Gemini grabbed a coffee, back in a moment...",
    "🧠 Big brain time... processing...",
    "🎨 Painting with words...",
    "🌈 Adding sparkle to every sentence...",
    "📖 Once upon a time... ah wait, wrong genre...",
    "🎯 Aiming for Pulitzer-worthy content...",
    "🚂 The content train is pulling into the station...",
  ],
  image: [
    "🎨 Gemini is painting your masterpiece...",
    "🖼️ Generating pixels of pure beauty...",
    "✨ Creating visual magic...",
    "🌈 Adding more colors than a rainbow...",
    "🎭 Your image is being born... it's almost here!",
    "🔮 Conjuring up some eye candy...",
    "🦄 Unicorns are drawing this by hoof...",
    "🎪 The pixel circus is in town!",
    "🖌️ Bob Ross would be proud...",
    "🌟 Making pixels do the tango...",
    "🎨 Mixing digital paint on the canvas...",
    "🖼️ Frame-worthy art incoming...",
  ],
  saving: [
    "💾 Saving to the cloud...",
    "🚀 Launching your post into cyberspace...",
    "📡 Beaming your masterpiece to Firebase...",
    "✨ Making it permanent...",
    "🎯 Locking in the awesome...",
    "💫 Sealing the deal...",
  ],
};

const LoadingMessage: React.FC<LoadingMessageProps> = ({ type, size = 'sm' }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = LOADING_MESSAGES[type];

  useEffect(() => {
    // Rotate messages every 5 seconds (increased for readability)
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex items-center gap-2 justify-center">
      <Spinner size={size} />
      <span className="text-sm font-medium animate-pulse whitespace-nowrap">
        {messages[messageIndex]}
      </span>
    </div>
  );
};

export default LoadingMessage;
