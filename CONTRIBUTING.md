# 贡献指南

感谢你对 NotePlan 项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请创建一个 Issue 并包含以下信息：

1. **清晰的标题**：简明扼要地描述问题
2. **复现步骤**：详细说明如何复现这个问题
3. **期望行为**：你期望发生什么
4. **实际行为**：实际发生了什么
5. **环境信息**：
   - 操作系统
   - 浏览器及版本
   - Node.js 版本
6. **截图或录屏**（如果适用）

### 提出新功能建议

如果你有新的功能建议，请创建 Issue 并说明：

1. **功能描述**：你想要什么功能
2. **使用场景**：为什么需要这个功能
3. **替代方案**：是否考虑过其他解决方案
4. **额外信息**：任何有助于理解的信息

### 提交代码

#### 开发流程

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上 Fork 本仓库
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/YOUR_USERNAME/noteplan.git
   cd noteplan
   ```

3. **创建分支**
   ```bash
   # 功能开发
   git checkout -b feature/amazing-feature
   
   # Bug 修复
   git checkout -b fix/bug-fix
   
   # 文档更新
   git checkout -b docs/update-readme
   ```

4. **安装依赖**
   ```bash
   npm install
   ```

5. **开发**
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 进行代码修改
   ```

6. **测试**
   ```bash
   # 类型检查
   npm run typecheck
   
   # 构建测试
   npm run build
   ```

7. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

8. **推送并创建 Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

#### 提交信息规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 代码重构（既不是新功能也不是 Bug 修复）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat: 添加文档版本历史功能
fix: 修复目标进度计算错误
docs: 更新 README 安装说明
style: 统一代码缩进为 2 空格
refactor: 重构状态管理逻辑
perf: 优化甘特图渲染性能
```

#### Pull Request 规范

创建 Pull Request 时，请确保：

1. **标题清晰**：使用 conventional commit 格式
2. **描述详细**：
   - 说明这个 PR 解决了什么问题
   - 如果有相关 Issue，请引用（如 `Fixes #123`）
   - 说明做了哪些改动
3. **代码质量**：
   - 代码通过类型检查
   - 代码可以成功构建
   - 遵循项目代码风格
4. **测试**：
   - 如果是新功能，考虑添加测试
   - 如果是 Bug 修复，说明如何验证修复
5. **文档**：
   - 更新相关文档（如 README、CHANGELOG）
   - 添加必要的代码注释

### 代码风格

#### TypeScript

- 使用 TypeScript 严格模式
- 为所有函数参数和返回值添加类型注解
- 使用接口（interface）定义对象结构
- 避免使用 `any` 类型

```typescript
// ✅ 好的做法
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): User {
  // ...
}

// ❌ 避免的做法
function getUser(id: any): any {
  // ...
}
```

#### React 组件

- 使用函数式组件和 Hooks
- 组件文件名使用 PascalCase
- 组件名与文件名一致

```typescript
// ✅ 好的做法
// UserProfile.tsx
export default function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

#### 样式

- 使用 Tailwind CSS 类名
- 遵循 Tailwind 的类名顺序约定
- 复杂样式使用 CSS 模块或 styled-components

#### 状态管理

- 使用 Zustand 管理全局状态
- 状态命名使用 camelCase
- Action 命名使用动词开头

```typescript
// ✅ 好的做法
const useStore = create((set) => ({
  users: [],
  addUser: (user: User) => set((state) => ({ 
    users: [...state.users, user] 
  })),
}));
```

### 开发环境设置

#### 推荐工具

- **编辑器**: VS Code
  - 推荐插件：
    - ESLint
    - Prettier
    - TypeScript
    - Tailwind CSS IntelliSense

- **浏览器**: Chrome 或 Firefox（最新稳定版）

#### 环境变量

如果需要添加环境变量，请：

1. 创建 `.env.example` 文件，列出所有需要的变量
2. 在代码中使用 `import.meta.env.VITE_XXX` 访问
3. 在 `.gitignore` 中忽略 `.env.local` 等文件

### 测试

目前项目没有自动化测试，但我们计划添加：

- 单元测试（Jest + React Testing Library）
- 集成测试（Cypress 或 Playwright）
- E2E 测试

如果你有兴趣贡献测试代码，欢迎提交 PR！

### 文档

文档是项目的重要组成部分，欢迎改进：

- README.md - 项目介绍和使用说明
- CHANGELOG.md - 版本变更记录
- 代码注释 - 解释复杂的逻辑
- 使用示例 - 帮助新用户上手

### 社区行为准则

我们遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则：

- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表现出同理心

### 获得帮助

如果你需要帮助：

1. 查看 README.md 和文档
2. 搜索现有的 Issues
3. 创建新的 Issue 提问
4. 参与 Discussion 讨论

## 致谢

感谢所有贡献者！你的每一份贡献都让这个项目变得更好。

---

**再次感谢你的贡献！🎉**
