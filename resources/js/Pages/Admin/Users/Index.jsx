import { useState, useRef } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Camera, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminAuthenticatedLayout from '@/Layouts/AdminAuthenticatedLayout';

export default function Index({ users }) {
  console.log(users);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // --- LOGIKA FORM (CREATE & EDIT) ---
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    role: 'staff',
    password: '',
    avatar: null,
    _method: 'POST', // Default untuk Create
  });

  // Fungsi buka modal untuk CREATE
  const openCreateDialog = () => {
    setEditingUser(null);
    setPreviewUrl(null);
    reset();
    clearErrors();
    setData('_method', 'POST');
    setIsDialogOpen(true);
  };

  // Fungsi buka modal untuk EDIT
  const openEditDialog = (user) => {
    setEditingUser(user);
    setPreviewUrl(user.avatar_url);
    clearErrors();
    setData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      avatar: null, // Kosongkan file input, kecuali user ingin ganti
      _method: 'PUT', // Kita tetap pakai POST tapi nanti dikirim ke route update
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('avatar', file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Eksekusi Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      // Logic EDIT: Laravel butuh _method: PUT di dalam body POST untuk upload file
      post(route('admin.users.update', editingUser.id), {
        onSuccess: () => closeModal(),
        forceFormData: true, // Pastikan dikirim sebagai multipart/form-data
      });
    } else {
      // Logic CREATE
      post(route('admin.users.store'), {
        onSuccess: () => closeModal(),
      });
    }
  };

  const closeModal = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setPreviewUrl(null);
    reset();
  };

  return (
    <AdminAuthenticatedLayout>
      <Head title="Kelola User" />
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola User</h1>
            <p className="text-muted-foreground">Sistem manajemen akses pengguna</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Tambah User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Daftar User</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* --- DIALOG FORM (SATU DIALOG UNTUK DUA FUNGSI) --- */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User'}</DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Perbarui data profil pengguna.' : 'Buat pengguna baru di sistem.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2">
                      <AvatarImage src={previewUrl} />
                      <AvatarFallback><Users className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                  <p className="text-xs text-muted-foreground text-center">Format: JPG, PNG. Maks 2MB</p>
                </div>

                <div className="grid gap-2">
                  <Label>Nama Lengkap</Label>
                  <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>
                    Password
                    {editingUser ? <span className="text-muted-foreground font-normal ml-1">(Opsional)</span> : <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    placeholder={editingUser ? "Biarkan kosong untuk password lama" : "Minimal 8 karakter"}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="grid gap-2">
                  <Label>Role Akses</Label>
                  <Select value={data.role} onValueChange={val => setData('role', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                <Button type="submit" disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminAuthenticatedLayout>
  );
}