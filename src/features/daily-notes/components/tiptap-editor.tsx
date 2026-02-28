"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

function ToolbarButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-2.5 text-xs font-semibold",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          : "text-foreground hover:bg-accent",
      )}
    >
      {children}
    </Button>
  );
}

interface TiptapEditorProps {
  content?: string;
  editable?: boolean;
  onSave?: (content: {
    json: Record<string, unknown>;
    text: string;
  }) => Promise<boolean | void> | void;
}

export function TiptapEditor({
  content,
  editable = true,
  onSave,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "เริ่มเขียนบันทึกประจำวันของคุณ...",
      }),
    ],
    content: content ? JSON.parse(content) : "",
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4",
      },
    },
  });

  useEffect(() => {
    if (editor && editable !== editor.isEditable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  const handleSave = async () => {
    if (editor && onSave) {
      await onSave({
        json: editor.getJSON() as Record<string, unknown>,
        text: editor.getText(),
      });
      // Do not clear content after save, just persist
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-0 rounded-lg border overflow-hidden">
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-1 bg-muted/60 border-b px-3 py-2">
          <ToolbarButton
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>

          <div className="mx-1 w-px bg-border" />

          <ToolbarButton
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            H3
          </ToolbarButton>

          <div className="mx-1 w-px bg-border" />

          <ToolbarButton
            isActive={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            ❝ Quote
          </ToolbarButton>
        </div>
      )}

      {/* Editor */}
      <div className={cn("bg-card", !editable && "opacity-90")}>
        <EditorContent editor={editor} />
      </div>

      {/* Save */}
      {editable && (
        <div className="flex justify-end border-t bg-muted/30 px-3 py-2">
          <Button onClick={handleSave} size="sm">
            💾 บันทึกการแก้ไข
          </Button>
        </div>
      )}
    </div>
  );
}
