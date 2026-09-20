import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocStore } from '../store';
import { FileText, Folder, Plus, ChevronRight, ChevronDown, Trash2, ArrowLeft, GripVertical } from 'lucide-react';

interface TreeNodeProps {
  doc: any;
  documents: any[];
  spaceId: string;
  level: number;
  navigate: (path: string) => void;
  createDocument: (spaceId: string, parentId: string | null, isFolder: boolean, title: string) => string;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, data: any) => void;
  expanded: string[];
  toggleExpand: (id: string) => void;
}

function TreeNode({ doc, documents, spaceId, level, navigate, createDocument, deleteDocument, updateDocument, expanded, toggleExpand }: TreeNodeProps) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(doc.title);
  const [showActions, setShowActions] = useState(false);
  const children = documents.filter(d => d.parentId === doc.id && !d.deletedAt);
  const isExpanded = expanded.includes(doc.id);
  const hasChildren = children.length > 0;

  const handleClick = () => {
    if (doc.isFolder) {
      toggleExpand(doc.id);
    } else {
      navigate(`/docs/${spaceId}/${doc.id}`);
    }
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      updateDocument(doc.id, { title: editTitle.trim() });
    }
    setEditing(false);
  };

  const handleAddChild = (e: React.MouseEvent, isFolder: boolean) => {
    e.stopPropagation();
    const title = isFolder ? '新建文件夹' : '新建文档';
    createDocument(spaceId, doc.id, isFolder, title);
    if (!expanded.includes(doc.id)) toggleExpand(doc.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定删除？')) deleteDocument(doc.id);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-gray-100 group cursor-pointer`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </span>
        ) : <span className="w-4" />}
        
        {doc.isFolder ? (
          <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}

        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            onClick={e => e.stopPropagation()}
            className="flex-1 px-1 py-0.5 text-sm border border-indigo-300 rounded focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm text-gray-700 truncate">{doc.title}</span>
        )}

        {showActions && !editing && (
          <div className="flex items-center gap-0.5 ml-auto" onClick={e => e.stopPropagation()}>
            {!doc.isFolder && (
              <button
                onClick={() => navigate(`/docs/${spaceId}/${doc.id}`)}
                className="p-1 hover:bg-gray-200 rounded"
                title="编辑"
              >
                <FileText className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
            <button onClick={e => handleAddChild(e, false)} className="p-1 hover:bg-gray-200 rounded" title="新建文档">
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={e => handleAddChild(e, true)} className="p-1 hover:bg-gray-200 rounded" title="新建文件夹">
              <Folder className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={e => setEditing(true)} className="p-1 hover:bg-gray-200 rounded" title="重命名">
              <GripVertical className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button onClick={handleDelete} className="p-1 hover:bg-red-100 rounded" title="删除">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.id}
              doc={child}
              documents={documents}
              spaceId={spaceId}
              level={level + 1}
              navigate={navigate}
              createDocument={createDocument}
              deleteDocument={deleteDocument}
              updateDocument={updateDocument}
              expanded={expanded}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocSpace() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { spaces, documents, createDocument, deleteDocument, updateDocument } = useDocStore();
  const [expanded, setExpanded] = useState<string[]>([]);

  const space = spaces.find(s => s.id === spaceId);
  const rootDocs = documents.filter(d => d.spaceId === spaceId && d.parentId === null && !d.deletedAt);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateRoot = (isFolder: boolean) => {
    const title = isFolder ? '新建文件夹' : '新建文档';
    createDocument(spaceId!, null, isFolder, title);
  };

  if (!space) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">知识库不存在</p>
        <button onClick={() => navigate('/docs')} className="mt-4 text-indigo-600 hover:underline">返回</button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Document Tree Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button onClick={() => navigate('/docs')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            返回知识库
          </button>
          <h2 className="font-semibold text-gray-900">{space.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{space.description}</p>
        </div>

        <div className="p-2 border-b border-gray-100 flex gap-1">
          <button
            onClick={() => handleCreateRoot(false)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
          >
            <Plus className="w-3 h-3" />
            文档
          </button>
          <button
            onClick={() => handleCreateRoot(true)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
          >
            <Plus className="w-3 h-3" />
            文件夹
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {rootDocs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无文档</p>
          ) : (
            rootDocs.map(doc => (
              <TreeNode
                key={doc.id}
                doc={doc}
                documents={documents}
                spaceId={spaceId!}
                level={0}
                navigate={navigate}
                createDocument={createDocument}
                deleteDocument={deleteDocument}
                updateDocument={updateDocument}
                expanded={expanded}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">选择一个文档开始编辑</p>
          <p className="text-sm text-gray-400 mt-1">或创建新文档</p>
        </div>
      </div>
    </div>
  );
}
