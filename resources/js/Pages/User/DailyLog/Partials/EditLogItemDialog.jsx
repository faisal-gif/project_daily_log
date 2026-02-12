import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react'; // Import useForm
import { Clock, FileText, Camera, X, ImageIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function EditLogItemDialog({ open, onOpenChange, item, onSave }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  // State khusus untuk PREVIEW gambar di browser (bukan data yang dikirim)
  const [previewUrl, setPreviewUrl] = useState(item?.photo_url);

  // Inisialisasi useForm Inertia
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    _method: 'PUT', // Penting untuk upload file pada mode Edit di Laravel
    time: item?.time || '',
    description: item?.description || '',
    notes: item?.notes || '',
    photo: null, // Untuk file baru
    remove_photo: false, // Flag jika user menghapus foto lama
  });

  // Reset form saat item berubah atau dialog dibuka
  useEffect(() => {
    if (open && item) {
      setPreviewUrl(item.photo_url);
      reset({
        _method: 'PUT',
        time: item.time,
        description: item.description,
        notes: item.notes || '',
        photo: null,
        remove_photo: false,
      });
      clearErrors();
    }
  }, [open, item]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Format tidak valid',
          description: 'Silakan pilih file gambar (JPG, PNG)',
          variant: 'destructive',
        });
        return;
      }

      // Validasi ukuran (contoh 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran maksimal 5MB',
          variant: 'destructive',
        });
        return;
      }

      // 1. Set data form (File Object) untuk dikirim ke backend
      setData('photo', file);
      setData('remove_photo', false); 

      // 2. Buat preview lokal
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Update data form
    setData((previousData) => ({
      ...previousData,
      photo: null,         // Batalkan upload file baru jika ada
      remove_photo: true,  // Tandai untuk hapus foto lama di DB
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi frontend sederhana
    if (!data.description.trim()) {
      toast({
        title: 'Keterangan wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    // Panggil onSave dari parent yang akan mengeksekusi router.post
    // Kita kirim 'data' yang sudah disiapkan oleh useForm (termasuk File object)
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Aktivitas</DialogTitle>
          <DialogDescription>
            Perbarui detail aktivitas log Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Jam
            </Label>
            <Input
              id="edit-time"
              type="time"
              value={data.time}
              onChange={(e) => setData('time', e.target.value)}
              className="w-full max-w-[200px]"
              required
            />
            {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Keterangan <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Contoh: Penerimaan barang..."
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              className="min-h-[80px] resize-none"
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Catatan Tambahan
            </Label>
            <Textarea
              id="edit-notes"
              placeholder="Catatan detail (opsional)"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              className="min-h-[60px] resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Dokumentasi Foto
            </Label>

            {previewUrl ? (
              <div className="relative rounded-lg border-2 border-dashed border-border p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    {/* Jika data.photo ada, berarti user baru upload file baru. 
                        Jika tidak, berarti previewUrl dari database (existing) */}
                    <p className="font-medium text-sm truncate">
                      {data.photo ? data.photo.name : (item.photo_name || 'Foto tersimpan')}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removePhoto}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="relative rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-full bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Klik untuk upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG hingga 5MB</p>
                  </div>
                </div>
              </div>
            )}
            {errors.photo && <p className="text-sm text-red-500">{errors.photo}</p>}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            {/* Kita gunakan props 'isSubmitting' atau 'processing' dari Inertia */}
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}