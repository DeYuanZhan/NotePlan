import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDocStore, useGoalStore } from '../store';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Attachment } from '../extensions/AttachmentExtension';
import {
  ArrowLeft, Link2, X, Save, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Highlighter, Code, List, ListOrdered, CheckSquare,
  Quote, Minus, Heading1, Heading2, Heading3, Image as ImageIcon,
  Undo, Redo, AlignLeft, AlignCenter, AlignRight, Brain, Upload, FileText
} from 'lucide-react';
import MindMapPanel from '../components/MindMapPanel';

export default function DocEditor() {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument, linkGoalToDoc, unlinkGoalFromDoc } = useDocStore();
  const { goals, linkDocToGoal, unlinkDocFromGoal } = useGoalStore();
  const [doc, setDoc] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [showGoalPanel, setShowGoalPanel] = useState(false);
  const [showMindmap, setShowMindmap] = useState(false);
  const [mindmapData, setMindmapData] = useState('');
  const [saved, setSaved] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const saveTimer = useRef<any>(null);
  const lastContent = useRef<string>('');
  const dragCounter = useRef(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Placeholder.configure({ placeholder: '开始写作...' }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Attachment,
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      setSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        if (doc) {
          const content = editor.getHTML();
          updateDocument(doc.id, { content, title });
          lastContent.current = content;
          setSaved(true);
        }
      }, 1500);
    },
  });

  useEffect(() => {
    const found = documents.find(d => d.id === docId);
    if (found) {
      setDoc(found);
      setTitle(found.title);
      setMindmapData(found.mindmapData || '');
      if (editor && found.content) {
        editor.commands.setContent(found.content);
        lastContent.current = found.content;
      }
    }
  }, [docId, documents]);

  // Save title on change
  useEffect(() => {
    if (!doc || !editor) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      const content = editor.getHTML();
      updateDocument(doc.id, { content, title });
      setSaved(true);
    }, 1500);
  }, [title]);

  const handleSave = useCallback(() => {
    if (!doc || !editor) return;
    const content = editor.getHTML();
    updateDocument(doc.id, { content, title, mindmapData });
    setSaved(true);
  }, [doc, editor, title, mindmapData]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const addImage = () => {
    const url = window.prompt('输入图片URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    if (!editor) return;

    setUploading(true);
    try {
      // 检查文件类型
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.md') || 
                     file.name.endsWith('.markdown');
      const isDocument = file.type === 'application/msword' || 
                        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                        file.name.endsWith('.doc') || 
                        file.name.endsWith('.docx');

      if (isImage) {
        // 图片文件：转换为 base64 插入
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          editor.chain().focus().setImage({ src: base64, alt: file.name }).run();
          setUploading(false);
        };
        reader.onerror = () => {
          alert('图片读取失败');
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else if (isPdf || isDocument) {
        // PDF 或文档文件：使用自定义附件节点
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const fileSize = (file.size / 1024).toFixed(2);
          const fileType = isPdf ? 'PDF' : 'Word';
          
          // 使用自定义附件节点插入
          editor.chain().focus().insertContent({
            type: 'attachment',
            attrs: {
              fileName: file.name,
              fileSize: fileSize,
              fileType: fileType,
              fileData: base64,
              mimeType: file.type
            }
          }).run();
          setUploading(false);
        };
        reader.onerror = () => {
          alert('文件读取失败');
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else if (isText) {
        // 文本文件：读取内容插入
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const codeBlockHtml = `<pre><code>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
          editor.chain().focus().insertContent(codeBlockHtml).run();
          setUploading(false);
        };
        reader.onerror = () => {
          alert('文件读取失败');
          setUploading(false);
        };
        reader.readAsText(file);
      } else {
        alert('不支持的文件类型');
        setUploading(false);
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败');
      setUploading(false);
    }
  }, [editor]);

  // 处理多个文件
  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file, index) => {
      setTimeout(() => handleFileUpload(file), index * 100);
    });
  }, [handleFileUpload]);

  // 拖拽事件处理
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [handleFiles]);

  // 粘贴事件处理
  useEffect(() => {
    if (!editor) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, handleFiles]);

  const linkedGoals = goals.filter(g => doc?.linkedGoalIds.includes(g.id));
  const availableGoals = goals.filter(g => !doc?.linkedGoalIds.includes(g.id));

  const handleLinkGoal = (goalId: string) => {
    if (doc) {
      linkGoalToDoc(doc.id, goalId);
      linkDocToGoal(goalId, doc.id);
    }
  };

  const handleUnlinkGoal = (goalId: string) => {
    if (doc) {
      unlinkGoalFromDoc(doc.id, goalId);
      unlinkDocFromGoal(goalId, doc.id);
    }
  };

  if (!doc) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">文档不存在</p>
        <button onClick={() => navigate(`/docs/${spaceId}`)} className="mt-4 text-indigo-600 hover:underline">返回</button>
      </div>
    );
  }

  if (!editor) return null;

  return (
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(`/docs/${spaceId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex items-center gap-2">
              {saved ? (
                <span className="text-xs text-green-600">已保存</span>
              ) : (
                <span className="text-xs text-amber-600">保存中...</span>
              )}
              <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
                <Save className="w-3 h-3" />
                保存
              </button>
            </div>
          </div>
          
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-0.5 flex-wrap">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
              <Redo className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="标题1">
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="标题2">
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="标题3">
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="粗体">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下划线">
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="高亮">
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="行内代码">
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="任务列表">
              <CheckSquare className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="代码块">
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="左对齐">
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="居中">
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="右对齐">
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={addImage} title="插入图片">
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*,.pdf,.doc,.docx,.txt,.md,.markdown';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  handleFiles(files);
                }
              };
              input.click();
            }} title="上传文件">
              <Upload className="w-4 h-4" />
            </ToolbarButton>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => setShowMindmap(!showMindmap)} active={showMindmap} title="思维导图">
              <Brain className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Title & Content */}
        <div 
          className="flex-1 overflow-auto bg-white relative"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* 拖拽上传提示层 */}
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-indigo-50/95 backdrop-blur-sm flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4">
                  <Upload className="w-10 h-10 text-indigo-600 animate-bounce" />
                </div>
                <p className="text-xl font-semibold text-indigo-700 mb-2">释放文件以上传</p>
                <p className="text-sm text-indigo-500">支持图片、PDF、文档、文本文件</p>
              </div>
            </div>
          )}

          {/* 上传中提示 */}
          {uploading && (
            <div className="absolute top-4 right-4 z-40 bg-white border border-indigo-200 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-indigo-700 font-medium">正在上传文件...</span>
            </div>
          )}

          <div className="max-w-4xl mx-auto py-8 px-8">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-3xl font-bold text-gray-900 outline-none mb-6 bg-transparent placeholder-gray-300"
              placeholder="文档标题"
            />
            <EditorContent editor={editor} />
            
            {/* 拖拽上传提示（空文档时显示） */}
            {editor.isEmpty && !isDragging && (
              <div className="mt-8 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">拖拽文件到此处上传</p>
                <p className="text-sm text-gray-400">支持图片、PDF、Word、文本文件</p>
                <p className="text-xs text-gray-400 mt-2">也可以直接粘贴图片 (Ctrl+V)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mindmap Panel */}
      {showMindmap && (
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              思维导图
            </h3>
            <button onClick={() => setShowMindmap(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <MindMapPanel
            data={mindmapData}
            onChange={setMindmapData}
            onSave={() => {
              if (doc) {
                updateDocument(doc.id, { mindmapData });
                setSaved(true);
              }
            }}
          />
        </div>
      )}

      {/* Goal Link Panel */}
      <div className="w-64 border-l border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => setShowGoalPanel(!showGoalPanel)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            <Link2 className="w-4 h-4" />
            关联目标 ({linkedGoals.length})
          </button>
        </div>

        {showGoalPanel && (
          <div className="flex-1 overflow-auto p-4">
            {linkedGoals.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">已关联</p>
                <div className="space-y-2">
                  {linkedGoals.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                      <Link to={`/goals/${g.id}`} className="text-sm text-indigo-700 truncate hover:underline flex-1">
                        {g.name}
                      </Link>
                      <button onClick={() => handleUnlinkGoal(g.id)}>
                        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableGoals.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">可关联</p>
                <div className="space-y-1">
                  {availableGoals.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleLinkGoal(g.id)}
                      className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg truncate"
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {availableGoals.length === 0 && linkedGoals.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无可关联目标</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ children, onClick, active, disabled, title }: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'}`}
    >
      {children}
    </button>
  );
}
