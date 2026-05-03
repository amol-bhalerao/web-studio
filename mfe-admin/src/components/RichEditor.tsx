import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Grid3x3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';

const TEXT_COLORS = [
  '#e2e8f0',
  '#fca5a5',
  '#fde047',
  '#86efac',
  '#7dd3fc',
  '#c4b5fd',
  '#fb923c',
  '#ffffff',
];

const HIGHLIGHTS = ['#713f12', '#14532d', '#1e3a5f', '#4c1d95', '#831843'];

/** Preserve inline width/height styles on images for layout control in articles. */
const RichImage = Image.extend({
  name: 'image',
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('style'),
        renderHTML: (attributes: Record<string, unknown>) => {
          const s = attributes.style as string | undefined | null;
          if (!s) return {};
          return { style: s };
        },
      },
    };
  },
}).configure({
  HTMLAttributes: {
    class: 'max-h-[min(480px,70vh)] w-auto max-w-full rounded-xl border border-slate-600 object-contain',
  },
});

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40',
        active && 'bg-indigo-600/40 text-white ring-1 ring-indigo-400/40'
      )}
    >
      {children}
    </button>
  );
}

export function RichEditor({
  value,
  onChange,
  disabled,
  placeholder = 'Write something beautiful…',
  uploadImage,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** When set, toolbar shows image upload that inserts &lt;img&gt; into the article body. */
  uploadImage?: (file: File) => Promise<string>;
}) {
  const imgInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-sky-300 underline underline-offset-2' },
      }),
      RichImage,
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: 'border-collapse border border-slate-600' },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[320px] px-3 py-3',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [editor, disabled]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL (https:// or /uploads/…)');
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  const onImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor || !uploadImage) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } finally {
        e.target.value = '';
      }
    },
    [editor, uploadImage]
  );

  if (!editor) return <div className="tiptap-shell animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-slate-500">Loading editor…</div>;

  return (
    <div className="tiptap-shell overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 ring-1 ring-slate-800/80">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-800 bg-slate-950/80 px-2 py-1.5">
        <ToolbarBtn
          title="Undo"
          disabled={disabled || !editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo"
          disabled={disabled || !editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarBtn>
        <span className="mx-1 h-6 w-px bg-slate-700" />
        <ToolbarBtn
          title="Bold"
          active={editor.isActive('bold')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive('italic')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor.isActive('underline')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Strike"
          active={editor.isActive('strike')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarBtn>
        <span className="mx-1 h-6 w-px bg-slate-700" />
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Quote"
          active={editor.isActive('blockquote')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive('bulletList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={editor.isActive('orderedList')}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Insert table"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Grid3x3 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Delete table"
          disabled={disabled || !editor.can().deleteTable()}
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <span className="text-[10px] font-bold text-rose-400">⌫⊞</span>
        </ToolbarBtn>
        <span className="mx-1 h-6 w-px bg-slate-700" />
        <ToolbarBtn title="Link" disabled={disabled} onClick={setLink}>
          <Link2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Image from URL" disabled={disabled} onClick={addImageByUrl}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarBtn>
        {uploadImage ? (
          <>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={disabled}
              onChange={(ev) => void onImageFile(ev)}
            />
            <ToolbarBtn
              title="Upload image into article"
              disabled={disabled}
              onClick={() => imgInputRef.current?.click()}
            >
              <span className="flex items-center gap-1 text-xs font-semibold">
                <ImageIcon className="h-4 w-4" /> Up
              </span>
            </ToolbarBtn>
          </>
        ) : null}
        <span className="flex flex-wrap items-center gap-0.5 border-l border-slate-700 pl-2">
          <span className="text-[10px] uppercase text-slate-500">Img</span>
          {(['100%', '75%', '50%', 'auto'] as const).map((w) => (
            <button
              key={w}
              type="button"
              title={`Image width ${w}`}
              disabled={disabled || !editor.isActive('image')}
              className="rounded px-1.5 py-1 text-[10px] font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-25"
              onClick={() => {
                if (w === 'auto') {
                  editor.chain().focus().updateAttributes('image', { style: null }).run();
                } else {
                  editor.chain().focus().updateAttributes('image', { style: `width: ${w}; height: auto;` }).run();
                }
              }}
            >
              {w}
            </button>
          ))}
        </span>
        <span className="mx-1 h-6 w-px bg-slate-700" />
        <span className="flex items-center gap-0.5 px-1" title="Text color">
          <Palette className="h-3.5 w-3.5 text-slate-500" />
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              title={`Color ${c}`}
              disabled={disabled}
              className="h-5 w-5 rounded border border-slate-600 ring-1 ring-slate-800"
              style={{ backgroundColor: c }}
              onClick={() => editor.chain().focus().setColor(c).run()}
            />
          ))}
          <button
            type="button"
            title="Default color"
            disabled={disabled}
            className="rounded px-1.5 text-[10px] text-slate-400 hover:bg-slate-700"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            reset
          </button>
        </span>
        <span className="flex items-center gap-0.5 px-1" title="Highlight">
          <Highlighter className="h-3.5 w-3.5 text-slate-500" />
          {HIGHLIGHTS.map((c) => (
            <button
              key={c}
              type="button"
              title="Highlight"
              disabled={disabled}
              className="h-5 w-5 rounded border border-white/10"
              style={{ backgroundColor: c }}
              onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
            />
          ))}
          <button
            type="button"
            title="Remove highlight"
            disabled={disabled}
            className="rounded px-1.5 text-[10px] text-slate-400 hover:bg-slate-700"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            clear
          </button>
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
