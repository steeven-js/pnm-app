export type ChatConversation = {
    id: number;
    title: string | null;
    updated_at: string;
};

export type ChatMessage = {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
};

export type ChatConversationWithMessages = ChatConversation & {
    messages: ChatMessage[];
};
