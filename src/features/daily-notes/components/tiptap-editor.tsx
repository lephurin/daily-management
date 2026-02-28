"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";

interface TiptapEditorProps {
  content?: string;
  onSave?: (content: { json: Record<string, unknown>; text: string }) => void;
}

export function TiptapEditor({ content, onSave }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "เริ่มเขียนบันทึกประจำวันของคุณ...",
      }),
    ],
    content: content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4",
      },
    },
  });

  const handleSave = () => {
    if (editor && onSave) {
      onSave({
        json: editor.getJSON() as Record<string, unknown>,
        text: editor.getText(),
      });
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent" : ""}
        >
          <strong>B</strong>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-accent" : ""}
        >
          <em>I</em>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""
          }
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""
          }
        >
          H3
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
        >
          • List
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
        >
          1. List
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
        >
          &ldquo; Quote
        </Button>
      </div>

      {/* Editor */}
      <div className="rounded-lg border">
        <EditorContent editor={editor} />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="sm">
          บันทึก
        </Button>
      </div>
    </div>
  );
}
