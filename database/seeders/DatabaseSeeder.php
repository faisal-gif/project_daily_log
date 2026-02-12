<?php

namespace Database\Seeders;

use App\Models\DailyLog;
use App\Models\LogItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */

   public function run(): void
    {
        // 1. Buat User (Admin & Staff)
        $admin = User::create([
            'name' => 'Admin Gudang',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $staff = User::create([
            'name' => 'Staff Lapangan',
            'email' => 'staff@test.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
        ]);

        $users = [$admin, $staff];

        // 2. Loop per Hari (Pastikan satu tanggal hanya di-insert sekali)
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            // Skip hari Minggu (Opsional)
            if ($date->isSunday()) continue;

            // Pilih satu user secara acak sebagai penanggung jawab log hari ini
            $responsibleUser = $users[array_rand($users)];

            // Create Daily Log (Pastikan ini unik karena loop kita per tanggal)
            $dailyLog = DailyLog::create([
                'date' => $date->format('Y-m-d'),
                'user_id' => $responsibleUser->id,
                'created_at' => $date->copy()->setHour(8),
                'updated_at' => $date->copy()->setHour(17),
            ]);

            // 3. Buat Log Item (Banyak item untuk satu Daily Log)
            $itemCount = rand(3, 7);
            for ($j = 1; $j <= $itemCount; $j++) {
                
                $descriptions = [
                    "Pengecekan stok masuk dari Supplier " . rand(1, 5),
                    "Pengaturan layout barang di Rak " . chr(rand(65, 70)),
                    "Packing barang untuk order #" . rand(1000, 2000),
                    "Maintenance area loading dock",
                    "Pencatatan barang retur pelanggan"
                ];

                LogItem::create([
                    'daily_log_id' => $dailyLog->id,
                    'time' => sprintf('%02d:%02d:00', rand(8, 21), rand(0, 59)),
                    'description' => $descriptions[array_rand($descriptions)],
                    'notes' => rand(0, 5) > 3 ? "Catatan tambahan untuk item $j" : null,
                    'photo_url' => rand(0, 10) > 6 ? 'https://placehold.co/600x400.png' : null,
                    'photo_name' => rand(0, 10) > 6 ? 'img_prod_' . rand(100, 999) . '.jpg' : null,
                ]);
            }
        }
    }
}
