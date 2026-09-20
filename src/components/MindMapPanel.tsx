import { useState, useEffect, useRef, useCallback } from 'react';
import { Markmap } from 'markmap-view';
import { Plus, Trash2, Save, Edit3, Check, X } from 'lucide-react';

interface MindMapNode {
  content: string;
  children?: MindMapNode[];
}

interface Props {
  data: string;
  onChange: (data: string) => void;
  onSave: () => void;
}

export default function MindMapPanel({ data, onChange, onSave }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [textData, setTextData] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [tree, setTree] = useState<MindMapNode>({ content: '中心主题', children: [] });

  // Parse data on load
  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.content) {
          setTree(parsed);
        }
      } catch {
        setTree({ content: '中心主题', children: [] });
      }
    }
  }, []);

  // Safe destroy helper
  const destroyMarkmap = useCallback(() => {
    // Clear any pending timers
    if (fitTimerRef.current) {
      clearTimeout(fitTimerRef.current);
      fitTimerRef.current = null;
    }
    
    // Safely destroy markmap instance
    if (mmRef.current) {
      try {
        mmRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors - SVG might already be removed
        console.debug('Markmap destroy error (expected):', e);
      }
      mmRef.current = null;
    }
  }, []);

  // Create/update markmap when tree changes (only when not in edit mode)
  useEffect(() => {
    if (editMode) return;
    
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // Destroy existing instance before creating new one
    destroyMarkmap();

    try {
      const mm = Markmap.create(svgEl, {
        autoFit: true,
        duration: 300,
        maxWidth: 200,
        spacingHorizontal: 80,
        spacingVertical: 16,
      }, tree as any);
      
      mmRef.current = mm;

      // Schedule fit after render
      fitTimerRef.current = setTimeout(() => {
        if (mmRef.current) {
          try {
            mmRef.current.fit();
          } catch (e) {
            console.debug('Markmap fit error:', e);
          }
        }
      }, 150);
    } catch (e) {
      console.error('Markmap create error:', e);
      mmRef.current = null;
    }

    // Cleanup on unmount or dependency change
    return () => {
      destroyMarkmap();
    };
  }, [tree, editMode, destroyMarkmap]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      destroyMarkmap();
    };
  }, [destroyMarkmap]);

  const saveTree = useCallback((newTree: MindMapNode) => {
    setTree(newTree);
    onChange(JSON.stringify(newTree));
  }, [onChange]);

  const addChild = (pathStr: string) => {
    const path = pathStr === '' ? [] : pathStr.split(',').map(Number);
    const newTree = JSON.parse(JSON.stringify(tree));
    let node: MindMapNode = newTree;
    for (const idx of path) {
      if (!node.children) node.children = [];
      node = node.children[idx];
    }
    if (!node.children) node.children = [];
    node.children.push({ content: '新节点', children: [] });
    saveTree(newTree);
  };

  const deleteNode = (pathStr: string) => {
    if (pathStr === '') return;
    const path = pathStr.split(',').map(Number);
    if (path.length === 0) return;
    const newTree = JSON.parse(JSON.stringify(tree));
    const parentPath = path.slice(0, -1);
    let parent: MindMapNode = newTree;
    for (const idx of parentPath) {
      parent = parent.children![idx];
    }
    parent.children!.splice(path[path.length - 1], 1);
    saveTree(newTree);
  };

  const updateNodeContent = (pathStr: string, content: string) => {
    const path = pathStr === '' ? [] : pathStr.split(',').map(Number);
    const newTree = JSON.parse(JSON.stringify(tree));
    let node: MindMapNode = newTree;
    for (const idx of path) {
      node = node.children![idx];
    }
    node.content = content;
    saveTree(newTree);
  };

  const handleTextSave = () => {
    const lines = textData.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      setEditMode(false);
      return;
    }
    
    const root: MindMapNode = { content: '', children: [] };
    const stack: { node: MindMapNode; level: number }[] = [{ node: root, level: -1 }];
    
    for (const line of lines) {
      const indent = line.search(/\S/);
      const content = line.trim().replace(/^[-*#•]\s*/, '');
      const newNode: MindMapNode = { content };
      
      while (stack.length > 1 && stack[stack.length - 1].level >= indent) {
        stack.pop();
      }
      
      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level: indent });
    }
    
    if (root.children && root.children.length > 0) {
      if (root.children.length === 1) {
        saveTree({ content: root.children[0].content, children: root.children[0].children || [] });
      } else {
        saveTree({ content: '中心主题', children: root.children });
      }
    }
    setEditMode(false);
  };

  const renderTreeNode = (node: MindMapNode, pathStr: string, depth: number = 0) => {
    const isEditing = editingPath === pathStr;
    
    return (
      <div key={pathStr || 'root'} style={{ marginLeft: `${depth * 16}px` }}>
        <div className="flex items-center gap-1 py-1 group">
          <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    updateNodeContent(pathStr, editText);
                    setEditingPath(null);
                  }
                  if (e.key === 'Escape') setEditingPath(null);
                }}
                className="flex-1 px-2 py-0.5 border border-indigo-300 rounded text-sm focus:outline-none"
                autoFocus
              />
              <button onClick={() => { updateNodeContent(pathStr, editText); setEditingPath(null); }} className="p-0.5 hover:bg-green-100 rounded">
                <Check className="w-3 h-3 text-green-600" />
              </button>
              <button onClick={() => setEditingPath(null)} className="p-0.5 hover:bg-red-100 rounded">
                <X className="w-3 h-3 text-red-500" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm text-gray-700 truncate">{node.content}</span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                <button onClick={() => addChild(pathStr)} className="p-0.5 hover:bg-indigo-100 rounded" title="添加子节点">
                  <Plus className="w-3 h-3 text-indigo-500" />
                </button>
                <button
                  onClick={() => { setEditingPath(pathStr); setEditText(node.content); }}
                  className="p-0.5 hover:bg-blue-100 rounded"
                  title="编辑"
                >
                  <Edit3 className="w-3 h-3 text-blue-500" />
                </button>
                {pathStr !== '' && (
                  <button onClick={() => deleteNode(pathStr)} className="p-0.5 hover:bg-red-100 rounded" title="删除">
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
        {node.children?.map((child, idx) => {
          const childPath = pathStr === '' ? `${idx}` : `${pathStr},${idx}`;
          return renderTreeNode(child, childPath, depth + 1);
        })}
      </div>
    );
  };

  const nodeToText = (node: MindMapNode, depth: number = 0): string => {
    let result = '  '.repeat(depth) + node.content + '\n';
    if (node.children) {
      for (const child of node.children) {
        result += nodeToText(child, depth + 1);
      }
    }
    return result;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* SVG container - always rendered, hidden with CSS when in edit mode */}
      <div 
        className="flex-1 bg-gray-50 p-2 overflow-hidden min-h-[250px] relative"
        style={{ display: editMode ? 'none' : 'block' }}
      >
        <svg ref={svgRef} className="w-full h-full" style={{ minHeight: '250px' }} />
      </div>

      {/* Edit mode - always rendered, hidden with CSS when not in edit mode */}
      <div 
        className="flex-1 flex flex-col p-3"
        style={{ display: editMode ? 'flex' : 'none' }}
      >
        <p className="text-xs text-gray-500 mb-2">使用缩进表示层级（空格或Tab）</p>
        <textarea
          value={textData}
          onChange={e => setTextData(e.target.value)}
          className="flex-1 w-full p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder={'中心主题\n  子主题1\n    子子主题\n  子主题2'}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleTextSave}
            className="flex-1 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            应用
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="flex-1 py-1.5 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <div className="overflow-auto max-h-[200px] border border-gray-100 rounded-lg p-2 bg-white">
          {renderTreeNode(tree, '')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { 
              if (!editMode) {
                setTextData(nodeToText(tree));
              }
              setEditMode(!editMode); 
            }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-50"
          >
            <Edit3 className="w-3 h-3" />
            {editMode ? '预览' : '文本编辑'}
          </button>
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Save className="w-3 h-3" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
