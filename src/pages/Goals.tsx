import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoalStore, useAuthStore } from '../store';
import { Plus, Target, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import type { GoalStatus } from '../store';

export default function Goals() {
  const { goals, createGoal, deleteGoal, getGoalProgress } = useGoalStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 3
  });

  const bigGoals = goals.filter(g => g.level === 'big' && g.userId === currentUser?.id);

  const handleCreate = () => {
    if (!newGoal.name.trim()) return;
    createGoal({
      userId: currentUser?.id || '',
      level: 'big',
      parentId: null,
      name: newGoal.name.trim(),
      description: newGoal.description.trim(),
      startDate: newGoal.startDate || new Date().toISOString().slice(0, 10),
      endDate: newGoal.endDate || '',
      status: 'in_progress' as GoalStatus,
      priority: newGoal.priority,
      linkedDocIds: []
    });
    setNewGoal({ name: '', description: '', startDate: '', endDate: '', priority: 3 });
    setShowCreate(false);
  };

  const getStatusColor = (status: GoalStatus) => {
    const map: Record<GoalStatus, string> = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      delayed: 'bg-red-100 text-red-700',
      archived: 'bg-gray-100 text-gray-500'
    };
    return map[status];
  };

  const getStatusLabel = (status: GoalStatus) => {
    const map: Record<GoalStatus, string> = {
      not_started: '未开始',
      in_progress: '进行中',
      completed: '已完成',
      delayed: '延期',
      archived: '已归档'
    };
    return map[status];
  };

  const getPriorityColor = (p: number) => {
    if (p >= 4) return 'text-red-500';
    if (p >= 3) return 'text-amber-500';
    return 'text-gray-400';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">目标管理</h1>
          <p className="text-gray-500 mt-1">管理你的五级目标体系</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          新建大目标
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">新建大目标</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标名称</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="例如：完成年度学习计划"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows={3}
                  placeholder="目标描述"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={e => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止时间</label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <select
                  value={newGoal.priority}
                  onChange={e => setNewGoal({ ...newGoal, priority: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={1}>低</option>
                  <option value={2}>中</option>
                  <option value={3}>高</option>
                  <option value={4}>紧急</option>
                  <option value={5}>最高</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  取消
                </button>
                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {bigGoals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">还没有大目标</p>
          <p className="text-sm text-gray-400 mt-1">创建你的第一个大目标开始规划</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bigGoals.map(goal => {
            const progress = getGoalProgress(goal.id);
            const phaseGoals = goals.filter(g => g.parentId === goal.id && g.level === 'phase');
            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/goals/${goal.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                        {getStatusLabel(goal.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{goal.description}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('确定删除该目标？所有子目标将一并删除。')) deleteGoal(goal.id); }}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {goal.startDate} ~ {goal.endDate}
                  </span>
                  <span>{phaseGoals.length} 个阶段目标</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{progress}%</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
