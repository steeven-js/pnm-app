<?php

namespace App\Services;

use Illuminate\Support\Carbon;

class HolidayService
{
    /**
     * Abolition dates per DOM department.
     */
    private const ABOLITION_DATES = [
        '971' => ['month' => 5, 'day' => 27, 'name' => 'Abolition de l\'esclavage (Guadeloupe)'],
        '972' => ['month' => 5, 'day' => 22, 'name' => 'Abolition de l\'esclavage (Martinique)'],
        '973' => ['month' => 6, 'day' => 10, 'name' => 'Abolition de l\'esclavage (Guyane)'],
        '977' => ['month' => 10, 'day' => 9, 'name' => 'Abolition de l\'esclavage (Saint-Barthélemy)'],
        '978' => ['month' => 5, 'day' => 28, 'name' => 'Abolition de l\'esclavage (Saint-Martin)'],
    ];

    private const DEPARTMENTS = [
        '971' => 'Guadeloupe',
        '972' => 'Martinique',
        '973' => 'Guyane',
        '977' => 'Saint-Barthélemy',
        '978' => 'Saint-Martin',
    ];

    /**
     * OR logic: true if holiday in ANY GPMAG department.
     * During holidays: no bascule, no vacation, no exchange.
     */
    public function isHolidayAnywhere(Carbon $date): bool
    {
        if ($this->getCommonHolidayName($date) !== null) {
            return true;
        }

        foreach (array_keys(self::ABOLITION_DATES) as $dept) {
            $abolition = self::ABOLITION_DATES[$dept];
            if ($date->month === $abolition['month'] && $date->day === $abolition['day']) {
                return true;
            }
        }

        return false;
    }

    /** @return array<int, array{department: string, code: string, name: string}> */
    public function getHolidaysForDate(Carbon $date): array
    {
        $holidays = [];

        // Common holidays (national + GPMAG-specific) apply to all departments
        $commonName = $this->getCommonHolidayName($date);
        if ($commonName !== null) {
            $holidays[] = [
                'department' => 'GPMAG',
                'code' => 'ALL',
                'name' => $commonName,
            ];
        }

        // DOM-specific abolition dates
        foreach (self::DEPARTMENTS as $code => $deptName) {
            if (isset(self::ABOLITION_DATES[$code])) {
                $abolition = self::ABOLITION_DATES[$code];
                if ($date->month === $abolition['month'] && $date->day === $abolition['day']) {
                    $holidays[] = [
                        'department' => $deptName,
                        'code' => $code,
                        'name' => $abolition['name'],
                    ];
                }
            }
        }

        return $holidays;
    }

    /**
     * Holidays common to all GPMAG departments (national + Antilles-specific).
     * Source: ANNEXE 1 - Annexe 4 "Liste des jours fériés" du GPMAG.
     */
    private function getCommonHolidayName(Carbon $date): ?string
    {
        $key = sprintf('%02d-%02d', $date->month, $date->day);

        // Fixed national holidays
        $fixed = [
            '01-01' => 'Jour de l\'An',
            '05-01' => 'Fête du Travail',
            '05-08' => 'Victoire 1945',
            '07-14' => 'Fête nationale',
            '08-15' => 'Assomption',
            '11-01' => 'Toussaint',
            '11-02' => 'Jour des Défunts',
            '11-11' => 'Armistice 1918',
            '12-25' => 'Noël',
        ];

        if (isset($fixed[$key])) {
            return $fixed[$key];
        }

        // Mobile holidays (Easter-based) — national + GPMAG-specific
        $easter = Carbon::createFromTimestamp(easter_date($date->year));
        $mobile = [
            ['date' => $easter->copy()->subDays(47), 'name' => 'Mardi Gras'],
            ['date' => $easter->copy()->subDays(46), 'name' => 'Mercredi des Cendres'],
            ['date' => $easter->copy()->subDays(24), 'name' => 'Mi-Carême'],
            ['date' => $easter->copy()->subDays(2), 'name' => 'Vendredi Saint'],
            ['date' => $easter->copy()->addDay(), 'name' => 'Lundi de Pâques'],
            ['date' => $easter->copy()->addDays(39), 'name' => 'Ascension'],
            ['date' => $easter->copy()->addDays(50), 'name' => 'Lundi de Pentecôte'],
        ];

        foreach ($mobile as $holiday) {
            if ($date->isSameDay($holiday['date'])) {
                return $holiday['name'];
            }
        }

        return null;
    }
}
