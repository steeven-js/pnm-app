<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class SqlPlaygroundService
{
    private const MAX_ROWS = 100;

    private const ALLOWED_TABLES = [
        'porta_operateur',
        'porta_code_ticket',
        'porta_code_reponse',
        'porta_etat',
        'porta_transition',
        'porta_tranche',
        'porta_ferryday',
        'porta_msisdn',
        'porta_msisdn_historique',
        'porta_dossier',
        'porta_portage',
        'porta_portage_historique',
        'porta_portage_data',
        'porta_fichier',
        'porta_data',
        'porta_ack',
        'porta_sync',
        'porta_sync_status',
        // W3Schools SQL Tutorial tables
        'w3_categories',
        'w3_customers',
        'w3_employees',
        'w3_orders',
        'w3_order_details',
        'w3_products',
        'w3_shippers',
        'w3_suppliers',
    ];

    /**
     * Validate and execute a SQL query against porta_* tables.
     *
     * @return array{columns: string[], rows: array<int, array<string, mixed>>, row_count: int, truncated: bool}
     *
     * @throws \InvalidArgumentException
     */
    public function execute(string $sql): array
    {
        $sql = trim($sql);

        if ($sql === '') {
            throw new \InvalidArgumentException('La requête SQL est vide.');
        }

        $this->validateSelectOnly($sql);
        $this->validateAllowedTables($sql);

        // Force LIMIT if not present
        $hasTruncated = false;
        $sqlWithLimit = $this->ensureLimit($sql, $hasTruncated);

        $results = DB::select($sqlWithLimit);

        if (empty($results)) {
            return [
                'columns' => [],
                'rows' => [],
                'row_count' => 0,
                'truncated' => false,
            ];
        }

        $rows = array_map(fn ($row) => (array) $row, $results);
        $columns = array_keys($rows[0]);

        return [
            'columns' => $columns,
            'rows' => $rows,
            'row_count' => count($rows),
            'truncated' => $hasTruncated || count($rows) >= self::MAX_ROWS,
        ];
    }

    /**
     * Get the schema of all porta_* tables.
     *
     * @return array<string, array<int, array{column: string, type: string, nullable: bool}>>
     */
    public function getSchema(): array
    {
        $schema = [];

        foreach (self::ALLOWED_TABLES as $table) {
            $columns = DB::select("
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = ?
                ORDER BY ordinal_position
            ", [$table]);

            $schema[$table] = array_map(fn ($col) => [
                'column' => $col->column_name,
                'type' => $col->data_type,
                'nullable' => $col->is_nullable === 'YES',
            ], $columns);
        }

        return $schema;
    }

    private function validateSelectOnly(string $sql): void
    {
        // Remove comments
        $cleaned = preg_replace('/--.*$/m', '', $sql);
        $cleaned = preg_replace('/\/\*.*?\*\//s', '', $cleaned);
        $cleaned = trim($cleaned);

        // Must start with SELECT or WITH (CTE)
        if (! preg_match('/^(SELECT|WITH)\s/i', $cleaned)) {
            throw new \InvalidArgumentException(
                'Seules les requêtes SELECT sont autorisées. Les commandes INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE sont interdites.'
            );
        }

        // Block dangerous keywords anywhere in the query
        $forbidden = [
            'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
            'CREATE', 'GRANT', 'REVOKE', 'EXECUTE', 'EXEC',
            'INTO', // SELECT INTO
            'COPY',
            'pg_', // PostgreSQL system functions
        ];

        foreach ($forbidden as $keyword) {
            if (preg_match('/\b'.preg_quote($keyword, '/').'\b/i', $cleaned)) {
                // Allow "INTO" only after "SELECT ... INTO" check is false
                if ($keyword === 'INTO' && ! preg_match('/\bINTO\s+\w/i', $cleaned)) {
                    continue;
                }
                throw new \InvalidArgumentException(
                    "Mot-clé interdit détecté : {$keyword}. Seules les requêtes SELECT en lecture seule sont autorisées."
                );
            }
        }
    }

    private function validateAllowedTables(string $sql): void
    {
        // Extract table references (FROM, JOIN)
        preg_match_all('/\b(?:FROM|JOIN)\s+([a-z_][a-z0-9_]*)/i', $sql, $matches);

        if (empty($matches[1])) {
            return; // No tables found — might be a simple expression
        }

        foreach ($matches[1] as $table) {
            $tableLower = strtolower($table);
            if (! in_array($tableLower, self::ALLOWED_TABLES)) {
                throw new \InvalidArgumentException(
                    "Table non autorisée : {$table}. Seules les tables porta_* et w3_* sont accessibles."
                );
            }
        }
    }

    private function ensureLimit(string $sql, bool &$hasTruncated): string
    {
        // Check if LIMIT already exists
        if (preg_match('/\bLIMIT\s+(\d+)/i', $sql, $matches)) {
            $existingLimit = (int) $matches[1];
            if ($existingLimit > self::MAX_ROWS) {
                $hasTruncated = true;
                $sql = preg_replace('/\bLIMIT\s+\d+/i', 'LIMIT '.self::MAX_ROWS, $sql);
            }

            return $sql;
        }

        // Add LIMIT if not present
        // Remove trailing semicolon
        $sql = rtrim($sql, "; \t\n\r");
        $hasTruncated = true;

        return $sql.' LIMIT '.self::MAX_ROWS;
    }
}
