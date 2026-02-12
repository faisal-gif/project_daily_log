import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
  Clock, 
  Calendar, 
  FileText, 
  ArrowLeft, 
  Trash2, 
  Pencil, 
  Image as ImageIcon 
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EditLogItemDialog } from './Partials/EditLogItemDialog';

export default function Show({ log }) {
  // State untuk dialog edit
  const [editingItem, setEditingItem] = useState(null);

  // Jika log tidak ditemukan (biasanya dihandle 404 oleh Laravel, tapi ini safety check)
  if (!log) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Log tidak ditemukan</h2>
          <Button onClick={() => router.visit(route('dashboard'))}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Helper untuk format jam (H:i)
  const formatTime = (time) => time ? time.substring(0, 5) : '-';

  // --- ACTIONS ---

  const handleDeleteLog = () => {
    router.delete(route('logs.destroy', log.id));
  };

  const handleDeleteItem = (itemId) => {
    router.delete(route('logs.items.destroy', { log: log.id, item: itemId }));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveItem = (updates) => {
    // updates berisi { description, time, notes, dll }
    // Gunakan router.post dengan _method: PUT untuk support upload file jika ada, 
    // atau router.put jika hanya text.
    
    router.post(route('user.daily-logs.items.update', { log: log.id, item: editingItem.id }), {
        ...updates,
        _method: 'PUT',
    }, {
        onSuccess: () => setEditingItem(null),
    });
  };

  return (
    <AuthenticatedLayout>
      <Head title={`Log ${formatDate(log.date)}`} />
      
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Log Harian</h1>
              <p className="text-muted-foreground">
                {formatDate(log.date)}
              </p>
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Log Tanggal Ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  Semua {log.items.length} aktivitas pada tanggal ini akan dihapus permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteLog} className="bg-destructive hover:bg-destructive/90">
                  Hapus Semua
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{formatDate(log.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Aktivitas</p>
                  <p className="font-medium">{log.items.length} aktivitas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Daftar Aktivitas</h2>
          
          {log.items.length === 0 && (
             <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <p>Belum ada aktivitas di log ini.</p>
             </div>
          )}

          {log.items.map((item, index) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xl font-bold">{formatTime(item.time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditItem(item)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Aktivitas?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Aktivitas ini akan dihapus dari log hari ini.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Keterangan</p>
                  <p className="text-base">{item.description}</p>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Catatan</p>
                    <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">{item.notes}</p>
                  </div>
                )}

                {/* Photo (Menggunakan photo_url dan photo_name sesuai DB) */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dokumentasi</p>
                  {item.photo_url ? (
                    <div className="rounded-lg overflow-hidden bg-muted max-w-md border">
                      <img 
                        src={item.photo_url} 
                        alt={item.photo_name || "Dokumentasi"}
                        className="w-full max-h-[300px] object-contain bg-black/5"
                      />
                      {item.photo_name && (
                        <p className="text-xs text-muted-foreground p-2 bg-muted/50 border-t">
                          {item.photo_name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded w-fit">
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">Tidak ada foto</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        {/* Pastikan EditLogItemDialog Anda menerima props yang sesuai */}
        {editingItem && (
          <EditLogItemDialog
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            item={editingItem}
            onSave={handleSaveItem}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}