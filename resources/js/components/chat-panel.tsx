import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

import type { ChatConversation, ChatMessage } from 'src/types/chat';

import { useChatStream } from 'src/hooks/use-chat-stream';

// ----------------------------------------------------------------------

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showList, setShowList] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { streamedText, streamState, conversationId, startStream, setConversationId } =
    useChatStream();

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  // Load conversations when opening
  useEffect(() => {
    if (open) {
      fetchConversations();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // When streaming finishes, add the assistant message
  useEffect(() => {
    if (streamState === 'done' && streamedText) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: streamedText,
          created_at: new Date().toISOString(),
        },
      ]);
      fetchConversations();
    }
  }, [streamState]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
        credentials: 'same-origin',
      });
      if (res.ok) {
        setConversations(await res.json());
      }
    } catch {
      // silently fail
    }
  }, []);

  const loadConversation = useCallback(
    async (conv: ChatConversation) => {
      try {
        const res = await fetch(`/api/chat/conversations/${conv.id}`, {
          headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
          credentials: 'same-origin',
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setConversationId(data.id);
          setCurrentTitle(data.title);
          setShowList(false);
        }
      } catch {
        // silently fail
      }
    },
    [setConversationId]
  );

  const deleteConversation = useCallback(
    async (id: number) => {
      try {
        await fetch(`/api/chat/conversations/${id}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
          credentials: 'same-origin',
        });
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (conversationId === id) {
          startNewConversation();
        }
      } catch {
        // silently fail
      }
    },
    [conversationId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setCurrentTitle(null);
    setShowList(false);
  }, [setConversationId]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || streamState === 'streaming') return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: trimmed,
        created_at: new Date().toISOString(),
      },
    ]);

    if (!currentTitle) {
      setCurrentTitle(trimmed.length > 80 ? `${trimmed.slice(0, 80)}...` : trimmed);
    }

    setInput('');
    startStream(trimmed, conversationId);
  }, [input, streamState, conversationId, currentTitle, startStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Iconify icon="solar:chat-round-dots-bold-duotone" width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {showList ? 'Conversations' : (currentTitle ?? 'Nouvelle conversation')}
        </Typography>
        {!showList && (
          <Tooltip title="Historique">
            <IconButton size="small" onClick={() => setShowList(true)}>
              <Iconify icon="solar:clock-circle-bold" width={18} />
            </IconButton>
          </Tooltip>
        )}
        {showList && (
          <Button size="small" onClick={startNewConversation}>
            Nouvelle
          </Button>
        )}
        <IconButton size="small" onClick={onClose}>
          <Iconify icon="solar:close-circle-bold" width={18} />
        </IconButton>
      </Box>

      {/* Body */}
      {showList ? (
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {conversations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
              Aucune conversation
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {conversations.map((conv) => (
                <Box
                  key={conv.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    component="button"
                    onClick={() => loadConversation(conv)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      p: 0,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {conv.title ?? 'Sans titre'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => deleteConversation(conv.id)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                  >
                    <Iconify icon="solar:trash-bin-minimalistic-bold" width={16} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box ref={scrollRef} sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && streamState !== 'streaming' && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 2,
              }}
            >
              <Iconify
                icon="solar:chat-round-dots-bold-duotone"
                width={48}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Posez vos questions sur les processus PNM,
                <br />
                l&apos;architecture réseau, ou les outils.
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}

            {/* Streaming bubble */}
            {streamState === 'streaming' && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.lighter' }}>
                  <Iconify icon="solar:chat-round-dots-bold" width={16} sx={{ color: 'primary.main' }} />
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '85%',
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    borderTopLeftRadius: 4,
                    px: 2,
                    py: 1.5,
                  }}
                >
                  {streamedText ? (
                    <Box
                      sx={{
                        '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
                        '& ul, & ol': { pl: 2, my: 0.5 },
                        '& code': { fontSize: '0.85em', bgcolor: 'action.selected', px: 0.5, borderRadius: 0.5 },
                        '& pre': { bgcolor: 'action.selected', p: 1.5, borderRadius: 1, overflow: 'auto', my: 1 },
                        '& pre code': { bgcolor: 'transparent', p: 0 },
                        fontSize: '0.875rem',
                      }}
                    >
                      <Markdown remarkPlugins={[remarkGfm]}>{streamedText}</Markdown>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={14} />
                      <Typography variant="body2" color="text.secondary">
                        Réflexion...
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {streamState === 'error' && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                Une erreur est survenue. Veuillez réessayer.
              </Alert>
            )}
          </Box>
        </Box>
      )}

      {/* Footer input */}
      {!showList && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              disabled={streamState === 'streaming'}
              size="small"
              fullWidth
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || streamState === 'streaming'}
              color="primary"
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
            >
              {streamState === 'streaming' ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="solar:plain-bold" width={18} />
              )}
            </IconButton>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

// ----------------------------------------------------------------------

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Box
          sx={{
            maxWidth: '85%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 2,
            borderTopRightRadius: 4,
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Typography>
        </Box>
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'grey.300' }}>
          <Iconify icon="solar:user-bold" width={16} sx={{ color: 'grey.700' }} />
        </Avatar>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.lighter' }}>
        <Iconify icon="solar:chat-round-dots-bold" width={16} sx={{ color: 'primary.main' }} />
      </Avatar>
      <Box
        sx={{
          maxWidth: '85%',
          bgcolor: 'action.hover',
          borderRadius: 2,
          borderTopLeftRadius: 4,
          px: 2,
          py: 1.5,
        }}
      >
        <Box
          sx={{
            '& p': { m: 0, mb: 1, '&:last-child': { mb: 0 } },
            '& ul, & ol': { pl: 2, my: 0.5 },
            '& code': { fontSize: '0.85em', bgcolor: 'action.selected', px: 0.5, borderRadius: 0.5 },
            '& pre': { bgcolor: 'action.selected', p: 1.5, borderRadius: 1, overflow: 'auto', my: 1 },
            '& pre code': { bgcolor: 'transparent', p: 0 },
            fontSize: '0.875rem',
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        </Box>
      </Box>
    </Box>
  );
}
