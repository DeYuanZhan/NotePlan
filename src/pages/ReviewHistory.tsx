import { useGoalStore } from '../store';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ClipboardList, Calendar } from 'lucide-react';

export default function ReviewHistory() {
  const { reviews } = useGoalStore();

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">复盘记录</h1>
        <p className="text-gray-500 mt-1">查看历史每日复盘记录</p>
      </div>

      {sortedReviews.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无复盘记录</p>
          <p className="text-sm text-gray-400 mt-1">在首页看板提交每日复盘</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReviews.map(review => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">
                  {format(new Date(review.date), 'yyyy年M月d日 EEEE', { locale: zhCN })}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.completionSummary && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-1">✅ 完成情况</p>
                    <p className="text-sm text-green-800">{review.completionSummary}</p>
                  </div>
                )}

                {review.incompleteReason && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-medium text-red-700 mb-1">❌ 未完成原因</p>
                    <p className="text-sm text-red-800">{review.incompleteReason}</p>
                  </div>
                )}

                {review.optimization && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">💡 优化方案</p>
                    <p className="text-sm text-blue-800">{review.optimization}</p>
                  </div>
                )}

                {review.tomorrowPlan && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-medium text-purple-700 mb-1">📋 明日计划</p>
                    <p className="text-sm text-purple-800">{review.tomorrowPlan}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                提交于 {format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
