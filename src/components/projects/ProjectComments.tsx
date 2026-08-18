import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/supabase/projectService';
import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, User, Sparkles, Clock } from 'lucide-react';
import { Button } from '../common/Button';

interface ProjectCommentsProps {
  projectId: string;
  assignedAgentName?: string;
}

export const ProjectComments: React.FC<ProjectCommentsProps> = ({
  projectId,
  assignedAgentName = 'Documentation Agent',
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    projectService.getComments(projectId).then((data) => setComments(data));
  }, [projectId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSubmitting(true);
    const userMessageText = newMessage;
    setNewMessage('');

    // Add user comment
    const userComment = await projectService.addComment({
      project_id: projectId,
      user_id: user.id,
      user_name: user.full_name,
      user_role: user.role,
      message: userMessageText,
    });

    setComments((prev) => [...prev, userComment]);
    setIsSubmitting(false);

    // Simulate AI Agent automated response after 1.5 seconds!
    setTimeout(async () => {
      const aiReply = await projectService.addComment({
        project_id: projectId,
        user_id: assignedAgentName.toLowerCase().replace(/\s+/g, '-'),
        user_name: assignedAgentName,
        user_role: 'ai_agent',
        message: `Received note: "${userMessageText.substring(0, 40)}...". I have updated the project requirements log and am continuing execution.`,
        is_ai_generated: true,
      });

      setComments((prev) => [...prev, aiReply]);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h4 className="text-sm font-bold text-slate-900">Project Workspace Discussion</h4>
        </div>
        <span className="text-[11px] text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Direct line with {assignedAgentName}
        </span>
      </div>

      {/* Comment Feed */}
      <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No discussion messages yet. Leave a note for your assigned AI Agent below.
          </p>
        ) : (
          comments.map((cmt) => {
            const isAI = cmt.is_ai_generated || cmt.user_role === 'ai_agent';

            return (
              <div
                key={cmt.id}
                className={`p-3.5 rounded-2xl text-xs max-w-[88%] ${
                  isAI
                    ? 'bg-blue-50/70 border border-blue-100 text-slate-800 mr-auto'
                    : 'bg-slate-900 text-white ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    {isAI ? (
                      <>
                        <Bot className="w-3.5 h-3.5 text-blue-600 inline" />
                        <span className="text-blue-900">{cmt.user_name}</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-300 inline" />
                        <span>{cmt.user_name}</span>
                      </>
                    )}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isAI ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {new Date(cmt.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{cmt.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendComment} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Leave a comment or instruction for ${assignedAgentName}...`}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isSubmitting}
          icon={<Send className="w-3.5 h-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
