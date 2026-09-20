import { useState, useMemo } from 'react';
import { useGoalStore, useAuthStore } from '../store';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { GoalLevel } from '../store';

export default function GanttView() {
  const { goals, updateGoal } = useGoalStore();
  const { currentUser } = useAuthStore();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const userGoals = goals.filter(g => g.userId === currentUser?.id);
  const bigGoals = userGoals.filter(g => g.level === 'big');

  const getChildren = (parentId: string) => userGoals.filter(g => g.parentId === parentId);

  // Calculate date range
  const { startDate, endDate, totalDays } = useMemo(() => {
    let minDate = new Date();
    let maxDate = new Date();
    
    userGoals.forEach(g => {
      if (g.startDate) {
        const d = new Date(g.startDate);
        if (d < minDate) minDate = d;
      }
      if (g.endDate) {
        const d = new Date(g.endDate);
        if (d > maxDate) maxDate = d;
      }
    });

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const diff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return { startDate: minDate, endDate: maxDate, totalDays: Math.max(diff, 30) };
  }, [userGoals]);

  const getBarStyle = (goal: any) => {
    if (!goal.startDate || !goal.endDate) return { left: '0%', width: '0%' };
    const goalStart = new Date(goal.startDate);
    const goalEnd = new Date(goal.endDate);
    const startOffset = Math.max(0, Math.ceil((goalStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.ceil((goalEnd.getTime() - goalStart.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getBarColor = (goal: any) => {
    if (goal.completed) return 'bg-green-400';
    const now = new Date();
    const end = goal.endDate ? new Date(goal.endDate) : null;
    if (end && end < now && !goal.completed) return 'bg-red-400';
    if (goal.status === 'in_progress') return 'bg-indigo-400';
    return 'bg-gray-300';
  };

  const getLevelLabel = (level: GoalLevel) => {
    const map: Record<GoalLevel, string> = { big: '大', phase: '阶', small: '小', daily: '日' };
    return map[level];
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDragStart = (e: React.DragEvent, goalId: string) => {
    setDragging(goalId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, goalId: string) => {
    e.preventDefault();
    if (!dragging || dragging === goalId) return;
    
    const draggedGoal = userGoals.find(g => g.id === dragging);
    const targetGoal = userGoals.find(g => g.id === goalId);
    if (!draggedGoal || !targetGoal) return;

    // Update dragged goal's dates to match target
    if (targetGoal.startDate && targetGoal.endDate) {
      updateGoal(dragging, { startDate: targetGoal.startDate, endDate: targetGoal.endDate });
    }
    setDragging(null);
  };

  // Generate date headers
  const dateHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i < totalDays; i += 7) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      headers.push({ date: d, offset: i });
    }
    return headers;
  }, [startDate, totalDays]);

  const renderGoalRow = (goal: any, depth: number = 0) => {
    const children = getChildren(goal.id);
    const isExpanded = expanded.includes(goal.id);
    const barStyle = getBarStyle(goal);

    return (
      <div key={goal.id}>
        <div
          className="flex items-center border-b border-gray-50 hover:bg-gray-50/50"
          draggable
          onDragStart={e => handleDragStart(e, goal.id)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, goal.id)}
        >
          {/* Left: Goal name */}
          <div className="w-64 flex-shrink-0 flex items-center gap-1 px-2 py-2 border-r border-gray-100" style={{ paddingLeft: `${depth * 16 + 8}px` }}>
            {children.length > 0 && (
              <button onClick={() => toggleExpand(goal.id)} className="text-gray-400">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            )}
            {children.length === 0 && <span className="w-3.5" />}
            <span className="text-xs px-1 py-0.5 bg-gray-100 text-gray-500 rounded mr-1">{getLevelLabel(goal.level)}</span>
            <span className={`text-sm truncate ${goal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {goal.name}
            </span>
          </div>

          {/* Right: Gantt bar */}
          <div className="flex-1 relative h-10">
            {barStyle.width !== '0%' && (
              <div
                className={`absolute top-2 h-6 rounded-md ${getBarColor(goal)} opacity-80 hover:opacity-100 transition-opacity cursor-move shadow-sm`}
                style={barStyle}
                title={`${goal.name}\n${goal.startDate} ~ ${goal.endDate}`}
              >
                <span className="text-xs text-white px-2 leading-6 truncate block">
                  {goal.startDate?.slice(5)} ~ {goal.endDate?.slice(5)}
                </span>
              </div>
            )}
          </div>
        </div>

        {isExpanded && children.map(child => renderGoalRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">甘特视图</h1>
        <p className="text-gray-500 mt-1">可视化目标时间线，拖拽调整任务时间</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* Date Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-700">目标</span>
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {dateHeaders.map((h, i) => (
                <div
                  key={i}
                  className="text-xs text-gray-500 text-center border-r border-gray-100"
                  style={{ width: `${(7 / totalDays) * 100}%`, minWidth: '40px' }}
                >
                  {h.date.getMonth() + 1}/{h.date.getDate()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Rows */}
        <div className="flex-1 overflow-auto">
          {bigGoals.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>暂无目标数据</p>
              <p className="text-sm mt-1">请先在目标管理中创建目标</p>
            </div>
          ) : (
            bigGoals.map(goal => renderGoalRow(goal))
          )}
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-6 bg-gray-50">
          <span className="text-xs text-gray-500">图例：</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded bg-gray-300"></span>未开始
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded bg-indigo-400"></span>进行中
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded bg-green-400"></span>已完成
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded bg-red-400"></span>延期
          </span>
        </div>
      </div>
    </div>
  );
}
