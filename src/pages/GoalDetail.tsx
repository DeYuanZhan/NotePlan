import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGoalStore, useDocStore } from '../store';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, Link2, X, Trash2 } from 'lucide-react';
import type { GoalLevel, GoalStatus } from '../store';

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { goals, createGoal, updateGoal, deleteGoal, toggleGoalComplete, getGoalProgress, linkDocToGoal, unlinkDocFromGoal } = useGoalStore();
  const { documents } = useDocStore();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showAddChild, setShowAddChild] = useState<string | null>(null);
  const [newChild, setNewChild] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [showDocPanel, setShowDocPanel] = useState(false);

  const rootGoal = goals.find(g => g.id === goalId);
  if (!rootGoal) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">目标不存在</p>
        <button onClick={() => navigate('/goals')} className="mt-4 text-indigo-600 hover:underline">返回</button>
      </div>
    );
  }

  const getChildren = (parentId: string) => goals.filter(g => g.parentId === parentId);
  
  const getLevelLabel = (level: GoalLevel) => {
    const map: Record<GoalLevel, string> = { big: '大目标', phase: '阶段目标', small: '小目标', daily: '日目标', hourly: '小时目标' };
    return map[level];
  };

  const getLevelColor = (level: GoalLevel) => {
    const map: Record<GoalLevel, string> = {
      big: 'border-l-indigo-500 bg-indigo-50/50',
      phase: 'border-l-blue-500 bg-blue-50/50',
      small: 'border-l-green-500 bg-green-50/50',
      daily: 'border-l-amber-500 bg-amber-50/50',
      hourly: 'border-l-purple-500 bg-purple-50/50'
    };
    return map[level];
  };

  const getNextLevel = (level: GoalLevel): GoalLevel | null => {
    const map: Record<GoalLevel, GoalLevel | null> = { big: 'phase', phase: 'small', small: 'daily', daily: 'hourly', hourly: null };
    return map[level];
  };

  const handleAddChild = (parentId: string, parentLevel: GoalLevel) => {
    const nextLevel = getNextLevel(parentLevel);
    if (!nextLevel || !newChild.name.trim()) return;
    
    createGoal({
      userId: rootGoal.userId,
      level: nextLevel,
      parentId,
      name: newChild.name.trim(),
      description: newChild.description.trim(),
      startDate: newChild.startDate || new Date().toISOString().slice(0, 10),
      endDate: newChild.endDate || '',
      status: 'not_started' as GoalStatus,
      linkedDocIds: []
    });
    setNewChild({ name: '', startDate: '', endDate: '', description: '' });
    setShowAddChild(null);
    if (!expanded.includes(parentId)) setExpanded([...expanded, parentId]);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const linkedDocs = documents.filter(d => rootGoal.linkedDocIds.includes(d.id));
  const availableDocs = documents.filter(d => !rootGoal.linkedDocIds.includes(d.id) && !d.isFolder && !d.deletedAt);

  const GoalNode = ({ goal, depth = 0 }: { goal: any; depth?: number }) => {
    const children = getChildren(goal.id);
    const isExpanded = expanded.includes(goal.id);
    const progress = getGoalProgress(goal.id);
    const nextLevel = getNextLevel(goal.level);

    return (
      <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className={`border-l-4 ${getLevelColor(goal.level)} rounded-r-lg p-3 mb-2`}>
          <div className="flex items-center gap-2">
            {children.length > 0 && (
              <button onClick={() => toggleExpand(goal.id)} className="text-gray-400 hover:text-gray-600">
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {children.length === 0 && <span className="w-4" />}
            
            <button onClick={() => toggleGoalComplete(goal.id)}>
              {goal.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />
              )}
            </button>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {goal.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  {getLevelLabel(goal.level)}
                </span>
              </div>
              {goal.description && <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>}
              {(goal.startDate || goal.endDate) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {goal.startDate && goal.startDate.slice(0, 10)} ~ {goal.endDate && goal.endDate.slice(0, 10)}
                </p>
              )}
            </div>

            {children.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
            )}

            {nextLevel && (
              <button
                onClick={() => { setShowAddChild(showAddChild === goal.id ? null : goal.id); setNewChild({ name: '', startDate: '', endDate: '', description: '' }); }}
                className="p-1 hover:bg-white/80 rounded"
                title={`添加${getLevelLabel(nextLevel)}`}
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            )}

            <button
              onClick={() => { if (confirm('确定删除？')) deleteGoal(goal.id); }}
              className="p-1 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {showAddChild === goal.id && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">新建 {getLevelLabel(nextLevel!)}</p>
              <input
                type="text"
                value={newChild.name}
                onChange={e => setNewChild({ ...newChild, name: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="名称"
                autoFocus
              />
              <textarea
                value={newChild.description}
                onChange={e => setNewChild({ ...newChild, description: e.target.value })}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                rows={2}
                placeholder="描述（可选）"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="date"
                  value={newChild.startDate}
                  onChange={e => setNewChild({ ...newChild, startDate: e.target.value })}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={newChild.endDate}
                  onChange={e => setNewChild({ ...newChild, endDate: e.target.value })}
                  className="px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddChild(goal.id, goal.level)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                >
                  创建
                </button>
                <button
                  onClick={() => setShowAddChild(null)}
                  className="px-3 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {isExpanded && children.length > 0 && (
          <div className="mt-1">
            {children.map(child => (
              <GoalNode key={child.id} goal={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/goals')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        返回目标列表
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{rootGoal.name}</h1>
          <p className="text-gray-500 mt-1">{rootGoal.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span>{rootGoal.startDate} ~ {rootGoal.endDate}</span>
            <span>优先级: {rootGoal.priority || '-'}</span>
          </div>
        </div>
        <button
          onClick={() => setShowDocPanel(!showDocPanel)}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Link2 className="w-4 h-4" />
          关联笔记 ({rootGoal.linkedDocIds.length})
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">整体进度</span>
          <span className="text-sm font-bold text-indigo-600">{getGoalProgress(rootGoal.id)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${getGoalProgress(rootGoal.id)}%` }} />
        </div>
      </div>

      {/* Goal Tree */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">目标层级</h2>
        <GoalNode goal={rootGoal} />
      </div>

      {/* Doc Panel */}
      {showDocPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">关联笔记</h3>
              <button onClick={() => setShowDocPanel(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {linkedDocs.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">已关联</p>
                {linkedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg mb-2">
                    <Link to={`/docs/${doc.spaceId}/${doc.id}`} className="text-sm text-indigo-700 truncate hover:underline">
                      {doc.title}
                    </Link>
                    <button onClick={() => { unlinkDocFromGoal(rootGoal.id, doc.id); }}>
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {availableDocs.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">可关联</p>
                {availableDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => { linkDocToGoal(rootGoal.id, doc.id); }}
                    className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg truncate"
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
            )}

            {availableDocs.length === 0 && linkedDocs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">暂无可关联笔记</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
