<?php

namespace App\Services;

use App\Models\SensitiveToken;

class SanitizationService
{
    /** @var array<string, string>|null real_value => token */
    private ?array $sanitizeMap = null;

    /** @var array<string, string>|null token => real_value */
    private ?array $rehydrateMap = null;

    /**
     * Replace sensitive values with tokens.
     */
    public function sanitize(string $text): string
    {
        $map = $this->getSanitizeMap();

        if (empty($map)) {
            return $text;
        }

        return str_replace(array_keys($map), array_values($map), $text);
    }

    /**
     * Replace tokens with real values.
     */
    public function rehydrate(string $text): string
    {
        $map = $this->getRehydrateMap();

        if (empty($map)) {
            return $text;
        }

        return str_replace(array_keys($map), array_values($map), $text);
    }

    /**
     * @return array<string, string> real_value => token
     */
    private function getSanitizeMap(): array
    {
        if ($this->sanitizeMap === null) {
            $tokens = SensitiveToken::all(['token', 'real_value']);
            $this->sanitizeMap = [];
            $this->rehydrateMap = [];

            foreach ($tokens as $t) {
                $this->sanitizeMap[$t->real_value] = $t->token;
                $this->rehydrateMap[$t->token] = $t->real_value;
            }

            uksort($this->sanitizeMap, fn (string $a, string $b) => strlen($b) - strlen($a));
        }

        return $this->sanitizeMap;
    }

    /**
     * @return array<string, string> token => real_value
     */
    private function getRehydrateMap(): array
    {
        if ($this->rehydrateMap === null) {
            $this->getSanitizeMap();
        }

        return $this->rehydrateMap;
    }
}
