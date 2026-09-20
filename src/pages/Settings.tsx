import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { User, Mail, Lock, Save, Bell } from 'lucide-react';

export default function Settings() {
  const { currentUser, updateProfile } = useAuthStore();
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  
  // 提醒设置
  const [startReminderDays, setStartReminderDays] = useState(3);
  const [endReminderDays, setEndReminderDays] = useState(3);
  const [dailyReviewTime, setDailyReviewTime] = useState('21:00');

  useEffect(() => {
    // 从 localStorage 加载提醒设置
    const settings = JSON.parse(localStorage.getItem('np_reminder_settings') || '{}');
    if (settings.startReminderDays !== undefined) setStartReminderDays(settings.startReminderDays);
    if (settings.endReminderDays !== undefined) setEndReminderDays(settings.endReminderDays);
    if (settings.dailyReviewTime) setDailyReviewTime(settings.dailyReviewTime);
  }, []);

  const handleSaveProfile = () => {
    updateProfile({ nickname, email });
    setMessage('个人信息已更新');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      setMessage('请填写完整密码信息');
      return;
    }
    if (oldPassword !== currentUser?.password) {
      setMessage('原密码错误');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('新密码至少6位');
      return;
    }
    updateProfile({ password: newPassword });
    setOldPassword('');
    setNewPassword('');
    setMessage('密码已更新');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveReminderSettings = () => {
    const settings = {
      startReminderDays,
      endReminderDays,
      dailyReviewTime
    };
    localStorage.setItem('np_reminder_settings', JSON.stringify(settings));
    setMessage('提醒设置已保存');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">个人设置</h1>

      {message && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存修改
            </button>
          </div>
        </div>

        {/* Reminder Settings Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            提醒设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标开始提醒（提前几天）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={startReminderDays}
                  onChange={e => setStartReminderDays(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-center">
                  {startReminderDays} 天
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                在目标开始时间前 {startReminderDays} 天提醒
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                目标截止提醒（提前几天）
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={endReminderDays}
                  onChange={e => setEndReminderDays(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900 w-16 text-center">
                  {endReminderDays} 天
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                在目标截止时间前 {endReminderDays} 天提醒
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                每日复盘提醒时间
              </label>
              <input
                type="time"
                value={dailyReviewTime}
                onChange={e => setDailyReviewTime(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                每天 {dailyReviewTime} 提醒进行复盘
              </p>
            </div>

            <button
              onClick={handleSaveReminderSettings}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存提醒设置
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="输入原密码"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="至少6位"
                />
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Lock className="w-4 h-4" />
              修改密码
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
