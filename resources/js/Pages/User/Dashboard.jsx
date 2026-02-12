import { useMemo } from "react";
import { usePage, router, Link } from "@inertiajs/react";
import {
    ClipboardList,
    Calendar,
    TrendingUp,
    Clock,
    Image as ImageIcon,
    Trash2,
    Eye,
    ChevronRight,
    FileText,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const chartConfig = {
    count: {
        label: "Jumlah Log",
        color: "hsl(var(--chart-1))",
    },
};

export default function Dashboard({dailyLogs = [], stats = {}}) {
    // Asumsi: Controller mengirimkan props 'dailyLogs' dengan eager loading 'items'
    // Contoh: DailyLog::with('items')->latest('date')->get();
    const totalItems = useMemo(
        () => dailyLogs.reduce((sum, log) => sum + log.items.length, 0),
        [dailyLogs]
    );

    const formatDate = (date) =>
        new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(date));

    // Helper untuk memformat jam jika string dari DB formatnya 'H:i:s'
    const formatTime = (timeString) => {
        if (!timeString) return "-";
        return timeString.substring(0, 5); // Ambil HH:mm saja
    };

    const handleDeleteItem = (logId, itemId) => {
        router.delete(route("logs.items.destroy", { log: logId, item: itemId }));
    };

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Ringkasan aktivitas harian dan log pekerjaan.
                    </p>
                </div>

                {/* Stats Section (Tetap sama, karena logikanya umum) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Log Hari Ini</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.todayCount || 0}</div>
                            <p className="text-xs text-muted-foreground">aktivitas tercatat</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Log Minggu Ini</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.weekCount || 0}</div>
                            <p className="text-xs text-muted-foreground">dalam 7 hari terakhir</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rata-rata Harian</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.weekCount > 0 ? (stats.weekCount / 7).toFixed(1) : '0'}
                            </div>
                            <p className="text-xs text-muted-foreground">log per hari</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Aktivitas</CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalItems}</div>
                            <p className="text-xs text-muted-foreground">dari {dailyLogs.length} hari</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Chart Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Mingguan</CardTitle>
                        <CardDescription>
                            Frekuensi log dalam 7 hari terakhir
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart data={stats.weeklyData || []}>
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                    allowDecimals={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--chart-1))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Daily Logs List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Log Harian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dailyLogs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                <p>Belum ada log aktivitas</p>
                                <Button variant="outline" className="mt-4">
                                    Tambah Log Pertama
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {dailyLogs.map((log) => (
                                    <AccordionItem key={log.id} value={`log-${log.id}`}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4">
                                                <Calendar className="h-4 w-4" />
                                                <span className="font-medium">{formatDate(log.date)}</span>
                                                <span className="text-sm text-muted-foreground no-underline">
                                                    ({log.items.length} item)
                                                </span>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent>
                                            <div className="space-y-3 pt-2">
                                                {log.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-start gap-4 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                                                    >
                                                        {/* Kolom Kiri: Waktu & Konten */}
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatTime(item.time)}
                                                                </div>
                                                                <span className="font-medium text-sm">
                                                                    {item.description}
                                                                </span>
                                                            </div>

                                                            {/* Menampilkan Notes jika ada */}
                                                            {item.notes && (
                                                                <div className="flex items-start gap-2 mt-1 text-muted-foreground">
                                                                    <FileText className="h-3 w-3 mt-1 shrink-0" />
                                                                    <p className="text-xs italic">
                                                                        {item.notes}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Kolom Kanan: Actions (Photo, View, Delete) */}
                                                        <div className="flex items-center gap-1">
                                                            {/* Tombol Foto (Hanya muncul jika ada photo_url) */}
                                                            {item.photo_url && (
                                                                <a
                                                                    href={item.photo_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Button variant="ghost" size="icon" title={item.photo_name || "Lihat Foto"}>
                                                                        <ImageIcon className="h-4 w-4 text-blue-600" />
                                                                    </Button>
                                                                </a>
                                                            )}

                                                            <Link href="#">
                                                                <Button variant="ghost" size="icon">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Hapus Aktivitas?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Aktivitas "{item.description}" akan dihapus permanen.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDeleteItem(log.id, item.id)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        >
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                ))}

                                                <Link href={`/logs/${log.id}`} className="block">
                                                    <Button variant="outline" className="w-full text-xs">
                                                        Lihat Detail Lengkap
                                                        <ChevronRight className="h-3 w-3 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}