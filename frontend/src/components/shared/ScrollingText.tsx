import React, { useEffect, useRef } from 'react';

interface ScrollingTextProps {
  text: string;
  speed?: number;
}

const ScrollingText: React.FC<ScrollingTextProps> = ({ text, speed = 120 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const totalWidth = element.scrollWidth;
    const duration = totalWidth / speed;
    
    element.style.animationDuration = `${duration}s`;
  }, [text, speed]);

  // Repeat text multiple times to ensure seamless loop
  const repeatedText = `${text} • `.repeat(20);

  return (
    <div className="scrolling-text-container">
      <div ref={scrollRef} className="scrolling-text">
        {repeatedText}
      </div>
    </div>
  );
};

export default ScrollingText;

