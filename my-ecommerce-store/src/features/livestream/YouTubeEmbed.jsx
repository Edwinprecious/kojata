import { memo, useRef, useEffect } from 'react';

const YouTubeEmbed = memo(({ videoId }) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoId) return;

    // If player already exists for this videoId, do nothing
    if (playerRef.current) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => e.target.playVideo(),
        },
      });
    };

    // Load YouTube IFrame API if not already loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Only destroy if videoId changes, not on every re-render
    };
  }, [videoId]); // only runs when videoId changes

  if (!videoId) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No video selected
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
}, (prev, next) => prev.videoId === next.videoId); // only re-render if videoId changes

export default YouTubeEmbed;