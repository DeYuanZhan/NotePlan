import { useState } from 'react';
import { useGoalStore, useAuthStore } from '../store';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, AlertTriangle, TrendingUp, Calendar, ChevronDown, ChevronRight, Flame, Target } from 'lucide-react';

export default function Home() {
  const { goals, toggleGoalComplete, getGoalProgress, reviews, createReview } = useGoalStore();
  const { currentUser } = useAuthStore();
  const [showReview, setShowReview] = useState(false);
  const [expandedDaily, setExpandedDaily] = useState<string[]>([]);
  const [review, setReview] = useState({
    completionSummary: '',
    incompleteReason: '',
    optimization: '',
    tomorrowPlan: ''
  });

  const today = format(new Date(), 'yyyy-MM-dd');
  const dailyGoals = goals.filter(g => g.level === 'daily' && g.endDate === today);
  const bigGoals = goals.filter(g => g.level === 'big' && g.status !== 'archived');
  
  // Calculate streak
  const completedReviews = reviews.filter(r => r.completionSummary.trim().length > 0);
  const streak = completedReviews.length;
  const totalCompleted = goals.filter(g => g.completed).length;

  // Yesterday's incomplete tasks
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  const yesterdayIncomplete = goals.filter(g => g.level === 'daily' && g.endDate === yesterday && !g.completed);

  // Today's near-deadline tasks
  const todayDeadline = goals.filter(g => g.level === 'daily' && g.endDate === today && !g.completed);

  const toggleExpand = (id: string) => {
    setExpandedDaily(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getHourlyTasks = (dailyId: string) => {
    return goals.filter(g => g.parentId === dailyId && g.level === 'hourly');
  };

  const handleSubmitReview = () => {
    createReview({
      userId: currentUser?.id || '',
      date: today,
      ...review
    });
    setShowReview(false);
    setReview({ completionSummary: '', incompleteReason: '', optimization: '', tomorrowPlan: '' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          今日目标看板
        </h1>
        <p className="text-gray-500 mt-1">
          {format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dailyGoals.filter(g => g.completed).length}/{dailyGoals.length}</p>
              <p className="text-xs text-gray-500">今日任务</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{streak}</p>
              <p className="text-xs text-gray-500">连续打卡</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
              <p className="text-xs text-gray-500">累计完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{bigGoals.length}</p>
              <p className="text-xs text-gray-500">进行中目标</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                今日任务清单
              </h2>
              <span className="text-sm text-gray-500">
                {dailyGoals.filter(g => g.completed).length} / {dailyGoals.length} 完成
              </span>
            </div>
            <div className="p-5 space-y-3">
              {dailyGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>今日暂无任务</p>
                  <p className="text-sm mt-1">前往目标管理创建日目标</p>
                </div>
              ) : (
                dailyGoals.map(goal => {
                  const hourlyTasks = getHourlyTasks(goal.id);
                  const isExpanded = expandedDaily.includes(goal.id);
                  return (
                    <div key={goal.id} className="border border-gray-100 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-3 p-3 hover:bg-gray-50">
                        <button onClick={() => toggleGoalComplete(goal.id)}>
                          {goal.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {goal.name}
                          </p>
                          {hourlyTasks.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {hourlyTasks.filter(h => h.completed).length}/{hourlyTasks.length} 小时任务完成
                            </p>
                          )}
                        </div>
                        {hourlyTasks.length > 0 && (
                          <button onClick={() => toggleExpand(goal.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      {isExpanded && hourlyTasks.length > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-2 space-y-2">
                          {hourlyTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 py-1">
                              <button onClick={() => toggleGoalComplete(task.id)}>
                                {task.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300" />
                                )}
                              </button>
                              <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {task.startDate && task.endDate ? `${task.startDate.slice(11, 16)} - ${task.endDate.slice(11, 16)}` : ''} {task.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Big Goals Progress */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              主推目标
            </h2>
            {bigGoals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无大目标</p>
            ) : (
              <div className="space-y-4">
                {bigGoals.slice(0, 3).map(goal => {
                  const progress = getGoalProgress(goal.id);
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{goal.name}</p>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning Cards */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              预警提醒
            </h2>
            <div className="space-y-3">
              {yesterdayIncomplete.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-700">昨日未完成</p>
                  <p className="text-xs text-red-600 mt-1">{yesterdayIncomplete.length} 项任务未完成</p>
                </div>
              )}
              {todayDeadline.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-700">今日待完成</p>
                  <p className="text-xs text-amber-600 mt-1">{todayDeadline.length} 项任务即将到期</p>
                </div>
              )}
              {yesterdayIncomplete.length === 0 && todayDeadline.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-2">暂无预警</p>
              )}
            </div>
          </div>

          {/* Review Entry */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              每日复盘
            </h2>
            {!showReview ? (
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-sm"
              >
                开始今日复盘
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={review.completionSummary}
                  onChange={e => setReview({ ...review, completionSummary: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="今日完成情况..."
                />
                <textarea
                  value={review.incompleteReason}
                  onChange={e => setReview({ ...review, incompleteReason: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="未完成原因..."
                />
                <textarea
                  value={review.optimization}
                  onChange={e => setReview({ ...review, optimization: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="优化方案..."
                />
                <textarea
                  value={review.tomorrowPlan}
                  onChange={e => setReview({ ...review, tomorrowPlan: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none"
                  rows={2}
                  placeholder="明日计划..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    提交复盘
                  </button>
                  <button
                    onClick={() => setShowReview(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


