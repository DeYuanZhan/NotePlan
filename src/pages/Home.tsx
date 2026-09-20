import { useState, useEffect } from 'react';
import { useGoalStore } from '../store';
import { format, differenceInDays, parseISO, isBefore, isAfter, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, AlertTriangle, TrendingUp, Calendar, Flame, Target, AlertCircle, Play, Bell } from 'lucide-react';

export default function Home() {
  const { goals, toggleGoalComplete, getGoalProgress, reviews, createReview } = useGoalStore();
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({
    completionSummary: '',
    incompleteReason: '',
    optimization: '',
    tomorrowPlan: ''
  });
  
  // 提醒设置
  const [startReminderDays, setStartReminderDays] = useState(3);
  const [endReminderDays, setEndReminderDays] = useState(3);

  useEffect(() => {
    // 从 localStorage 加载提醒设置
    const settings = JSON.parse(localStorage.getItem('np_reminder_settings') || '{}');
    if (settings.startReminderDays !== undefined) setStartReminderDays(settings.startReminderDays);
    if (settings.endReminderDays !== undefined) setEndReminderDays(settings.endReminderDays);
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDate = new Date();
  
  // 当日目标统计 - 改进过滤逻辑
  const dailyGoals = goals.filter(g => {
    if (g.level !== 'daily') return false;
    // 优先匹配 endDate 为今天的
    if (g.endDate === today) return true;
    // 如果没有 endDate，但 startDate 为今天，也显示
    if (!g.endDate && g.startDate === today) return true;
    return false;
  });
  const dailyCompleted = dailyGoals.filter(g => g.completed).length;
  const dailyInProgress = dailyGoals.filter(g => !g.completed && g.status === 'in_progress').length;
  const dailyNotStarted = dailyGoals.filter(g => !g.completed && g.status === 'not_started').length;
  
  // 大目标（未归档）
  const bigGoals = goals.filter(g => g.level === 'big' && g.status !== 'archived');
  
  // 阶段性目标
  const phaseGoals = goals.filter(g => g.level === 'phase' && g.status !== 'archived' && g.status !== 'completed');
  
  // 小目标
  const smallGoals = goals.filter(g => g.level === 'small' && g.status !== 'archived' && g.status !== 'completed');
  
  // Calculate streak
  const completedReviews = reviews.filter(r => r.completionSummary.trim().length > 0);
  const streak = completedReviews.length;
  const totalCompleted = goals.filter(g => g.completed).length;

  // 预警计算
  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return null;
    const end = parseISO(endDate);
    return differenceInDays(end, todayDate);
  };

  const getDaysUntilStart = (startDate: string) => {
    if (!startDate) return null;
    const start = parseISO(startDate);
    return differenceInDays(start, todayDate);
  };

  // 延期目标（已过期但未完成）
  const delayedGoals = goals.filter(g => {
    if (g.completed || g.status === 'archived') return false;
    const daysRemaining = getDaysRemaining(g.endDate);
    return daysRemaining !== null && daysRemaining < 0;
  });

  // 即将到期（使用设置的提醒天数）
  const urgentGoals = goals.filter(g => {
    if (g.completed || g.status === 'archived') return false;
    const daysRemaining = getDaysRemaining(g.endDate);
    return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= endReminderDays;
  });

  // 即将开始（使用设置的提醒天数）
  const upcomingGoals = goals.filter(g => {
    if (g.completed || g.status === 'archived') return false;
    const daysUntilStart = getDaysUntilStart(g.startDate);
    return daysUntilStart !== null && daysUntilStart > 0 && daysUntilStart <= startReminderDays;
  });

  // 今日开始的目标
  const todayStartGoals = goals.filter(g => {
    if (g.completed || g.status === 'archived') return false;
    return g.startDate === today;
  });

  // 昨日未完成 - 改进过滤逻辑
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
  const yesterdayIncomplete = goals.filter(g => {
    if (g.level !== 'daily' || g.completed) return false;
    // 匹配 endDate 为昨天的
    if (g.endDate === yesterday) return true;
    // 如果没有 endDate，但 startDate 为昨天，也显示
    if (!g.endDate && g.startDate === yesterday) return true;
    return false;
  });

  const handleSubmitReview = () => {
    createReview({
      userId: '',
      date: today,
      ...review
    });
    setShowReview(false);
    setReview({ completionSummary: '', incompleteReason: '', optimization: '', tomorrowPlan: '' });
  };

  const getLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      big: '大目标',
      phase: '阶段目标',
      small: '小目标',
      daily: '日目标'
    };
    return map[level] || level;
  };

  const getLevelColor = (level: string) => {
    const map: Record<string, string> = {
      big: 'bg-indigo-100 text-indigo-700',
      phase: 'bg-blue-100 text-blue-700',
      small: 'bg-green-100 text-green-700',
      daily: 'bg-amber-100 text-amber-700'
    };
    return map[level] || 'bg-gray-100 text-gray-700';
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

      {/* 当日目标统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dailyGoals.length}</p>
              <p className="text-xs text-gray-500">当日目标</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dailyCompleted}</p>
              <p className="text-xs text-gray-500">当日完成</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dailyInProgress}</p>
              <p className="text-xs text-gray-500">进行中</p>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 今日任务清单 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                今日任务清单
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-600 font-medium">{dailyCompleted} 完成</span>
                <span className="text-amber-600 font-medium">{dailyInProgress} 进行中</span>
                <span className="text-gray-400">{dailyNotStarted} 未开始</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {dailyGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>今日暂无任务</p>
                  <p className="text-sm mt-1">前往目标管理创建日目标</p>
                </div>
              ) : (
                dailyGoals.map(goal => (
                  <div key={goal.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
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
                        {goal.description && (
                          <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${goal.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {goal.completed ? '已完成' : '待完成'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-6">
          {/* 主推目标进度 */}
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
                  const daysRemaining = getDaysRemaining(goal.endDate);
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{goal.name}</p>
                        <span className="text-xs text-gray-500">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {daysRemaining !== null && (
                        <p className="text-xs text-gray-400">
                          剩余 {daysRemaining} 天
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 预警提醒 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              预警提醒
            </h2>
            <div className="space-y-3">
              {/* 今日开始 */}
              {todayStartGoals.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">今日开始 ({todayStartGoals.length})</p>
                  </div>
                  <div className="space-y-1.5">
                    {todayStartGoals.map(goal => (
                      <div key={goal.id} className="flex items-start gap-2 text-xs">
                        <span className={`px-1.5 py-0.5 rounded ${getLevelColor(goal.level)} font-medium`}>
                          {getLevelLabel(goal.level)}
                        </span>
                        <span className="text-blue-700 flex-1 truncate">{goal.name}</span>
                        <span className="text-blue-600 font-medium whitespace-nowrap">今天开始</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 即将开始 */}
              {upcomingGoals.length > 0 && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <p className="text-sm font-medium text-cyan-700">即将开始 ({upcomingGoals.length})</p>
                  </div>
                  <div className="space-y-1.5">
                    {upcomingGoals.map(goal => {
                      const daysUntilStart = getDaysUntilStart(goal.startDate);
                      return (
                        <div key={goal.id} className="flex items-start gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${getLevelColor(goal.level)} font-medium`}>
                            {getLevelLabel(goal.level)}
                          </span>
                          <span className="text-cyan-700 flex-1 truncate">{goal.name}</span>
                          <span className="text-cyan-600 font-medium whitespace-nowrap">
                            {daysUntilStart}天后开始
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 延期目标 */}
              {delayedGoals.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium text-red-700">已延期 ({delayedGoals.length})</p>
                  </div>
                  <div className="space-y-1.5">
                    {delayedGoals.map(goal => {
                      const daysOverdue = Math.abs(getDaysRemaining(goal.endDate) || 0);
                      return (
                        <div key={goal.id} className="flex items-start gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${getLevelColor(goal.level)} font-medium`}>
                            {getLevelLabel(goal.level)}
                          </span>
                          <span className="text-red-700 flex-1 truncate">{goal.name}</span>
                          <span className="text-red-600 font-medium whitespace-nowrap">超期{daysOverdue}天</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 即将到期 */}
              {urgentGoals.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium text-amber-700">即将到期 ({urgentGoals.length})</p>
                  </div>
                  <div className="space-y-1.5">
                    {urgentGoals.map(goal => {
                      const daysRemaining = getDaysRemaining(goal.endDate);
                      return (
                        <div key={goal.id} className="flex items-start gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${getLevelColor(goal.level)} font-medium`}>
                            {getLevelLabel(goal.level)}
                          </span>
                          <span className="text-amber-700 flex-1 truncate">{goal.name}</span>
                          <span className="text-amber-600 font-medium whitespace-nowrap">
                            {daysRemaining === 0 ? '今天' : `剩${daysRemaining}天`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 昨日未完成 */}
              {yesterdayIncomplete.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-700">昨日未完成 ({yesterdayIncomplete.length})</p>
                  </div>
                  <div className="space-y-1.5">
                    {yesterdayIncomplete.map(goal => (
                      <div key={goal.id} className="flex items-start gap-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                          日目标
                        </span>
                        <span className="text-orange-700 flex-1 truncate">{goal.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 无预警 */}
              {delayedGoals.length === 0 && urgentGoals.length === 0 && yesterdayIncomplete.length === 0 && todayStartGoals.length === 0 && upcomingGoals.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无预警，继续保持！</p>
                </div>
              )}
            </div>
          </div>

          {/* 每日复盘 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
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
