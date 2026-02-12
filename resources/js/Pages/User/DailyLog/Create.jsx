import { useForm, Link } from "@inertiajs/react";
import { Plus, Trash2, Camera, X, Clock, FileText, ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        items: [
            {
                time: new Date().toTimeString().slice(0, 5),
                description: "",
                notes: "",
                photo: null,
                preview: null,
            },
        ],
    });

    const updateItem = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;
        setData("items", updated);
    };

    const addItem = () => {
        setData("items", [
            ...data.items,
            {
                time: new Date().toTimeString().slice(0, 5),
                description: "",
                notes: "",
                photo: null,
                preview: null,
            },
        ]);
    };

    const removeItem = (index) => {
        if (data.items.length === 1) return;
        const updated = data.items.filter((_, i) => i !== index);
        setData("items", updated);
    };

    const handleFileChange = (index, file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const updated = [...data.items];
            updated[index].photo = file;
            updated[index].preview = e.target.result;
            setData("items", updated);
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = (index) => {
        const updated = [...data.items];
        updated[index].photo = null;
        updated[index].preview = null;

        setData("items", updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validItems = data.items.filter((i) => i.description.trim());
        if (validItems.length === 0) return;

        post(route("user.daily-logs.store"), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">Input Log Harian</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {data.items.map((item, index) => (
                        <Card key={index}>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Aktivitas #{index + 1}</CardTitle>
                                    {data.items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Time Input */}
                                <div className="space-y-2">
                                    <Label htmlFor={`time-${index}`} className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Jam
                                    </Label>
                                    <Input
                                        id={`time-${index}`}
                                        type="time"
                                        value={item.time}
                                        onChange={(e) => updateItem(index, 'time', e.target.value)}
                                        className="w-24"
                                        required
                                    />
                                </div>

                                {/* Description Input */}
                                <div className="space-y-2">
                                    <Label htmlFor={`description-${index}`} className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Keterangan <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id={`description-${index}`}
                                        placeholder="Contoh: Penerimaan barang dari supplier PT. ABC"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="min-h-[80px] resize-none"
                                    />
                                </div>

                                {/* Notes Input */}
                                <div className="space-y-2">
                                    <Label htmlFor={`notes-${index}`} className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Catatan Tambahan
                                    </Label>
                                    <Textarea
                                        id={`notes-${index}`}
                                        placeholder="Catatan detail atau keterangan tambahan (opsional)"
                                        value={item.notes}
                                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                        className="min-h-[60px] resize-none"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Dokumentasi Foto
                                    </Label>

                                    {item.preview ? (
                                        <div className="relative rounded-lg border-2 border-dashed border-border p-3">
                                            <div className="flex items-start gap-3">
                                                <div className="relative h-auto w-40 rounded-lg overflow-hidden bg-muted">
                                                    <img
                                                        src={item.preview}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <p className="font-medium text-sm truncate">{item.photo.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(item.photo.size / 1024).toFixed(2)} KB
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removePhoto(index)}
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
                                            onClick={() => document.getElementById(`file-input-${index}`).click()}
                                        >
                                            <input
                                                id={`file-input-${index}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(index, e.target.files[0])}
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
                                </div>
                            </CardContent>
                        </Card>

                    ))}

                    <Button type="button"
                        className="w-full"
                        variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Aktivitas
                    </Button>

                    <div className="flex gap-3">
                        <Link href={route("dashboard")} className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Batal
                            </Button>
                        </Link>

                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? "Menyimpan..." : "Simpan Aktivitas"}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
