import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Shield, UserCheck, Eye, Activity } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';

export default function AdminDashboard({ userStats, logStats }) {
  
  // Data dikirim dari Laravel (bukan dari Context lagi)
  const statCards = [
    {
      title: 'Total User',
      value: userStats.total,
      icon: Users,
      description: 'User terdaftar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Admin',
      value: userStats.admin,
      icon: Shield,
      description: 'Administrator',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Staff',
      value: userStats.staff,
      icon: UserCheck,
      description: 'Staff aktif',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Viewer',
      value: userStats.viewer,
      icon: Eye,
      description: 'Read-only access',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <AdminAuthenticatedLayout>
      <Head title="Admin Dashboard" />
      
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Kelola user dan lihat ringkasan aktivitas gudang.
          </p>
        </div>

        {/* User Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats & Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Ringkasan Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ringkasan Log Aktivitas
              </CardTitle>
              <CardDescription>Metrik aktivitas input data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Item masuk hari ini</span>
                <span className="font-semibold text-lg">{logStats.today} item</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Item masuk minggu ini</span>
                <span className="font-semibold">{logStats.week} item</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Total baris log</span>
                <span className="font-semibold">{logStats.total} baris</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Pintasan menu administrasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Menggunakan Route Helper Laravel via Ziggy/Inertia */}
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href={route('admin.users.index')}>
                  <Users className="mr-2 h-4 w-4" />
                  Kelola User Management
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="#"> {/* Ganti dengan route laporan jika sudah ada */}
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Laporan Lengkap
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthenticatedLayout>
  );
}