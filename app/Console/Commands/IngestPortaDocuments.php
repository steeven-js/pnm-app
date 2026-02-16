<?php

namespace App\Console\Commands;

use App\Models\DocumentChunk;
use App\Models\SensitiveToken;
use App\Services\SanitizationService;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\IOFactory;

class IngestPortaDocuments extends Command
{
    protected $signature = 'chat:ingest-porta {path : Path to the Porta documents directory} {--fresh : Delete all existing chunks before ingesting}';

    protected $description = 'Ingest Porta documents into document_chunks for RAG search';

    private SanitizationService $sanitization;

    private int $chunksCreated = 0;

    public function handle(SanitizationService $sanitization): int
    {
        $this->sanitization = $sanitization;

        $path = $this->argument('path');

        if (! is_dir($path)) {
            $this->error("Directory not found: {$path}");

            return self::FAILURE;
        }

        // Seed sensitive tokens if table is empty
        $this->seedSensitiveTokens();

        if ($this->option('fresh')) {
            $deleted = DocumentChunk::query()->delete();
            $this->info("Deleted {$deleted} existing chunks.");
        }

        // Discover files
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
        $this->info("Ingestion complete. Created {$this->chunksCreated} chunks.");

        return self::SUCCESS;
    }

    private function seedSensitiveTokens(): void
    {
        if (SensitiveToken::count() > 0) {
            $this->info('Sensitive tokens already seeded, skipping.');

            return;
        }

        $tokens = [
            // IPs
            ['token' => '[IP_PORTADB_PROD]', 'real_value' => '172.24.2.10', 'category' => 'ip', 'description' => 'IP PortaDB production'],
            ['token' => '[IP_PORTADB_PREPROD]', 'real_value' => '172.24.2.11', 'category' => 'ip', 'description' => 'IP PortaDB pré-production'],
            ['token' => '[IP_ESB_PROD]', 'real_value' => '172.24.3.20', 'category' => 'ip', 'description' => 'IP ESB production'],
            ['token' => '[IP_ESB_PREPROD]', 'real_value' => '172.24.3.21', 'category' => 'ip', 'description' => 'IP ESB pré-production'],
            ['token' => '[IP_GPMAG_PROD]', 'real_value' => '193.251.160.208', 'category' => 'ip', 'description' => 'IP GPMAG externe'],
            ['token' => '[IP_VMQPRO_01]', 'real_value' => '172.24.1.101', 'category' => 'ip', 'description' => 'IP VM QPRO 01'],
            ['token' => '[IP_VMQPRO_02]', 'real_value' => '172.24.1.102', 'category' => 'ip', 'description' => 'IP VM QPRO 02'],

            // Hostnames
            ['token' => '[HOST_VMQPRO_01]', 'real_value' => 'vmqpro01', 'category' => 'hostname', 'description' => 'Hostname VM QPRO 01'],
            ['token' => '[HOST_VMQPRO_02]', 'real_value' => 'vmqpro02', 'category' => 'hostname', 'description' => 'Hostname VM QPRO 02'],

            // Credentials
            ['token' => '[USER_PNM_01]', 'real_value' => 'pnm_01', 'category' => 'credential', 'description' => 'Compte PNM 01'],
            ['token' => '[USER_PNM_02]', 'real_value' => 'pnm_02', 'category' => 'credential', 'description' => 'Compte PNM 02'],

            // Paths
            ['token' => '[PATH_EXPL]', 'real_value' => '/opt/pkg/expl', 'category' => 'path', 'description' => 'Chemin exploitation'],
        ];

        foreach ($tokens as $token) {
            SensitiveToken::create($token);
        }

        $this->info('Seeded '.count($tokens).' sensitive tokens.');
    }

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

    private function processFile(string $filePath, string $basePath): void
    {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $relativePath = str_replace($basePath.'/', '', $filePath);

        try {
            $text = match ($ext) {
                'docx', 'doc', 'pptx' => $this->convertWithPandoc($filePath),
                'pdf' => $this->convertPdf($filePath),
                'xlsx', 'xls' => $this->convertSpreadsheet($filePath),
                'txt', 'md' => file_get_contents($filePath),
                default => null,
            };

            if (empty($text)) {
                return;
            }

            // Sanitize
            $sanitized = $this->sanitization->sanitize($text);

            // Chunk and insert
            $chunks = $this->chunkText($sanitized);

            foreach ($chunks as $index => $chunk) {
                DocumentChunk::create([
                    'source_file' => $relativePath,
                    'source_type' => $ext,
                    'chunk_index' => $index,
                    'heading' => $chunk['heading'],
                    'content' => $chunk['content'],
                ]);
                $this->chunksCreated++;
            }
        } catch (\Throwable $e) {
            $this->warn("Failed to process {$relativePath}: {$e->getMessage()}");
        }
    }

    private function convertWithPandoc(string $filePath): ?string
    {
        $escaped = escapeshellarg($filePath);
        $output = shell_exec("pandoc {$escaped} -t plain --wrap=none 2>/dev/null");

        return $output ?: null;
    }

    private function convertPdf(string $filePath): ?string
    {
        $escaped = escapeshellarg($filePath);
        $output = shell_exec("pdftotext {$escaped} - 2>/dev/null");

        return $output ?: null;
    }

    private function convertSpreadsheet(string $filePath): ?string
    {
        $spreadsheet = IOFactory::load($filePath);
        $lines = [];

        foreach ($spreadsheet->getAllSheets() as $sheet) {
            $sheetName = $sheet->getTitle();
            $lines[] = "# {$sheetName}";

            foreach ($sheet->toArray() as $row) {
                $cells = array_map(fn ($cell) => (string) ($cell ?? ''), $row);
                $line = implode(' | ', array_filter($cells, fn ($c) => $c !== ''));

                if ($line !== '') {
                    $lines[] = $line;
                }
            }

            $lines[] = '';
        }

        return implode("\n", $lines);
    }

    /**
     * Chunk text by headings or by fixed size (~500 words).
     *
     * @return array<int, array{heading: string|null, content: string}>
     */
    private function chunkText(string $text): array
    {
        // Try heading-based splitting
        $sections = preg_split('/^(#{1,4}\s+.+)$/m', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

        if ($sections !== false && count($sections) > 2) {
            return $this->chunkByHeadings($sections);
        }

        // Fallback: fixed-size chunks (~500 words)
        return $this->chunkBySize($text, 500);
    }

    /**
     * @param  string[]  $sections
     * @return array<int, array{heading: string|null, content: string}>
     */
    private function chunkByHeadings(array $sections): array
    {
        $chunks = [];
        $currentHeading = null;
        $currentContent = '';

        foreach ($sections as $section) {
            if (preg_match('/^#{1,4}\s+(.+)$/', $section, $m)) {
                // Save previous section
                if (trim($currentContent) !== '') {
                    $chunks[] = [
                        'heading' => $currentHeading,
                        'content' => trim($currentContent),
                    ];
                }
                $currentHeading = trim($m[1]);
                $currentContent = '';
            } else {
                $currentContent .= $section;
            }
        }

        // Save last section
        if (trim($currentContent) !== '') {
            $chunks[] = [
                'heading' => $currentHeading,
                'content' => trim($currentContent),
            ];
        }

        return $chunks;
    }

    /**
     * @return array<int, array{heading: string|null, content: string}>
     */
    private function chunkBySize(string $text, int $maxWords): array
    {
        $words = preg_split('/\s+/', $text);
        $chunks = [];

        for ($i = 0; $i < count($words); $i += $maxWords) {
            $slice = array_slice($words, $i, $maxWords);
            $content = implode(' ', $slice);

            if (trim($content) !== '') {
                $chunks[] = [
                    'heading' => null,
                    'content' => trim($content),
                ];
            }
        }

        return $chunks;
    }
}
