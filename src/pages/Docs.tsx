import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocStore } from '../store';
import { Plus, BookOpen, Trash2, Edit2, FolderOpen } from 'lucide-react';

export default function Docs() {
  const { spaces, documents, createSpace, deleteSpace, updateSpace, restoreDocument, permanentDelete } = useDocStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createSpace(newName.trim(), newDesc.trim());
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定删除该知识库？所有文档将被一并删除。')) {
      deleteSpace(id);
    }
  };

  const handleEdit = (id: string) => {
    if (editName.trim()) {
      updateSpace(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const deletedDocs = documents.filter(d => d.deletedAt);

  const getDocCount = (spaceId: string) => {
    return documents.filter(d => d.spaceId === spaceId && !d.deletedAt && !d.isFolder).length;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
          <p className="text-gray-500 mt-1">管理你的个人知识库空间</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRecycleBin(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4" />
            回收站 ({deletedDocs.length})
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            新建知识库
          </button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">新建知识库</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="知识库名称"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="知识库描述（可选）"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Space Cards */}
      {spaces.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">还没有知识库</p>
          <p className="text-sm text-gray-400 mt-1">创建一个知识库开始记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map(space => (
            <div
              key={space.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/docs/${space.id}`)}
            >
              <div className="h-24 bg-gradient-to-br from-indigo-400 to-purple-500 relative">
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={e => { e.stopPropagation(); setEditingId(space.id); setEditName(space.name); }}
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
                    title="编辑"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button
                    onClick={e => handleDelete(space.id, e)}
                    className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                {editingId === space.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleEdit(space.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleEdit(space.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="w-full px-2 py-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                ) : (
                  <h3 className="font-semibold text-gray-900">{space.name}</h3>
                )}
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{space.description || '暂无描述'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{getDocCount(space.id)} 篇文档</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
