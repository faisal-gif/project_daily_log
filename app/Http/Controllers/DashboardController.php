<?php

namespace App\Http\Controllers;

use App\Models\DailyLog;
use App\Models\LogItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function user()
    {
        $user = Auth::user();

        // Set locale Carbon ke Indonesia agar nama hari muncul dalam Bhs Indonesia (Senin, Selasa...)
        Carbon::setLocale('id');

        // --- 1. Ambil Data Log Utama (Untuk List Accordion) ---
        // Kita ambil log beserta item-nya, diurutkan dari tanggal terbaru
        $dailyLogs = DailyLog::with(['items' => function ($query) {
            $query->orderBy('time', 'asc');
        }])
            ->where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(30) // Batasi 30 hari terakhir agar tidak terlalu berat
            ->get();

        // --- 2. Hitung Statistik (Stats) ---

        $today = Carbon::today();
        $sevenDaysAgo = Carbon::today()->subDays(6);

        // A. Hitung item hari ini
        // Menggunakan whereHas untuk mengecek LogItem yang DailyLog-nya tanggal hari ini
        $todayCount = LogItem::whereHas('dailyLog', function ($query) use ($user, $today) {
            $query->where('user_id', $user->id)
                ->whereDate('date', $today);
        })->count();

        // B. Hitung item minggu ini (7 hari terakhir)
        $weekCount = LogItem::whereHas('dailyLog', function ($query) use ($user, $sevenDaysAgo) {
            $query->where('user_id', $user->id)
                ->whereDate('date', '>=', $sevenDaysAgo);
        })->count();

        // C. Siapkan Data Grafik (Weekly Data)
        // Kita perlu array 7 hari terakhir, walaupun datanya 0

        // Ambil DailyLog 7 hari terakhir beserta jumlah item-nya (withCount)
        $logsInWeek = DailyLog::where('user_id', $user->id)
            ->whereDate('date', '>=', $sevenDaysAgo)
            ->withCount('items')
            ->get();

        $weeklyData = [];

        // Loop 7 hari ke belakang (dari H-6 sampai Hari Ini)
        for ($i = 6; $i >= 0; $i--) {
            $dateCheck = Carbon::today()->subDays($i);
            $dateString = $dateCheck->format('Y-m-d');

            // Cari apakah ada log di tanggal ini
            $log = $logsInWeek->first(function ($item) use ($dateString) {
                // Pastikan format tanggal sama saat membandingkan
                return $item->date->format('Y-m-d') === $dateString;
            });

            $weeklyData[] = [
                // Nama hari singkatan (Sen, Sel, Rab...) atau lengkap (Senin...)
                'day' => $dateCheck->isoFormat('dddd'),
                'count' => $log ? $log->items_count : 0, // Jika tidak ada log, isi 0
            ];
        }

        return inertia('User/Dashboard', [
            'dailyLogs' => $dailyLogs,
            'stats' => [
                'todayCount' => $todayCount,
                'weekCount' => $weekCount,
                'weeklyData' => $weeklyData,
            ],
        ]);
    }

    public function admin()
    {
        // Hitung Statistik User
        $userStats = [
            'total'      => User::count(),
            'admin'      => User::where('role', 'admin')->count(),
            'staff'      => User::where('role', 'staff')->count(),
            'viewer'     => User::where('role', 'viewer')->count(),
        ];

        // Hitung Statistik Log (Contoh query)
        $logStats = [
            'today' => LogItem::whereDate('created_at', Carbon::today())->count(),
            'week'  => LogItem::whereBetween('created_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
            'total' => LogItem::count(),
        ];
        return inertia('Admin/Dashboard', [
            'userStats' => $userStats,
            'logStats'  => $logStats,
        ]);
    }
}
