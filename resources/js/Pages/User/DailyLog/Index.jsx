import { Link, usePage, router } from "@inertiajs/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, FileText, Eye, Trash2, Image } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from "@/components/ui/badge";
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
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function index({ logs }) {

    const countPhotos = (items) => {
        return items.filter((item) => item.photo_url).length;
    };

    const handleDelete = (id) => {
        router.delete(route("user.daily-logs.destroy", id));
    };

    return (
        <AuthenticatedLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daftar Log</h1>
                        <p className="text-muted-foreground">
                            Semua catatan aktivitas gudang
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route("user.daily-logs.create")}>Tambah Log Baru</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Total {logs?.total} Log
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {logs?.data?.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Belum ada log yang dibuat</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No</TableHead>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead className="text-center">Aktivitas</TableHead>
                                                <TableHead className="text-center">Foto</TableHead>
                                                <TableHead>Update Terakhir</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {logs?.data?.map((log, index) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        {(logs.current_page - 1) * logs.per_page +
                                                            index +
                                                            1}
                                                    </TableCell>

                                                    <TableCell className="w-48">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <span className="font-medium">
                                                                {format(
                                                                    new Date(log.date),
                                                                    "EEEE, d MMMM yyyy",
                                                                    { locale: id }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Clock className="h-3 w-3 shrink-0" />
                                                            {log.items.length} item
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {countPhotos(log.items) > 0 ? (
                                                            <Badge variant="outline" className="gap-1">
                                                                <Image className="h-3 w-3" />
                                                                {countPhotos(log.items)}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {format(
                                                            new Date(log.updated_at),
                                                            "dd/MM/yyyy HH:mm"
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={route("user.daily-logs.show", log.id)}>
                                                                    <Eye className="h-4 w-4 shrink-0" />
                                                                </Link>
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 shrink-0" />
                                                                    </Button>
                                                                </AlertDialogTrigger>

                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            Hapus Log?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Log tanggal{" "}
                                                                            {format(
                                                                                new Date(log.date),
                                                                                "d MMMM yyyy",
                                                                                { locale: id }
                                                                            )} akan dihapus permanen.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>

                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Batal
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleDelete(log.id)
                                                                            }
                                                                            className="bg-destructive text-white"
                                                                        >
                                                                            Hapus
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Laravel Pagination */}
                                {logs.last_page > 1 && (
                                    <div className="mt-6">
                                        <Pagination>
                                            <PaginationContent>

                                                {/* Previous */}
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href={logs.prev_page_url ?? "#"}
                                                        className={!logs.prev_page_url ? "pointer-events-none opacity-50" : ""}
                                                    />
                                                </PaginationItem>

                                                {/* Page Numbers */}
                                                {logs.links
                                                    .filter((link) => !isNaN(Number(link.label)))
                                                    .map((link, index) => (
                                                        <PaginationItem key={index}>
                                                            <PaginationLink
                                                                href={link.url ?? "#"}
                                                                isActive={link.active}
                                                                className={!link.url ? "pointer-events-none opacity-50" : ""}
                                                            >
                                                                {link.label}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}

                                                {/* Next */}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        href={logs.next_page_url ?? "#"}
                                                        className={!logs.next_page_url ? "pointer-events-none opacity-50" : ""}
                                                    />
                                                </PaginationItem>

                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}

                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
