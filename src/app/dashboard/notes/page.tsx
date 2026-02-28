"use client";

import { useState } from "react";
import { TiptapEditor } from "@/features/daily-notes/components/tiptap-editor";
import { saveDailyNote } from "@/features/daily-notes/services/daily-notes-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DailyNotesPage() {
  const today = new Date().toISOString().split("T")[0];
  const [noteDate, setNoteDate] = useState(today);
  const [saving, setSaving] = useState(false);

  const handleSave = async (content: {
    json: Record<string, unknown>;
    text: string;
  }) => {
    setSaving(true);
    try {
      await saveDailyNote({
        noteDate,
        title: `Daily Note - ${noteDate}`,
        content: content.json,
        plainText: content.text,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    window.open(`/api/export?date=${noteDate}`, "_blank");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Daily Notes</h2>
          <p className="text-sm text-muted-foreground">บันทึกประจำวันของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            📥 Export Excel
          </Button>
        </div>
      </div>

      <TiptapEditor onSave={handleSave} />
      {saving && (
        <p className="text-sm text-muted-foreground">กำลังบันทึก...</p>
      )}
    </div>
  );
}
