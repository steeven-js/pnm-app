<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Supabase\ArticleSection;
use App\Models\Supabase\Document;
use App\Models\Supabase\DocumentSection;
use App\Services\EmbeddingService;
use App\Services\SanitizationService;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class IngestSupabase extends Command
{
    protected $signature = 'chat:ingest-supabase
        {path? : Path to the documents directory (required unless --articles)}
        {--fresh : Delete all existing data before ingesting}
        {--articles : Ingest knowledge base articles instead of documents}';

    protected $description = 'Ingest documents or articles into Supabase as structured documentation with pgvector embeddings';

    private EmbeddingService $embedding;

    private SanitizationService $sanitization;

    private int $sectionsCreated = 0;

    /** Document type detection patterns (filename → type) */
    private const DOCUMENT_TYPES = [
        '/annexe/i' => 'annexe',
        '/specification|spec\b/i' => 'specification',
        '/guide/i' => 'guide',
        '/processus|process/i' => 'processus',
        '/transfert|migration/i' => 'transfert',
        '/pptx$/i' => 'presentation',
    ];

    public function handle(EmbeddingService $embedding, SanitizationService $sanitization): int
    {
        $this->embedding = $embedding;
        $this->sanitization = $sanitization;

        if ($this->option('articles')) {
            return $this->ingestArticles();
        }

        return $this->ingestDocuments();
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DOCUMENT INGESTION
    // ═══════════════════════════════════════════════════════════════════════

    private function ingestDocuments(): int
    {
        $path = $this->argument('path');

        if (! $path || ! is_dir($path)) {
            $this->error('Please provide a valid directory path.');

            return self::FAILURE;
        }

        if ($this->option('fresh')) {
            $deleted = DocumentSection::query()->delete();
            Document::query()->delete();
            $this->info("Deleted existing document data ({$deleted} sections).");
        }

        $files = $this->discoverFiles($path);
        $this->info('Found '.count($files).' files to process.');

        $bar = $this->output->createProgressBar(count($files));
        $bar->start();

        foreach ($files as $file) {
            $this->processFile($file, $path);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Ingestion complete. Created {$this->sectionsCreated} structured sections with embeddings.");

        return self::SUCCESS;
    }

    private function processFile(string $filePath, string $basePath): void
    {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $relativePath = str_replace($basePath.'/', '', $filePath);
        $filename = pathinfo($filePath, PATHINFO_FILENAME);

        try {
            // Convert to Markdown (preserves headings structure)
            $markdown = match ($ext) {
                'docx', 'doc', 'pptx' => $this->convertToMarkdown($filePath),
                'pdf' => $this->convertPdf($filePath),
                'xlsx', 'xls' => $this->convertSpreadsheet($filePath),
                'txt', 'md' => file_get_contents($filePath),
                default => null,
            };

            if (empty($markdown)) {
                $this->warn("  No text extracted from {$relativePath}");

                return;
            }

            // Sanitize sensitive values
            $sanitized = $this->sanitization->sanitize($markdown);

            // Parse into hierarchical sections
            $tree = $this->parseDocumentTree($sanitized);

            if (empty($tree)) {
                return;
            }

            // Detect document type and generate description
            $docType = $this->detectDocumentType($filename);
            $description = $this->generateDescription($tree);

            // Flatten tree for storage (preserving hierarchy metadata)
            $flatSections = $this->flattenTree($tree);

            // Create or update document record
            $document = Document::updateOrCreate(
                ['source_file' => $relativePath],
                [
                    'title' => $this->cleanTitle($filename),
                    'description' => $description,
                    'source_type' => $ext,
                    'document_type' => $docType,
                    'total_sections' => count($flatSections),
                ]
            );

            // Delete old sections for this document
            $document->sections()->delete();

            // Generate embeddings with contextual text
            $embeddingTexts = array_map(function ($s) use ($document) {
                // Prepend structural context so the embedding understands WHERE this section lives
                $context = "[{$document->document_type}] {$document->title}";
                if ($s['section_path']) {
                    $context .= " > {$s['section_path']}";
                }

                return "{$context}\n\n{$s['content']}";
            }, $flatSections);

            $embeddings = $this->embedding->embedBatch($embeddingTexts);

            // Store sections with hierarchy
            $idMap = []; // index → DB id, for parent references

            foreach ($flatSections as $index => $section) {
                $parentId = null;
                if ($section['parent_index'] !== null && isset($idMap[$section['parent_index']])) {
                    $parentId = $idMap[$section['parent_index']];
                }

                $record = DocumentSection::create([
                    'document_id' => $document->id,
                    'section_index' => $index,
                    'level' => $section['level'],
                    'parent_section_id' => $parentId,
                    'section_path' => $section['section_path'],
                    'title' => $section['title'],
                    'content' => $section['content'],
                    'embedding' => $this->vectorToSql($embeddings[$index]),
                    'metadata' => [
                        'word_count' => str_word_count($section['content']),
                        'has_children' => ! empty($section['children_count']),
                    ],
                ]);

                $idMap[$index] = $record->id;
                $this->sectionsCreated++;
            }
        } catch (\Throwable $e) {
            $this->warn("  Failed to process {$relativePath}: {$e->getMessage()}");
        }
    }

    // ─── Document tree parsing ───────────────────────────────────────────

    /**
     * Parse Markdown text into a hierarchical tree of sections.
     *
     * Each node: [level, title, content, children[]]
     *
     * @return array<int, array{level: int, title: string, content: string, children: array}>
     */
    private function parseDocumentTree(string $markdown): array
    {
        $lines = explode("\n", $markdown);
        $root = ['level' => 0, 'title' => '', 'content' => '', 'children' => []];

        // Stack of ancestor nodes (by reference)
        $stack = [&$root];
        $currentContent = '';

        foreach ($lines as $line) {
            // Detect heading: # Title, ## Title, ### Title, etc.
            if (preg_match('/^(#{1,6})\s+(.+)$/', $line, $m)) {
                $level = strlen($m[1]);
                $title = trim($m[2]);

                // Save accumulated content to the current (top of stack) node
                $this->appendContent($stack, $currentContent);
                $currentContent = '';

                $newNode = ['level' => $level, 'title' => $title, 'content' => '', 'children' => []];

                // Pop stack until we find a parent with a lower level
                while (count($stack) > 1 && $stack[count($stack) - 1]['level'] >= $level) {
                    array_pop($stack);
                }

                // Add as child of current top
                $stack[count($stack) - 1]['children'][] = &$newNode;
                $stack[] = &$newNode;
                unset($newNode);
            } else {
                $currentContent .= $line."\n";
            }
        }

        // Save any remaining content
        $this->appendContent($stack, $currentContent);

        return $root['children'];
    }

    private function appendContent(array &$stack, string $content): void
    {
        $content = trim($content);
        if ($content !== '' && ! empty($stack)) {
            $idx = count($stack) - 1;
            $stack[$idx]['content'] .= ($stack[$idx]['content'] !== '' ? "\n\n" : '').$content;
        }
    }

    /**
     * Flatten a hierarchical tree into an ordered list with path metadata.
     *
     * @return array<int, array{level: int, title: string|null, content: string, section_path: string|null, parent_index: int|null, children_count: int}>
     */
    private function flattenTree(array $nodes, string $pathPrefix = '', ?int $parentIndex = null): array
    {
        $flat = [];

        foreach ($nodes as $node) {
            $currentIndex = count($flat) + ($parentIndex !== null ? $parentIndex + 1 : 0);
            // Recalculate after adding — we'll fix indices in a second pass

            $path = $pathPrefix !== '' ? "{$pathPrefix} > {$node['title']}" : $node['title'];

            // Only create a section entry if it has content
            $hasContent = trim($node['content']) !== '';
            $entryIndex = null;

            if ($hasContent) {
                $entryIndex = count($flat);
                $flat[] = [
                    'level' => $node['level'],
                    'title' => $node['title'],
                    'content' => trim($node['content']),
                    'section_path' => $path ?: null,
                    'parent_index' => $parentIndex,
                    'children_count' => count($node['children']),
                ];
            }

            // Recurse into children
            if (! empty($node['children'])) {
                $childParent = $entryIndex ?? $parentIndex;
                $childFlat = $this->flattenTree($node['children'], $path, $childParent);

                // Re-index parent references relative to our flat array
                $offset = count($flat);
                foreach ($childFlat as &$child) {
                    if ($child['parent_index'] !== null && $child['parent_index'] < $offset) {
                        // Parent is already in our flat array, keep as-is
                    } else {
                        // Adjust parent index by offset if it references a child
                        if ($child['parent_index'] !== null) {
                            $child['parent_index'] += $offset;
                        }
                    }
                }
                unset($child);

                array_push($flat, ...$childFlat);
            }
        }

        return $flat;
    }

    // ─── Document metadata helpers ───────────────────────────────────────

    private function detectDocumentType(string $filename): string
    {
        foreach (self::DOCUMENT_TYPES as $pattern => $type) {
            if (preg_match($pattern, $filename)) {
                return $type;
            }
        }

        return 'document';
    }

    private function cleanTitle(string $filename): string
    {
        // Remove common prefixes and clean up
        $title = preg_replace('/^ANNEXE\s+\d+\s*(Ter\s*-?\s*)?/i', '', $filename);
        $title = preg_replace('/[-_]+/', ' ', $title);
        $title = preg_replace('/\s+/', ' ', $title);

        return trim($title) ?: $filename;
    }

    /**
     * Generate a description from the first sections of the document tree.
     */
    private function generateDescription(array $tree): string
    {
        $titles = [];
        foreach (array_slice($tree, 0, 5) as $node) {
            if ($node['title']) {
                $titles[] = $node['title'];
            }
        }

        if (empty($titles)) {
            return '';
        }

        return 'Sections principales : '.implode(', ', $titles);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  ARTICLE INGESTION
    // ═══════════════════════════════════════════════════════════════════════

    private function ingestArticles(): int
    {
        if ($this->option('fresh')) {
            $deleted = ArticleSection::query()->delete();
            $this->info("Deleted {$deleted} existing article sections.");
        }

        $articles = Article::where('is_published', true)
            ->with('domain:id,name')
            ->get();

        $this->info("Processing {$articles->count()} published articles...");

        $bar = $this->output->createProgressBar($articles->count());
        $bar->start();

        foreach ($articles as $article) {
            $this->processArticle($article);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Article ingestion complete. Created {$this->sectionsCreated} sections with embeddings.");

        return self::SUCCESS;
    }

    private function processArticle(Article $article): void
    {
        $domainName = $article->domain?->name ?? 'Général';

        try {
            if (empty(trim(strip_tags($article->content ?? '')))) {
                return;
            }

            // Delete old sections for this article
            ArticleSection::where('article_id', $article->id)->delete();

            // Parse HTML into hierarchical sections
            $sections = $this->parseHtmlSections($article->content, $article->title);

            if (empty($sections)) {
                return;
            }

            // Generate embeddings with rich contextual text
            $embeddingTexts = array_map(function ($s) use ($domainName, $article) {
                $context = "[{$domainName}] {$article->title}";
                if ($s['section_path']) {
                    $context .= " > {$s['section_path']}";
                }

                return "{$context}\n\n{$s['content']}";
            }, $sections);

            $embeddings = $this->embedding->embedBatch($embeddingTexts);

            foreach ($sections as $index => $section) {
                ArticleSection::create([
                    'article_id' => $article->id,
                    'level' => $section['level'],
                    'section_path' => $section['section_path'],
                    'domain_name' => $domainName,
                    'title' => $section['title'],
                    'content' => $section['content'],
                    'embedding' => $this->vectorToSql($embeddings[$index]),
                ]);
                $this->sectionsCreated++;
            }
        } catch (\Throwable $e) {
            $this->warn("  Failed to process article '{$article->title}': {$e->getMessage()}");
        }
    }

    /**
     * Parse HTML article content into structured sections with hierarchy.
     *
     * @return array<int, array{level: int, title: string, content: string, section_path: string|null}>
     */
    private function parseHtmlSections(string $html, string $articleTitle): array
    {
        // Split HTML by heading tags (h2, h3, h4), capturing the tag level and text
        $pattern = '/<h([2-4])[^>]*>(.*?)<\/h[2-4]>/is';
        $parts = preg_split($pattern, $html, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        if ($parts === false || count($parts) <= 1) {
            // No headings — single section for the whole article
            $plain = $this->htmlToPlain($html);

            return empty($plain) ? [] : [[
                'level' => 0,
                'title' => $articleTitle,
                'content' => $plain,
                'section_path' => null,
            ]];
        }

        $sections = [];
        $pathStack = []; // [level => title] for building breadcrumbs
        $currentTitle = $articleTitle;
        $currentLevel = 0;
        $currentContent = '';

        $i = 0;
        while ($i < count($parts)) {
            $part = $parts[$i];

            // Check if this is a heading level number (single digit from our capture group)
            if (preg_match('/^[2-4]$/', $part)) {
                $headingLevel = (int) $part;
                $headingText = isset($parts[$i + 1]) ? trim(strip_tags($parts[$i + 1])) : '';
                $i += 2; // skip level + title

                // Save previous section
                $plain = $this->htmlToPlain($currentContent);
                if ($plain !== '') {
                    $sections[] = [
                        'level' => $currentLevel,
                        'title' => $currentTitle,
                        'content' => $plain,
                        'section_path' => $this->buildSectionPath($pathStack, $currentLevel, $currentTitle),
                    ];
                }

                // Update path stack: remove same-level and deeper entries
                $pathStack = array_filter($pathStack, fn ($l) => $l < $headingLevel, ARRAY_FILTER_USE_KEY);
                $pathStack[$headingLevel] = $headingText;

                $currentLevel = $headingLevel;
                $currentTitle = $headingText;
                $currentContent = '';
            } else {
                $currentContent .= $part;
                $i++;
            }
        }

        // Save last section
        $plain = $this->htmlToPlain($currentContent);
        if ($plain !== '') {
            $sections[] = [
                'level' => $currentLevel,
                'title' => $currentTitle,
                'content' => $plain,
                'section_path' => $this->buildSectionPath($pathStack, $currentLevel, $currentTitle),
            ];
        }

        return $sections;
    }

    private function buildSectionPath(array $pathStack, int $currentLevel, string $currentTitle): ?string
    {
        ksort($pathStack);
        $ancestors = array_filter($pathStack, fn ($l) => $l < $currentLevel, ARRAY_FILTER_USE_KEY);

        if (empty($ancestors)) {
            return $currentTitle;
        }

        return implode(' > ', $ancestors).' > '.$currentTitle;
    }

    private function htmlToPlain(string $html): string
    {
        $text = strip_tags($html);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FILE DISCOVERY & TEXT EXTRACTION
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @return string[]
     */
    private function discoverFiles(string $basePath): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($basePath, \FilesystemIterator::SKIP_DOTS)
        );

        $skipFiles = ['Thumbs.db', '.DS_Store', 'desktop.ini'];
        $supportedExtensions = ['docx', 'doc', 'pptx', 'pdf', 'xlsx', 'xls', 'txt', 'md'];

        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            if (in_array($file->getFilename(), $skipFiles, true)) {
                continue;
            }

            $ext = strtolower($file->getExtension());

            if (in_array($ext, $supportedExtensions, true)) {
                $files[] = $file->getPathname();
            }
        }

        sort($files);

        return $files;
    }

    /**
     * Convert documents to Markdown (preserves heading structure with #).
     * Uses Pandoc for .docx/.pptx, textutil fallback for legacy .doc.
     */
    private function convertToMarkdown(string $filePath): ?string
    {
        $escaped = escapeshellarg($filePath);
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        // Legacy .doc format: Pandoc doesn't support it, use macOS textutil
        if ($ext === 'doc') {
            return $this->convertLegacyDoc($filePath);
        }

        $output = shell_exec("pandoc {$escaped} -t markdown --wrap=none --markdown-headings=atx 2>/dev/null");

        return $output ?: null;
    }

    /**
     * Convert legacy .doc files using macOS textutil, then add Markdown headings heuristically.
     */
    private function convertLegacyDoc(string $filePath): ?string
    {
        $escaped = escapeshellarg($filePath);

        // textutil is native on macOS
        $html = shell_exec("textutil -convert html -stdout {$escaped} 2>/dev/null");

        if (empty($html)) {
            return null;
        }

        // Convert the HTML to Markdown via Pandoc
        $process = proc_open(
            'pandoc -f html -t markdown --wrap=none --markdown-headings=atx',
            [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
            $pipes
        );

        if (! is_resource($process)) {
            // Fallback: strip HTML tags and return plain text with basic heading detection
            return $this->htmlToMarkdownFallback($html);
        }

        fwrite($pipes[0], $html);
        fclose($pipes[0]);

        $markdown = stream_get_contents($pipes[1]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);

        return $markdown ?: null;
    }

    /**
     * Basic HTML → Markdown fallback when Pandoc pipe fails.
     */
    private function htmlToMarkdownFallback(string $html): string
    {
        // Convert headings
        $md = preg_replace_callback('/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/is', function ($m) {
            return str_repeat('#', (int) $m[1]).' '.strip_tags($m[2])."\n\n";
        }, $html);

        // Convert paragraphs
        $md = preg_replace('/<\/p>\s*/i', "\n\n", $md);
        $md = preg_replace('/<br\s*\/?>/i', "\n", $md);

        // Strip remaining tags
        $md = strip_tags($md);
        $md = html_entity_decode($md, ENT_QUOTES, 'UTF-8');

        return trim($md);
    }

    private function convertPdf(string $filePath): ?string
    {
        $escaped = escapeshellarg($filePath);
        $output = shell_exec("pdftotext -layout {$escaped} - 2>/dev/null");

        return $output ?: null;
    }

    private function convertSpreadsheet(string $filePath): ?string
    {
        $spreadsheet = IOFactory::load($filePath);
        $lines = [];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $sheetName = $sheet->getTitle();
            $rows = $sheet->toArray();

            // Extract header row
            $headerCells = [];
            if (! empty($rows)) {
                $headerCells = array_map(fn ($c) => trim((string) ($c ?? '')), $rows[0]);
                $headerCells = array_filter($headerCells, fn ($c) => $c !== '');
            }

            $dataRows = array_slice($rows, 1);
            $rowCount = count($dataRows);

            // For large sheets (>50 rows), create a summary + sample instead of dumping all data
            if ($rowCount > 50) {
                $lines[] = "# {$sheetName}";
                $lines[] = '';
                $lines[] = "Feuille de données avec {$rowCount} lignes.";

                if (! empty($headerCells)) {
                    $lines[] = 'Colonnes : '.implode(', ', $headerCells);
                }

                $lines[] = '';
                $lines[] = '## Premières entrées (échantillon)';

                if (! empty($headerCells)) {
                    $lines[] = '| '.implode(' | ', $headerCells).' |';
                    $lines[] = '| '.implode(' | ', array_fill(0, count($headerCells), '---')).' |';
                }

                // Include first 20 and last 5 rows as a representative sample
                $sampleRows = array_merge(
                    array_slice($dataRows, 0, 20),
                    [null], // separator
                    array_slice($dataRows, -5)
                );

                foreach ($sampleRows as $row) {
                    if ($row === null) {
                        $lines[] = '| ... | ... |';

                        continue;
                    }
                    $cells = array_map(fn ($cell) => trim((string) ($cell ?? '')), $row);
                    $nonEmpty = array_filter($cells, fn ($c) => $c !== '');
                    if (! empty($nonEmpty)) {
                        $lines[] = '| '.implode(' | ', $nonEmpty).' |';
                    }
                }

                $lines[] = '';

                continue;
            }

            // Small sheets: include everything as a proper Markdown table
            $lines[] = "# {$sheetName}";

            if (! empty($headerCells)) {
                $lines[] = '| '.implode(' | ', $headerCells).' |';
                $lines[] = '| '.implode(' | ', array_fill(0, count($headerCells), '---')).' |';
            }

            foreach ($dataRows as $row) {
                $cells = array_map(fn ($cell) => trim((string) ($cell ?? '')), $row);
                $nonEmpty = array_filter($cells, fn ($c) => $c !== '');

                if (! empty($nonEmpty)) {
                    $lines[] = '| '.implode(' | ', $nonEmpty).' |';
                }
            }

            $lines[] = '';
        }

        return implode("\n", $lines);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────

    /**
     * Convert a float array to PostgreSQL vector literal: '[0.1,0.2,...]'
     *
     * @param  float[]  $vector
     */
    private function vectorToSql(array $vector): string
    {
        return '['.implode(',', $vector).']';
    }
}
