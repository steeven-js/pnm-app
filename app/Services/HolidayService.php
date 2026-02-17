<?php

namespace App\Services;

use Illuminate\Support\Carbon;

class HolidayService
{
    private const ABOLITION_DATES = [
        '971' => ['month' => 5, 'day' => 27, 'name' => 'Abolition de l\'esclavage (Guadeloupe)'],
        '972' => ['month' => 5, 'day' => 22, 'name' => 'Abolition de l\'esclavage (Martinique)'],
        '973' => ['month' => 6, 'day' => 10, 'name' => 'Abolition de l\'esclavage (Guyane)'],
        '978' => ['month' => 5, 'day' => 28, 'name' => 'Abolition de l\'esclavage (Saint-Martin)'],
    ];

    private const DEPARTMENTS = [
        '971' => 'Guadeloupe',
        '972' => 'Martinique',
        '973' => 'Guyane',
        '978' => 'Saint-Martin',
    ];

    public function isHolidayAnywhere(Carbon $date): bool
    {
        foreach (array_keys(self::DEPARTMENTS) as $dept) {
            if ($this->getHolidayName($date, $dept) !== null) {
                return true;
            }
        }

        return false;
    }

    /** @return array<int, array{department: string, code: string, name: string}> */
    public function getHolidaysForDate(Carbon $date): array
    {
        $holidays = [];

        foreach (self::DEPARTMENTS as $code => $name) {
            $holiday = $this->getHolidayName($date, $code);
            if ($holiday !== null) {
                $holidays[] = [
                    'department' => $name,
                    'code' => $code,
                    'name' => $holiday,
                ];
            }
        }

        return $holidays;
    }

    private function getHolidayName(Carbon $date, string $departmentCode): ?string
    {
        $key = sprintf('%02d-%02d', $date->month, $date->day);
        $fixed = [
            '01-01' => 'Jour de l\'An',
            '05-01' => 'Fête du Travail',
            '05-08' => 'Victoire 1945',
            '07-14' => 'Fête nationale',
            '08-15' => 'Assomption',
            '11-01' => 'Toussaint',
            '11-11' => 'Armistice 1918',
            '12-25' => 'Noël',
        ];

        if (isset($fixed[$key])) {
            return $fixed[$key];
        }

        $easter = Carbon::createFromTimestamp(easter_date($date->year));
        $mobile = [
            ['date' => $easter->copy()->addDay(), 'name' => 'Lundi de Pâques'],
            ['date' => $easter->copy()->addDays(39), 'name' => 'Ascension'],
            ['date' => $easter->copy()->addDays(50), 'name' => 'Lundi de Pentecôte'],
        ];

        foreach ($mobile as $holiday) {
            if ($date->isSameDay($holiday['date'])) {
                return $holiday['name'];
            }
        }

        if (isset(self::ABOLITION_DATES[$departmentCode])) {
            $abolition = self::ABOLITION_DATES[$departmentCode];
            if ($date->month === $abolition['month'] && $date->day === $abolition['day']) {
                return $abolition['name'];
            }
        }

        return null;
    }
}
