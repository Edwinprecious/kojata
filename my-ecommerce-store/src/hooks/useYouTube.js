import { useState, useEffect, useCallback } from 'react';
import { getLiveStatus, getBroadcastComments, postComment } from '../services/youtubeApi';

export const useYouTube = () => {
  const [liveData, setLiveData] = useState({
    isLive: false,
    videoId: null,
    title: 'No active stream',
    description: '',
    broadcastId: null,
    viewerCount: 0,
    event: null,
  });
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const checkStatus = useCallback(async () => {
    const data = await getLiveStatus();
    setLiveData(data);
    // Auto-load comments when a live broadcast is detected
    if (data.broadcastId) {
      fetchComments(data.broadcastId);
    }
  }, []);

  const fetchComments = useCallback(async (broadcastId) => {
    if (!broadcastId) return;
    setLoadingComments(true);
    try {
      const data = await getBroadcastComments(broadcastId);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const submitComment = useCallback(async ({ message, display_name }) => {
    if (!liveData.broadcastId || !message.trim()) return;
    setPostingComment(true);
    try {
      const payload = { message: message.trim() };
      // Only include display_name for guest users — authenticated users have it set server-side
      if (display_name) payload.display_name = display_name;
      const newComment = await postComment(liveData.broadcastId, payload);
      // Optimistically prepend
      setComments((prev) => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      console.error('Failed to post comment', err);
      throw err;
    } finally {
      setPostingComment(false);
    }
  }, [liveData.broadcastId]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Refresh comments every 30 seconds while live
  useEffect(() => {
    if (!liveData.broadcastId) return;
    const commentInterval = setInterval(() => {
      fetchComments(liveData.broadcastId);
    }, 30000);
    return () => clearInterval(commentInterval);
  }, [liveData.broadcastId, fetchComments]);

  return {
    ...liveData,
    comments,
    loadingComments,
    postingComment,
    submitComment,
    refreshComments: () => fetchComments(liveData.broadcastId),
  };
};