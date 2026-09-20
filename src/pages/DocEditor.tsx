import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocStore, useGoalStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Plus, Trash2, Link2, X, Save, Image, Code, List, CheckSquare, Quote, Minus } from 'lucide-react';
import type { DocBlock, Document } from '../store';

export default function DocEditor() {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const { documents, updateDocument, linkGoalToDoc, unlinkGoalFromDoc, spaces } = useDocStore();
  const { goals, linkDocToGoal, unlinkDocFromGoal } = useGoalStore();
  const [doc, setDoc] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<DocBlock[]>([]);
  const [showGoalPanel, setShowGoalPanel] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const saveTimer = useRef<any>(null);
  const lastSave = useRef<string>('');

  useEffect(() => {
    const found = documents.find(d => d.id === docId);
    if (found) {
      setDoc(found);
      setTitle(found.title);
      setBlocks(found.blocks.length > 0 ? found.blocks : [{ id: uuidv4(), type: 'paragraph', content: '' }]);
    }
  }, [docId, documents]);

  // Auto-save
  useEffect(() => {
    const current = JSON.stringify({ title, blocks });
    if (current === lastSave.current) return;
    
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (doc) {
        updateDocument(doc.id, { title, blocks });
        lastSave.current = current;
      }
    }, 1000);
  }, [title, blocks]);

  const addBlock = (afterId: string, type: DocBlock['type']) => {
    const newBlock: DocBlock = { id: uuidv4(), type, content: '' };
    if (type === 'task') newBlock.checked = false;
    const idx = blocks.findIndex(b => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(idx + 1, 0, newBlock);
    setBlocks(newBlocks);
    setShowBlockMenu(null);
  };

  const updateBlock = (id: string, data: Partial<DocBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(blockId, 'paragraph');
    }
    if (e.key === 'Backspace') {
      const block = blocks.find(b => b.id === blockId);
      if (block && block.content === '' && blocks.length > 1) {
        e.preventDefault();
        removeBlock(blockId);
      }
    }
  };

  const renderBlock = (block: DocBlock, index: number) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => updateBlock(block.id, { content: e.target.value }),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block.id),
      className: 'w-full bg-transparent outline-none resize-none text-gray-800',
      placeholder: getPlaceholder(block.type),
    };

    switch (block.type) {
      case 'heading1':
        return <input {...commonProps} className={`${commonProps.className} text-2xl font-bold`} />;
      case 'heading2':
        return <input {...commonProps} className={`${commonProps.className} text-xl font-semibold`} />;
      case 'heading3':
        return <input {...commonProps} className={`${commonProps.className} text-lg font-medium`} />;
      case 'paragraph':
        return <textarea {...commonProps} rows={1} style={{ minHeight: '24px' }} />;
      case 'list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">•</span>
            <textarea {...commonProps} rows={1} style={{ minHeight: '24px' }} />
          </div>
        );
      case 'task':
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={e => updateBlock(block.id, { checked: e.target.checked })}
              className="mt-1 rounded border-gray-300 text-indigo-600"
            />
            <textarea {...commonProps} rows={1} style={{ minHeight: '24px' }} className={`${commonProps.className} ${block.checked ? 'line-through text-gray-400' : ''}`} />
          </div>
        );
      case 'quote':
        return (
          <div className="border-l-4 border-indigo-300 pl-4 py-1">
            <textarea {...commonProps} rows={1} style={{ minHeight: '24px' }} className={`${commonProps.className} text-gray-600 italic`} />
          </div>
        );
      case 'code':
        return (
          <div className="bg-gray-900 rounded-lg p-4">
            <textarea {...commonProps} rows={3} className="w-full bg-transparent outline-none resize-none text-green-400 font-mono text-sm" placeholder="// 代码块" />
          </div>
        );
      case 'image':
        return (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">图片占位（{block.content || '未上传'}）</p>
            <input
              type="text"
              value={block.content}
              onChange={e => updateBlock(block.id, { content: e.target.value })}
              className="mt-2 w-full px-3 py-1 border border-gray-200 rounded text-sm"
              placeholder="输入图片URL"
            />
          </div>
        );
      case 'divider':
        return <hr className="border-gray-200 my-2" />;
      default:
        return <textarea {...commonProps} rows={1} />;
    }
  };

  const getPlaceholder = (type: string) => {
    const map: Record<string, string> = {
      heading1: '标题 1',
      heading2: '标题 2',
      heading3: '标题 3',
      paragraph: '输入内容，按 Enter 新建段落...',
      list: '列表项',
      task: '任务内容',
      quote: '引用内容',
      code: '// 输入代码',
      image: '图片描述',
    };
    return map[type] || '';
  };

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

  return (
    <div className="flex h-full">
      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          <button onClick={() => navigate(`/docs/${spaceId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回文档树
          </button>

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full text-3xl font-bold text-gray-900 outline-none mb-6 bg-transparent"
            placeholder="文档标题"
          />

          <div className="space-y-1">
            {blocks.map((block, index) => (
              <div key={block.id} className="group relative flex items-start gap-1">
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                  <button
                    onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                  {blocks.length > 1 && (
                    <button onClick={() => removeBlock(block.id)} className="p-0.5 hover:bg-red-50 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {renderBlock(block, index)}
                </div>

                {showBlockMenu === block.id && (
                  <div className="absolute left-8 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48">
                    <p className="text-xs text-gray-400 px-2 py-1">插入内容块</p>
                    {[
                      { type: 'heading1' as const, label: '标题 1', icon: 'H1' },
                      { type: 'heading2' as const, label: '标题 2', icon: 'H2' },
                      { type: 'heading3' as const, label: '标题 3', icon: 'H3' },
                      { type: 'paragraph' as const, label: '段落', icon: 'P' },
                      { type: 'list' as const, label: '无序列表', icon: '•' },
                      { type: 'task' as const, label: '任务复选框', icon: '☐' },
                      { type: 'quote' as const, label: '引用', icon: '"' },
                      { type: 'code' as const, label: '代码块', icon: '<>' },
                      { type: 'image' as const, label: '图片', icon: '🖼' },
                      { type: 'divider' as const, label: '分割线', icon: '—' },
                    ].map(item => (
                      <button
                        key={item.type}
                        onClick={() => addBlock(block.id, item.type)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                      >
                        <span className="w-6 text-center text-gray-400 font-mono text-xs">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => addBlock(blocks[blocks.length - 1]?.id || '', 'paragraph')}
            className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4" />
            添加内容块
          </button>
        </div>
      </div>

      {/* Goal Link Panel */}
      <div className="w-72 border-l border-gray-200 bg-white flex flex-col">
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
                      <span className="text-sm text-indigo-700 truncate">{g.name}</span>
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
