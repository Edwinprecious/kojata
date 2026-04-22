import { useState, useEffect } from 'react';
import { getLiveStatus } from '../services/youtubeApi';

export const useYouTube = () => {
  const [liveData, setLiveData] = useState({ isLive: false, videoId: null });

  const checkStatus = async () => {
    const data = await getLiveStatus();
    setLiveData(data);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  return liveData;
};