<?php

namespace App\Http\Controllers;

use App\Models\DailyLog;
use App\Models\LogItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->input('period', 'week');
        $startDate = $period === 'month' ? Carbon::now()->subDays(30) : Carbon::now()->subDays(6);
        $endDate = Carbon::now();

        // 1. Ambil Log dalam periode
        $logs = DailyLog::with(['items', 'user']) // Asumsi DailyLog punya relasi ke user
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get();

        // 2. Summary Stats
        $totalItems = $logs->sum(fn($log) => $log->items->count());
        $totalPhotos = $logs->sum(fn($log) => $log->items->whereNotNull('photo')->count()); // Sesuaikan nama kolom photo
        $activeDays = $logs->groupBy('date')->count();
        $daysCount = $period === 'month' ? 30 : 7;

        $summary = [
            'totalItems' => $totalItems,
            'totalPhotos' => $totalPhotos,
            'activeDays' => $activeDays,
            'avgPerDay' => $activeDays > 0 ? round($totalItems / $activeDays) : 0,
        ];

        // 3. Chart Data (Pastikan tanggal kosong tetap muncul 0)
        $chartData = [];
        for ($i = $daysCount - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateString = $date->format('Y-m-d');

            // Cari log di tanggal ini
            $logOnDate = $logs->first(fn($log) => Carbon::parse($log->date)->format('Y-m-d') === $dateString);

            $chartData[] = [
                'day' => $date->locale('id')->isoFormat('ddd'), // Sen, Sel...
                'date' => $date->locale('id')->isoFormat('D MMM'), // 12 Feb
                'fullDate' => $dateString,
                'count' => $logOnDate ? $logOnDate->items->count() : 0,
            ];
        }

        // 4. Time Distribution (Distribusi Waktu)
        $allItems = LogItem::whereHas('dailyLog', function ($q) use ($startDate, $endDate) {
            $q->whereBetween('date', [$startDate, $endDate]);
        })->get();

        $timeSlots = [
            'Pagi (06-10)' => 0,
            'Siang (10-14)' => 0,
            'Sore (14-18)' => 0,
            'Malam (18-22)' => 0,
        ];

        foreach ($allItems as $item) {
            // Asumsi format time 'H:i' atau 'H:i:s'
            $hour = (int) substr($item->time, 0, 2);

            if ($hour >= 6 && $hour < 10) $timeSlots['Pagi (06-10)']++;
            elseif ($hour >= 10 && $hour < 14) $timeSlots['Siang (10-14)']++;
            elseif ($hour >= 14 && $hour < 18) $timeSlots['Sore (14-18)']++;
            elseif ($hour >= 18 && $hour < 22) $timeSlots['Malam (18-22)']++;
        }

        $activityByTime = [];
        foreach ($timeSlots as $name => $count) {
            $activityByTime[] = ['name' => $name, 'count' => $count];
        }

        // 5. User Activity Stats
        // Hitung berapa log yang dibuat tiap user
        $userActivity = User::withCount(['dailyLogs' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }])->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'logCount' => $user->daily_logs_count,
                'lastActivity' => $user->dailyLogs()->latest('date')->first()?->date
                    ? Carbon::parse($user->dailyLogs()->latest('date')->first()->date)->locale('id')->isoFormat('D MMM Y')
                    : '-',
            ];
        });

        // 6. Recent Logs
        $recentLogs = DailyLog::with('items')
            ->whereBetween('date', [$startDate, $endDate])
            ->latest('date')
            ->take(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'date' => $log->date,
                    'itemCount' => $log->items->count(),
                    'photoCount' => $log->items->whereNotNull('photo')->count(),
                    'updatedAt' => $log->updated_at,
                ];
            });

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'chartData' => $chartData,
            'activityByTime' => $activityByTime,
            'userActivity' => $userActivity,
            'recentLogs' => $recentLogs,
            'filters' => ['period' => $period]
        ]);
    }
}
