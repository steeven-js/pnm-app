import Box from '@mui/material/Box';
import { useRef } from 'react';
import { useMermaid } from '@/hooks/use-mermaid';

export function ArticleContent({ content }: { content: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useMermaid(ref, content);

    return (
        <Box
            ref={ref}
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content || '' }}
        />
    );
}
