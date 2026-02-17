import { useCallback, useRef, useState } from 'react';

export type StreamState = 'idle' | 'streaming' | 'done' | 'error';

type StreamEvent = {
  event: 'delta' | 'done' | 'error';
  data: { text?: string; conversation_id?: number; message?: string };
};

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export function useChatStream() {
  const [streamedText, setStreamedText] = useState('');
  const [streamState, setStreamState] = useState<StreamState>('idle');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreamState('idle');
  }, []);

  const startStream = useCallback(
    async (message: string, existingConversationId?: number | null) => {
      // Abort any in-flight stream
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setStreamedText('');
      setStreamState('streaming');

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            'X-XSRF-TOKEN': getCsrfToken(),
          },
          credentials: 'same-origin',
          signal: controller.signal,
          body: JSON.stringify({
            message,
            conversation_id: existingConversationId ?? undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const dataLine = part.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;

            try {
              const event: StreamEvent = JSON.parse(dataLine.slice(6));

              if (event.event === 'delta' && event.data.text) {
                accumulated += event.data.text;
                setStreamedText(accumulated);
              } else if (event.event === 'done') {
                if (event.data.conversation_id) {
                  setConversationId(event.data.conversation_id);
                }
                setStreamState('done');
                return;
              } else if (event.event === 'error') {
                setStreamState('error');
                return;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        setStreamState('done');
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setStreamState('idle');
        } else {
          setStreamState('error');
        }
      }
    },
    []
  );

  return {
    streamedText,
    streamState,
    conversationId,
    startStream,
    abort,
    setConversationId,
  };
}
