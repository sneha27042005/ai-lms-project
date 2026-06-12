import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDiscussions, createDiscussion, getDiscussionComments, createComment } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDiscussions() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await getDiscussions(courseId);
        setDiscussions(response.data);
      } catch (err) {
        console.error('Failed to load discussions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [courseId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedDiscussion) {
        try {
          const response = await getDiscussionComments(selectedDiscussion.id);
          setComments(response.data.comments || []);
        } catch (err) {
          console.error('Failed to load comments:', err);
        }
      }
    };

    fetchComments();
  }, [selectedDiscussion]);

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;

    setSubmittingDiscussion(true);
    try {
      const response = await createDiscussion(courseId, {
        title: newDiscussionTitle,
        content: newDiscussionContent,
      });
      setDiscussions([response.data, ...discussions]);
      setNewDiscussionTitle('');
      setNewDiscussionContent('');
      setShowNewDiscussion(false);
    } catch (err) {
      console.error('Failed to create discussion:', err);
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedDiscussion) return;

    setSubmittingComment(true);
    try {
      const response = await createComment(selectedDiscussion.id, {
        content: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading discussions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">💬 Course Discussion</h1>
            <p className="text-slate-300">Share ideas and ask questions with your classmates</p>
          </div>
          <button
            onClick={() => setShowNewDiscussion(!showNewDiscussion)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            {showNewDiscussion ? '✕ Cancel' : '+ New Discussion'}
          </button>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && (
          <form onSubmit={handleCreateDiscussion} className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 mb-8">
            <input
              type="text"
              placeholder="Discussion title..."
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              className="w-full mb-4 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              rows="4"
              className="w-full mb-4 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            ></textarea>
            <button
              type="submit"
              disabled={submittingDiscussion}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              {submittingDiscussion ? 'Posting...' : 'Post Discussion'}
            </button>
          </form>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discussions List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden">
              <h2 className="px-6 py-4 border-b border-slate-600 font-bold text-white text-lg">Discussions</h2>
              <div className="max-h-96 overflow-y-auto">
                {discussions.length === 0 ? (
                  <div className="p-6 text-slate-400 text-center">No discussions yet</div>
                ) : (
                  discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      onClick={() => setSelectedDiscussion(discussion)}
                      className={`p-4 border-b border-slate-600 cursor-pointer transition ${
                        selectedDiscussion?.id === discussion.id
                          ? 'bg-blue-600/20 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-600/30'
                      }`}
                    >
                      {discussion.is_pinned && <span className="text-yellow-400 text-sm">📌 </span>}
                      <div className="font-semibold text-white truncate">{discussion.title}</div>
                      <div className="text-xs text-slate-400 mt-1">{discussion.author_name}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Discussion Detail and Comments */}
          <div className="lg:col-span-2">
            {selectedDiscussion ? (
              <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                {/* Discussion Content */}
                <div className="mb-6 pb-6 border-b border-slate-600">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedDiscussion.title}</h2>
                      <div className="text-slate-400 text-sm mt-2">
                        By <span className="font-semibold">{selectedDiscussion.author_name}</span> • {new Date(selectedDiscussion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-200">{selectedDiscussion.content}</p>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">{comments.length} Comments</h3>
                  
                  {/* Comments List */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {comments.length === 0 ? (
                      <div className="text-slate-400 text-center">No comments yet. Be the first!</div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-800/50 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-white">{comment.author_name}</span>
                            <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-200">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  {user && (
                    <form onSubmit={handleCreateComment} className="space-y-3">
                      <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      ></textarea>
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
                      >
                        {submittingComment ? 'Posting...' : 'Post Comment'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-12 text-center">
                <div className="text-slate-400">Select a discussion to view comments</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
