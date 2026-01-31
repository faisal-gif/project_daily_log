<?php

namespace App\Http\Controllers;

use App\Http\Requests\DailyLogRequest;
use App\Models\DailyLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DailyLogController extends Controller
{
    public function index()
    {

        $logs = DailyLog::with(['items' => function ($query) {
            $query->orderBy('time', 'asc'); // Urutkan item berdasarkan jam
        }])
            ->orderBy('date', 'desc')
            ->paginate(10);

        return Inertia::render('User/DailyLog/Index', [
            'logs' => $logs,
        ]);
    }

    public function create()
    {
        return Inertia::render('User/DailyLog/Create');
    }

    public function store(DailyLogRequest $request)
    {

        $auth = Auth::user();
        // 1. Buat atau ambil Daily Log berdasarkan tanggal hari ini (atau dari request)
        DB::transaction(function () use ($request, $auth) {
            $date = $request->date ?? now()->format('Y-m-d');
            $dailyLog = DailyLog::firstOrCreate([
                'date' => $date,
                'user_id' => $auth->id,
            ]);

            // 2. Loop melalui item
            foreach ($request->items as $item) {
                $photoPath = null;
                $photoName = null;

                // 3. Handle Upload Foto jika ada
                if (isset($item['photo']) && $item['photo'] instanceof \Illuminate\Http\UploadedFile) {
                    $file = $item['photo'];
                    $photoName = $file->getClientOriginalName();
                    // Simpan di folder 'public/logs'
                    $path = $file->store('logs', 'public');
                    $photoPath = Storage::url($path);
                }

                // 4. Simpan ke tabel log_items melalui relasi
                $dailyLog->items()->create([
                    'time' => $item['time'],
                    'description' => $item['description'],
                    'notes' => $item['notes'] ?? null,
                    'photo_url' => $photoPath,
                    'photo_name' => $photoName,
                ]);
            }
        });


        return redirect()->route('daily-logs.index')->with('success', 'Log harian berhasil disimpan.');
    }
}
