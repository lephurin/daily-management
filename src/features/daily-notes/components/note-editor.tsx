"use client";

import { useState, useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface NoteEditorProps {
  content?: string | Record<string, unknown>;
  editable?: boolean;
  onSave?: (content: {
    json: Record<string, unknown>;
    text: string;
  }) => Promise<boolean | void> | void;
}

export function NoteEditor({
  content,
  editable = true,
  onSave,
}: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const [initialContent, setInitialContent] = useState<
    "loading" | "ready" | "error"
  >("loading");

  // Creates a new editor instance. We use useCreateBlockNote so it only creates once
  // but we provide an async initialContent function to load the data safely.
  const editor = useCreateBlockNote();

  useEffect(() => {
    async function loadInitialHTML() {
      if (!content) {
        setInitialContent("ready");
        return;
      }

      try {
        let htmlStringToParse = "";

        // 1. If it's already a string, assume it might be HTML or JSON string
        if (typeof content === "string") {
          try {
            // Try parsing if it's old JSON string
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === "object") {
              // Convert old JSON to HTML roughly or just insert as text if we can't
              // BlockNote can't natively understand random JSON, but it CAN understand HTML
              htmlStringToParse = parsed.content
                ? JSON.stringify(parsed) // Fallback: just stringify it
                : content;
            }
          } catch {
            // It's a plain string or HTML string
            htmlStringToParse = content;
          }
        }
        // 2. If it's an object (old JSON format from DB or new BlockNote format)
        else if (typeof content === "object" && content !== null) {
          // Check if it's the new BlockNote JSON format we just saved
          if (
            "blocks" in content &&
            Array.isArray((content as Record<string, unknown>).blocks)
          ) {
            editor.replaceBlocks(
              editor.document,
              (content as Record<string, unknown>).blocks as PartialBlock[],
            );
            setInitialContent("ready");
            return;
          }

          // Fallback: It's an old JSON object.
          // Convert to string so we don't lose the raw text, since BlockNote
          // doesn't natively parse old abstract syntax tree.
          htmlStringToParse = JSON.stringify(content);
        }

        if (htmlStringToParse) {
          const blocks = await editor.tryParseHTMLToBlocks(htmlStringToParse);
          editor.replaceBlocks(editor.document, blocks);
        }
        setInitialContent("ready");
      } catch (err) {
        console.error("Failed to load initial content to BlockNote:", err);
        setInitialContent("error");
      }
    }

    loadInitialHTML();
  }, [content, editor]);

  const handleSave = async () => {
    if (onSave && editor) {
      // Get the document blocks and plain text
      const blocks = editor.document;
      const text = await editor.blocksToMarkdownLossy(blocks);

      await onSave({
        json: { blocks } as Record<string, unknown>, // Store blocks wrapping object
        text: text,
      });
    }
  };

  if (initialContent === "loading") {
    return (
      <div className="p-4 text-sm text-muted-foreground animate-pulse">
        กำลังโหลดตัวจัดการบันทึก...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-0 rounded-lg border overflow-hidden",
        !editable && "opacity-90",
      )}
    >
      {/* Editor */}
      <div className="py-4 [&_.bn-container]:!bg-transparent [&_.bn-editor]:!bg-transparent">
        <BlockNoteView
          editor={editor}
          editable={editable}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          className="min-h-[300px]"
        />
      </div>

      {/* Save Menu */}
      {editable && (
        <div className="flex justify-end border-t bg-muted/30 px-3 py-2">
          <Button onClick={handleSave} size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            บันทึกการแก้ไข
          </Button>
        </div>
      )}
    </div>
  );
}
