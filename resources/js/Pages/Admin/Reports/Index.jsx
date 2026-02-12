import { useState } from 'react';
import { Head, router } from '@inertiajs/react'; // Import Inertia tools
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10B981', '#F59E0B', '#EF4444'];

export default function LogReports({ summary, chartData, activityByTime, userActivity, recentLogs, filters }) {
  
  // State lokal hanya untuk UI control, data filter dikirim ke server
  const onPeriodChange = (value) => {
    router.get(route('admin.reports.index'), { period: value }, {
      preserveState: true,
      preserveScroll: true,
      only: ['summary', 'chartData', 'activityByTime', 'userActivity', 'recentLogs', 'filters'],
    });
  };

  return (
    <AdminAuthenticatedLayout>
      <Head title="Laporan Log" />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laporan Log</h1>
            <p className="text-muted-foreground">
              Analisis aktivitas log gudang
            </p>
          </div>
          <Select value={filters.period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">30 Hari Terakhir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Item</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalItems}</div>
              <p className="text-xs text-muted-foreground">item tercatat periode ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hari Aktif</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeDays}</div>
              <p className="text-xs text-muted-foreground">hari ada aktivitas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Harian</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.avgPerDay}</div>
              <p className="text-xs text-muted-foreground">item / hari aktif</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dokumentasi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">total foto diupload</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Grafik & Aktivitas</TabsTrigger>
            <TabsTrigger value="users">Performa User</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Weekly Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Tren Aktivitas</CardTitle>
                  <CardDescription>Jumlah item per hari</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Jumlah Item" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Waktu Tersibuk</CardTitle>
                  <CardDescription>Distribusi jam input data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityByTime}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {activityByTime.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {activityByTime.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}: {entry.count}
                            </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Table */}
            <Card>
              <CardHeader>
                <CardTitle>Log Terbaru</CardTitle>
                <CardDescription>Riwayat input data terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jumlah Item</TableHead>
                      <TableHead>Dokumentasi</TableHead>
                      <TableHead>Update Terakhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLogs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Tidak ada data</TableCell>
                        </TableRow>
                    ) : (
                        recentLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="font-medium">
                            {format(new Date(log.date), 'EEEE, d MMMM yyyy', { locale: id })}
                            </TableCell>
                            <TableCell>{log.itemCount} item</TableCell>
                            <TableCell>{log.photoCount} foto</TableCell>
                            <TableCell>
                            {format(new Date(log.updatedAt), 'HH:mm', { locale: id })}
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kontribusi User
                </CardTitle>
                <CardDescription>
                  Jumlah log harian yang dibuat oleh setiap user dalam periode ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Total Log</TableHead>
                      <TableHead>Aktivitas Terakhir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivity.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.logCount} log</TableCell>
                        <TableCell>{user.lastActivity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
             {/* Chart User */}
             <Card>
                <CardHeader>
                  <CardTitle>Grafik Kontribusi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userActivity} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="logCount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminAuthenticatedLayout>
  );
}