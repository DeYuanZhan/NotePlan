import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocStore } from '../store';
import { FileText, Folder, Plus, ChevronRight, ChevronDown, Trash2, ArrowLeft, Edit3, FolderInput } from 'lucide-react';

export default function DocSpace() {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { spaces, documents, createDocument, deleteDocument, updateDocument, restoreDocument, permanentDelete } = useDocStore();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [movingDocId, setMovingDocId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const space = spaces.find(s => s.id === spaceId);
  const spaceDocs = documents.filter(d => d.spaceId === spaceId);
  const rootDocs = spaceDocs.filter(d => d.parentId === null && !d.deletedAt);
  const deletedDocs = spaceDocs.filter(d => d.deletedAt);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateDoc = (parentId: string | null, isFolder: boolean) => {
    const title = isFolder ? '新建文件夹' : '新建文档';
    const newId = createDocument(spaceId!, parentId, isFolder, title);
    if (!isFolder) {
      navigate(`/docs/${spaceId}/${newId}`);
    }
    if (parentId && !expanded.includes(parentId)) {
      setExpanded(prev => [...prev, parentId]);
    }
  };

  const handleDelete = useCallback((id: string) => {
    if (confirm('确定删除？文档将移入回收站。')) {
      deleteDocument(id);
    }
  }, [deleteDocument]);

  const handleRename = useCallback((id: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateDocument(id, { title: newTitle.trim() });
    }
    setRenamingId(null);
  }, [updateDocument]);

  const handleMove = useCallback((docId: string, newParentId: string | null) => {
    updateDocument(docId, { parentId: newParentId });
    setShowMoveModal(false);
    setMovingDocId(null);
  }, [updateDocument]);

  const getChildren = (parentId: string) => spaceDocs.filter(d => d.parentId === parentId && !d.deletedAt);

  const TreeNode = ({ doc, level }: { doc: any; level: number }) => {
    const children = getChildren(doc.id);
    const isExpanded = expanded.includes(doc.id);
    const isRenaming = renamingId === doc.id;

    const handleClick = () => {
      if (doc.isFolder) {
        toggleExpand(doc.id);
      } else {
        navigate(`/docs/${spaceId}/${doc.id}`);
      }
    };

    return (
      <div>
        <div
          className="flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-gray-100 group cursor-pointer"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {children.length > 0 ? (
            <button onClick={() => toggleExpand(doc.id)} className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          ) : <span className="w-4" />}
          
          {doc.isFolder ? (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
          )}

          {isRenaming ? (
            <input
              type="text"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => handleRename(doc.id, renameValue)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename(doc.id, renameValue);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              onClick={e => e.stopPropagation()}
              className="flex-1 px-1 py-0.5 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-sm text-gray-700 truncate cursor-pointer" onClick={handleClick}>
              {doc.title}
            </span>
          )}

          <div className="flex items-center gap-0.5">
            <button
              onClick={e => { e.stopPropagation(); setRenamingId(doc.id); setRenameValue(doc.title); }}
              className="p-1 hover:bg-gray-200 rounded"
              title="重命名"
            >
              <Edit3 className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setMovingDocId(doc.id); setShowMoveModal(true); }}
              className="p-1 hover:bg-gray-200 rounded"
              title="移动"
            >
              <FolderInput className="w-3 h-3 text-gray-500" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleDelete(doc.id); }}
              className="p-1 hover:bg-red-100 rounded"
              title="删除"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>
        </div>

        {isExpanded && children.length > 0 && (
          <div>
            {children.map(child => (
              <TreeNode key={child.id} doc={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
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
          {space.description && <p className="text-xs text-gray-500 mt-0.5">{space.description}</p>}
        </div>

        <div className="p-2 border-b border-gray-100 flex gap-1">
          <button
            onClick={() => handleCreateDoc(null, false)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
          >
            <Plus className="w-3 h-3" />
            文档
          </button>
          <button
            onClick={() => handleCreateDoc(null, true)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
          >
            <Plus className="w-3 h-3" />
            文件夹
          </button>
          <button
            onClick={() => setShowRecycleBin(true)}
            className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="回收站"
          >
            <Trash2 className="w-3 h-3" />
            {deletedDocs.length > 0 && <span>{deletedDocs.length}</span>}
          </button>
        </div>

        <div className="flex-1 overflow-auto p-2">
          {rootDocs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无文档<br />点击上方按钮创建</p>
          ) : (
            rootDocs.map(doc => (
              <TreeNode key={doc.id} doc={doc} level={0} />
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">选择一个文档开始编辑</p>
          <p className="text-sm text-gray-400 mt-1">或在左侧创建新文档</p>
        </div>
      </div>

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto">
            <h3 className="text-lg font-semibold mb-4">回收站</h3>
            {deletedDocs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">回收站为空</p>
            ) : (
              <div className="space-y-2">
                {deletedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-400">删除于 {new Date(doc.deletedAt!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreDocument(doc.id)}
                        className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100"
                      >
                        恢复
                      </button>
                      <button
                        onClick={() => { if (confirm('确定永久删除？')) permanentDelete(doc.id); }}
                        className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                      >
                        永久删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowRecycleBin(false)}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && movingDocId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">移动到</h3>
            <div className="space-y-1 max-h-60 overflow-auto">
              <button
                onClick={() => handleMove(movingDocId, null)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
              >
                📁 根目录
              </button>
              {spaceDocs.filter(d => !d.deletedAt && d.isFolder && d.id !== movingDocId).map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMove(movingDocId, folder.id)}
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                >
                  📁 {folder.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowMoveModal(false); setMovingDocId(null); }}
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
