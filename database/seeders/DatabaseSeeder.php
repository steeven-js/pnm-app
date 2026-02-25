<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        User::factory()->create([
            'name' => 'Utilisateur Invité',
            'email' => 'invite@pnm.local',
        ]);

        $this->call(KnowledgeSeeder::class);
        $this->call(ResolveSeeder::class);
        $this->call(PortaSeeder::class);
    }
}
