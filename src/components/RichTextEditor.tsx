import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from './ui/button';
import { Bold, Italic, List, Heading, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export const RichTextEditor = ({ content, onChange, editable = true }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    if (!editable) return null;

    return (
      <div className="border-b p-2 mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
        >
          <Heading className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="border rounded-md">
      <MenuBar />
      <div className={`p-4 ${editable ? 'prose-editable' : 'prose'} max-w-none`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};