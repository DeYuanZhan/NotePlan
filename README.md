# NotePlan - 笔记目标一体化 Web 应用

<div align="center">

**📝 笔记知识库 + 🎯 目标计划管理 | 打通「规划→执行→知识沉淀」闭环**

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 项目简介

NotePlan 是一款私有化部署的一体化 Web 应用，将**笔记知识库**与**目标计划管理**深度整合，支持多用户、持久化存储、富媒体笔记、五级目标拆解、甘特倒排、每日目标自检看板。

### 🎯 产品定位

- **笔记知识库域**：多用户隔离，支持多格式笔记、文档树、富文本编辑、思维导图、文档回收站
- **目标计划域**：五级目标拆解（大目标→阶段目标→小目标→日目标→小时目标），甘特可视化、进度自动汇总、每日复盘
- **双向关联**：目标和笔记双向绑定，形成完整的知识管理闭环

---

## ✨ 核心功能

### 📚 笔记知识库

- ✅ **多知识库管理**：创建多个独立知识库，每个知识库拥有独立文档目录
- ✅ **无限层级文档树**：支持文件夹和文档的无限层级嵌套，拖拽排序
- ✅ **富文本编辑器**：基于 TipTap 的专业编辑器
  - 多级标题、段落、列表、任务清单
  - 代码块、引用块、分割线
  - 图片上传（支持拖拽、粘贴、URL）
  - **本地文件拖拽上传**（图片、PDF、Word、文本文件）
  - 高亮、下划线、文本对齐、颜色设置
  - 自动保存草稿
- ✅ **思维导图**：集成 Markmap，支持可视化思维导图编辑
  - 树形节点编辑器
  - 文本模式快速编辑
  - 实时预览
- ✅ **文档回收站**：删除文档进入回收站，支持恢复和永久删除
- ✅ **文档与目标关联**：双向绑定笔记和目标

### 🎯 目标计划管理

- ✅ **五级目标体系**：
  1. **大目标**（长线，季度/年度）
  2. **阶段性目标**（中期，月度/多月）
  3. **小目标**（短期，数日/周）
  4. **日目标**（单日任务）
  5. **小时目标**（最小执行单元）
- ✅ **进度自动汇总**：上级目标进度由下级子目标完成率自动计算
- ✅ **甘特视图**：可视化展示所有层级目标的时间线
  - 支持折叠/展开子任务
  - 拖拽调整任务时间
  - 状态颜色区分（未开始、进行中、已完成、延期）
- ✅ **每日目标看板**：登录首页展示当日任务清单
  - 今日任务列表
  - 小时任务勾选
  - 进度统计
  - 预警提醒（昨日未完成、今日即将到期）
- ✅ **每日复盘**：
  - 完成情况记录
  - 未完成原因分析
  - 优化方案
  - 明日计划
  - 历史复盘记录查看
- ✅ **目标与笔记关联**：任意层级目标可绑定多篇笔记

### 👤 用户系统

- ✅ 邮箱注册/登录
- ✅ 会话保持
- ✅ 个人资料管理（昵称、邮箱）
- ✅ 密码修改
- ✅ 退出登录

---

## 🛠️ 技术栈

### 前端框架
- **React 18.2** - UI 框架
- **TypeScript 5.7** - 类型安全
- **Vite 6.4** - 构建工具

### 状态管理
- **Zustand 5.0** - 轻量级状态管理

### UI 组件
- **Tailwind CSS 4.1** - 原子化 CSS
- **Lucide React** - 图标库
- **Framer Motion** - 动画效果

### 编辑器
- **TipTap 3.31** - 富文本编辑器
  - @tiptap/react
  - @tiptap/starter-kit
  - @tiptap/extension-image
  - @tiptap/extension-task-list
  - @tiptap/extension-code-block
  - @tiptap/extension-highlight
  - @tiptap/extension-underline
  - @tiptap/extension-text-align
  - @tiptap/extension-color

### 思维导图
- **Markmap** - 思维导图可视化
  - markmap-lib
  - markmap-view
  - markmap-toolbar

### 其他工具
- **React Router DOM 6.8** - 路由管理
- **date-fns 2.30** - 日期处理
- **uuid 9.0** - 唯一标识符生成
- **Recharts 2.10** - 图表库（预留）
- **Canvas Confetti 1.9** - 庆祝动画（预留）

---

## 📦 安装与运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd noteplan

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 构建生产版本
npm run build

# 5. 类型检查
npm run typecheck
```

### 访问应用

开发服务器启动后，访问：`http://localhost:5173`

---

## 📁 项目结构

```
noteplan/
├── src/
│   ├── components/           # 可复用组件
│   │   ├── Layout.tsx        # 主布局（侧边栏 + 内容区）
│   │   └── MindMapPanel.tsx  # 思维导图面板
│   ├── pages/                # 页面组件
│   │   ├── Login.tsx         # 登录页
│   │   ├── Register.tsx      # 注册页
│   │   ├── Home.tsx          # 首页（每日目标看板）
│   │   ├── Settings.tsx      # 个人设置页
│   │   ├── Docs.tsx          # 知识库列表页
│   │   ├── DocSpace.tsx      # 文档树页面
│   │   ├── DocEditor.tsx     # 文档编辑器页
│   │   ├── Goals.tsx         # 目标总览页
│   │   ├── GoalDetail.tsx    # 目标详情页
│   │   ├── GanttView.tsx     # 甘特图视图页
│   │   └── ReviewHistory.tsx # 复盘历史页
│   ├── store.ts              # Zustand 状态管理
│   ├── App.tsx               # 应用入口（路由配置）
│   ├── main.tsx              # React 入口
│   └── index.css             # 全局样式
├── public/                   # 静态资源
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.js            # Vite 配置
└── README.md                 # 项目文档
```

---

## 🎨 页面路由

| 路由 | 页面名称 | 功能说明 |
|------|---------|---------|
| `/` | 首页 | 每日目标看板，展示当日任务、进度、预警 |
| `/login` | 登录页 | 账号登录 |
| `/register` | 注册页 | 账号注册 |
| `/settings` | 个人设置页 | 个人信息、密码修改 |
| `/docs` | 知识库首页 | 知识库空间列表 |
| `/docs/:spaceId` | 文档树页面 | 当前知识库目录管理 |
| `/docs/:spaceId/:docId` | 文档编辑器页 | 笔记编辑、思维导图 |
| `/goals` | 目标总览页 | 全部大目标列表 |
| `/goals/:goalId` | 目标详情页 | 层级目标树、关联笔记 |
| `/goals/gantt` | 甘特图视图页 | 全目标可视化、时间拖拽 |
| `/goals/review` | 复盘历史页 | 查看全部历史每日复盘记录 |

---

## 📊 数据存储

当前版本使用 **localStorage** 进行数据持久化：

- `np_users` - 用户列表
- `np_currentUser` - 当前登录用户
- `np_spaces` - 知识库空间
- `np_documents` - 文档内容
- `np_goals` - 目标数据
- `np_reviews` - 复盘记录

### 数据隔离

每个用户的数据通过 `userId` 字段隔离，确保多用户环境下数据安全性。

---

## 🚀 开发计划

### Phase 1：MVP 最小可用版本 ✅ 已完成

**阶段目标**：实现个人笔记基础能力 + 五级目标基础管理 + 首页每日看板

- ✅ 用户账号模块：注册、登录、退出、个人资料、密码修改
- ✅ 知识库基础：创建个人知识库、文档树，新建/重命名/移动/删除文档
- ✅ 富文本编辑器：支持基础文本、标题、列表、任务框、图片上传、代码块等
- ✅ 思维导图：集成 Markmap，支持可视化和文本编辑模式
- ✅ 文档回收站：删除文档移入回收站、恢复、永久删除
- ✅ 五级目标基础 CRUD：创建大目标、阶段目标、小目标、日目标、小时目标
- ✅ 上下级进度自动汇总
- ✅ 首页每日目标看板：展示当日任务、小时任务勾选、进度统计、复盘表单提交
- ✅ 目标与笔记双向绑定
- ✅ 基础甘特视图：展示层级目标，支持拖拽修改任务时间

### Phase 2：能力增强阶段（规划中）

**阶段目标**：补齐笔记高级能力 + 目标模块高级能力

- 🔄 文档版本快照、版本对比、版本回滚
- 🔄 标签管理
- 🔄 全文检索
- 🔄 文档分享链接（密码、有效期）
- 🔄 甘特图自动工期倒排
- 🔄 延期预警提醒
- 🔄 目标模板
- 🔄 昨日目标一键复用
- 🔄 周/月度目标统计报表

### Phase 3：团队与扩展能力阶段（规划中）

**阶段目标**：增加团队协作、离线能力、外部导入导出

- 🔄 团队空间：创建团队知识库、团队目标
- 🔄 成员邀请、空间权限管理
- 🔄 PWA 离线能力
- 🔄 支持批量导入 Markdown、语雀/有道云笔记数据
- 🔄 笔记/目标导出

---

## 💡 使用指南

### 快速开始

1. **注册账号**
   - 访问应用，点击"注册"
   - 填写邮箱、昵称、密码
   - 完成注册后自动登录

2. **创建知识库**
   - 进入"知识库"页面
   - 点击"新建知识库"
   - 填写知识库名称和描述

3. **编写笔记**
   - 进入知识库，创建文档
   - 使用富文本编辑器编写内容
   - 可插入图片、代码块、任务清单等
   - **拖拽上传文件**：直接将文件拖入编辑器
     - 图片文件：自动插入为图片
     - PDF/Word 文档：插入为可下载附件
     - 文本文件：插入为代码块
   - **粘贴上传**：Ctrl+V 粘贴剪贴板中的图片
   - **手动上传**：点击工具栏上传按钮选择文件
   - 支持思维导图模式

4. **设定目标**
   - 进入"目标管理"页面
   - 创建大目标（如：年度学习计划）
   - 逐级拆解为阶段目标、小目标、日目标、小时目标
   - 设置起止时间和优先级

5. **每日执行**
   - 登录首页查看今日任务看板
   - 勾选完成的小时任务
   - 系统自动更新上级目标进度
   - 晚间提交每日复盘

6. **查看进度**
   - 在甘特视图查看整体时间线
   - 在目标详情页查看层级进度
   - 在复盘历史页回顾历史记录

### 快捷键

- `Ctrl/Cmd + S` - 保存文档（文档编辑器）

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 组件使用函数式组件 + Hooks
- 状态管理使用 Zustand
- 样式使用 Tailwind CSS

---

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [React](https://reactjs.org/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [TipTap](https://tiptap.dev/) - 富文本编辑器
- [Markmap](https://markmap.js.org/) - 思维导图
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Lucide](https://lucide.dev/) - 图标库

---

## 📧 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 开启 Discussion
- 发送邮件

---

## 🌟 特性亮点

1. **一体化设计**：笔记 + 目标深度融合，不是简单的功能堆砌
2. **五级目标体系**：从宏观到微观的完整目标拆解
3. **进度自动汇总**：无需手动计算，系统自动统计
4. **富文本 + 思维导图**：双模式编辑，满足不同场景需求
5. **本地文件拖拽上传**：支持图片、PDF、Word、文本文件的拖拽上传
   - 图片自动插入编辑器
   - 文档作为可下载附件
   - 文本文件作为代码块
   - 支持粘贴上传（Ctrl+V）
6. **每日复盘机制**：持续改进，形成良性循环
7. **本地优先**：数据存储在本地，保护隐私
8. **响应式设计**：支持桌面和移动端访问

---

<div align="center">

**🎉 开始使用 NotePlan，让目标管理更简单，让知识沉淀更系统！**

[开始使用](#-安装与运行) · [查看演示](#-使用指南) · [贡献代码](#-贡献指南)

</div>
