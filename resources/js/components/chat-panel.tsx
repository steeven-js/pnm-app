import { Bot, Loader2, MessageSquarePlus, Send, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useChatStream } from '@/hooks/use-chat-stream';
import type { ChatConversation, ChatMessage } from '@/types';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function ChatPanel({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [showList, setShowList] = useState(false);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const {
        streamedText,
        streamState,
        conversationId,
        startStream,
        setConversationId,
    } = useChatStream();

    // Scroll to bottom when messages or streaming text change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamedText]);

    // Load conversations when opening the panel
    useEffect(() => {
        if (open) {
            fetchConversations();
        }
    }, [open]);

    // When streaming finishes, add the assistant message to the list
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

    const loadConversation = useCallback(async (conv: ChatConversation) => {
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
    }, [setConversationId]);

    const deleteConversation = useCallback(async (id: number) => {
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
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const startNewConversation = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setCurrentTitle(null);
        setShowList(false);
    }, [setConversationId]);

    const handleSend = useCallback(() => {
        const trimmed = input.trim();
        if (!trimmed || streamState === 'streaming') return;

        // Add user message immediately
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                role: 'user',
                content: trimmed,
                created_at: new Date().toISOString(),
            },
        ]);

        // Auto-title on first message
        if (!currentTitle) {
            setCurrentTitle(trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed);
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
        <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <SheetTitle className="sr-only">Assistant IA PNM</SheetTitle>
                <SheetDescription className="sr-only">
                    Posez vos questions sur la portabilité des numéros mobiles
                </SheetDescription>

                {/* Header */}
                <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Bot className="text-primary size-5 shrink-0" />
                    <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {showList ? 'Conversations' : (currentTitle ?? 'Nouvelle conversation')}
                    </h2>
                    <div className="flex items-center gap-1">
                        {!showList && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowList(true)}
                                title="Historique"
                                className="size-8"
                            >
                                <MessageSquarePlus className="size-4" />
                            </Button>
                        )}
                        {showList && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={startNewConversation}
                            >
                                Nouvelle conversation
                            </Button>
                        )}
                    </div>
                </div>

                {/* Body */}
                {showList ? (
                    /* Conversation list */
                    <div className="flex-1 overflow-y-auto p-4">
                        {conversations.length === 0 ? (
                            <p className="text-muted-foreground text-center text-sm">
                                Aucune conversation
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2"
                                    >
                                        <button
                                            onClick={() => loadConversation(conv)}
                                            className="min-w-0 flex-1 text-left"
                                        >
                                            <p className="truncate text-sm font-medium">
                                                {conv.title ?? 'Sans titre'}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-destructive size-7 shrink-0"
                                            onClick={() => deleteConversation(conv.id)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Chat messages */
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
                        {messages.length === 0 && streamState !== 'streaming' && (
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                                <Bot className="text-muted-foreground size-10" />
                                <p className="text-muted-foreground text-center text-sm">
                                    Posez vos questions sur les processus PNM,
                                    <br />
                                    l'architecture réseau, ou les outils.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <ChatBubble key={msg.id} message={msg} />
                            ))}

                            {/* Streaming bubble */}
                            {streamState === 'streaming' && (
                                <div className="flex gap-3">
                                    <div className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-full">
                                        <Bot className="text-primary size-4" />
                                    </div>
                                    <div className="bg-muted min-w-0 max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3">
                                        {streamedText ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <Markdown remarkPlugins={[remarkGfm]}>
                                                    {streamedText}
                                                </Markdown>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="text-muted-foreground size-4 animate-spin" />
                                                <span className="text-muted-foreground text-sm">
                                                    Réflexion...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {streamState === 'error' && (
                                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-center text-sm">
                                    Une erreur est survenue. Veuillez réessayer.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer input */}
                {!showList && (
                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Posez votre question..."
                                disabled={streamState === 'streaming'}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || streamState === 'streaming'}
                                size="icon"
                            >
                                {streamState === 'streaming' ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Send className="size-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function ChatBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end gap-3">
                <div className="bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
                <div className="bg-secondary flex size-7 shrink-0 items-center justify-center rounded-full">
                    <User className="size-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3">
            <div className="bg-primary/10 flex size-7 shrink-0 items-center justify-center rounded-full">
                <Bot className="text-primary size-4" />
            </div>
            <div className="bg-muted min-w-0 max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                </div>
            </div>
        </div>
    );
}
