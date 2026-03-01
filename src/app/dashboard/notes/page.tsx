"use client";

import { useState } from "react";
import { TiptapEditor } from "@/features/daily-notes/components/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDailyNoteQuery,
  useDailyNotesHistoryQuery,
  useSaveDailyNoteMutation,
} from "@/features/dashboard/hooks/api-hooks";
import { DailyNote } from "@/features/daily-notes/types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { FileText } from "lucide-react";

type ViewMode = "editor" | "history";

export default function DailyNotesPage() {
  const today = new Date().toISOString().split("T")[0];
  const [noteDate, setNoteDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);

  const isPastDate = noteDate < today;

  // History state
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

  const [filterFrom, setFilterFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [filterTo, setFilterTo] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: noteData, isLoading: loading } = useDailyNoteQuery(noteDate);
  const { data: historyData, isLoading: historyLoading } =
    useDailyNotesHistoryQuery(filterFrom, filterTo, viewMode === "history");

  const saveNoteMutation = useSaveDailyNoteMutation();

  const historyNotes: DailyNote[] = historyData || [];
  const existingContent = noteData?.content
    ? JSON.stringify(noteData.content)
    : undefined;

  const handleSave = async (content: {
    json: Record<string, unknown>;
    text: string;
  }): Promise<boolean> => {
    try {
      await saveNoteMutation.mutateAsync({
        noteDate: noteDate,
        title: `Daily Note - ${noteDate}`,
        content: content.json,
        plainText: content.text,
      });
      toast.success("บันทึกสำเร็จ!", {
        description: `บันทึกวันที่ ${noteDate} เรียบร้อย`,
      });
      setIsEditing(false); // Switch back to view mode
      return true;
    } catch (error) {
      toast.error("บันทึกไม่สำเร็จ", {
        description:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
      return false;
    }
  };

  const handleOpenNote = (date: string) => {
    setNoteDate(date);
    setViewMode("editor");
    setIsEditing(false); // Always open in View mode
  };

  // Filter history by search
  const filteredNotes = historyNotes.filter((note) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.plain_text.toLowerCase().includes(q)
    );
  });

  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Daily Notes</h2>
          <p className="text-sm text-muted-foreground">บันทึกประจำวันของคุณ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "editor" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("editor")}
          >
            ✏️ เขียน
          </Button>
          <Button
            variant={viewMode === "history" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("history")}
          >
            📋 ประวัติ
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "editor" ? (
          <motion.div
            key="editor-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3 mb-4">
              <div className="text-sm text-muted-foreground">
                📅 วันที่:{" "}
                <span className="font-medium text-foreground">
                  {new Date(noteDate).toLocaleDateString("th-TH", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {isPastDate && (
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                    บันทึกเก่า
                  </span>
                )}
              </div>

              {!isPastDate && (
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "❌ ยกเลิกแก้ไข" : "✏️ แก้ไขบันทึก"}
                </Button>
              )}
            </div>

            {/* Editor Section */}
            {loading ? (
              <div className="flex flex-col gap-4 py-8">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <TiptapEditor
                key={noteDate + (existingContent ? "hasContent" : "empty")}
                content={existingContent}
                editable={isEditing}
                onSave={handleSave}
              />
            )}
            {saveNoteMutation.isPending && (
              <p className="mt-2 text-sm text-muted-foreground">
                กำลังบันทึก...
              </p>
            )}
          </motion.div>
        ) : (
          /* History View */
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  จากวันที่
                </label>
                <Input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  ถึงวันที่
                </label>
                <Input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  ค้นหา
                </label>
                <Input
                  placeholder="ค้นหาจากชื่อหรือเนื้อหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            {historyLoading ? (
              <div className="flex flex-col gap-4 py-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  ไม่พบบันทึกในช่วงเวลาที่เลือก
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">วันที่</TableHead>
                      <TableHead>ชื่อบันทึก</TableHead>
                      <TableHead className="hidden md:table-cell">
                        ตัวอย่างเนื้อหา
                      </TableHead>
                      <TableHead className="w-[160px]">อัปเดตล่าสุด</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">
                          {new Date(note.note_date).toLocaleDateString(
                            "th-TH",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell>{note.title}</TableCell>
                        <TableCell className="hidden max-w-[250px] truncate text-muted-foreground md:table-cell">
                          {note.plain_text?.slice(0, 80) || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(note.updated_at).toLocaleString("th-TH", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenNote(note.note_date)}
                          >
                            เปิด
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              แสดง {filteredNotes.length} รายการ
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
