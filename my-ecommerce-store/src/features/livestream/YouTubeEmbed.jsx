import React from 'react';

export default function YouTubeEmbed({ videoId }) {
  return (
    <div className="youtube-embed">
      {videoId ? (
        <iframe
          title="youtube"
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allowFullScreen
        />
      ) : (
        <div className="text-gray-500">No video selected</div>
      )}
    </div>
  );
}
