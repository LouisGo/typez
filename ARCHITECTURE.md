# Typez IM Application - Architecture Overview

## 📁 Project Structure

```
src/
├── main/                          # Electron 主进程 (业务核心)
│   ├── services/                  # 核心业务逻辑实现 (Real/Mock 自动切换)
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   └── index.ts               # 服务出口
│   ├── database/                  # SQLite 数据库服务
│   ├── ipc/                       # IPC Handlers (薄转发层)
│   │   ├── auth.handler.ts
│   │   └── chat.handler.ts
│   └── mock/                      # Mock 实现 (仅开发环境)
│       ├── generators/            # Faker 数据生成器
│       └── services/              # Mock 服务实现
│
├── preload/                       # Preload 脚本 (IPC 桥接)
│
├── renderer/src/                  # 渲染进程 (薄客户端)
│   ├── infra/                     # 基础设施层
│   │   └── api/                   # API 客户端层 (IPC 调用)
│   │       ├── client.ts          # 拦截器与核心调用逻辑
│   │       ├── auth.api.ts
│   │       └── chat.api.ts
│   ├── pages/                     # 路由页面 (View 层)
│   ├── components/                # UI 组件
│   │   ├── business/             # 业务组件
│   │   └── ui/                   # 通用 UI 组件
│   ├── app/                       # 全局配置与容器
│   └── shared/                    # 共享工具与类型
│
└── shared/                        # 跨进程共享代码
    ├── types/                    # 类型定义
    │   ├── database.ts           # 数据库表类型 (snake_case)
    │   ├── models.ts             # 领域模型类型 (camelCase)
    │   └── ipc.ts                # IPC 协议类型
    └── constants/
```

## 🏗️ Architecture Layers

### Main Process (主进程) - 业务核心

- **Location**: `src/main/`
- **职责**:
  - 所有业务逻辑实现
  - 数据库操作 (SQLite)
  - 数据格式转换 (snake_case → camelCase)
  - 返回最终格式的领域模型给 Renderer

### Renderer Process (渲染进程) - 薄客户端

- **Location**: `src/renderer/src/`
- **职责**:
  - UI 展示 (pages, components)
  - UI 状态管理 (可选，仅 UI 相关状态)
  - API 调用 (通过 IPC)
  - 直接使用 Main 进程返回的最终数据，无需转换

### Shared (共享代码)

- **Location**: `src/shared/`
- **职责**:
  - 类型定义 (database, models, ipc)
  - 常量定义
  - 跨进程共享的工具函数

## 🔧 Technology Stack

| Category      | Technology      | Version | Purpose         |
| ------------- | --------------- | ------- | --------------- |
| Desktop       | Electron        | 39.x    | 桌面应用框架    |
| Build         | Vite            | 7.x     | 构建工具        |
| Framework     | React           | 19.x    | UI 框架         |
| Language      | TypeScript      | 5.x     | 类型系统        |
| Styling       | Tailwind CSS    | 3.x     | CSS 框架        |
| UI Components | shadcn/ui       | latest  | 组件库 (预留)   |
| State         | Zustand         | 5.x     | 状态管理        |
| Server State  | React Query     | 5.x     | 服务端状态      |
| Router        | TanStack Router | 1.x     | 路由管理 (预留) |
| Animation     | Framer Motion   | 12.x    | 动画库 (预留)   |
| Database      | better-sqlite3  | 12.x    | SQLite 驱动     |
| Mock Data     | @faker-js/faker | 9.x     | Mock 数据生成   |

## 📊 Data Flow

```
Renderer Process (薄客户端)
        ↓
   UI Component (pages/components)
        ↓
   API Client (infra/api)
        ↓
   IPC (类型安全)
        ↓
Main Process (业务核心)
        ↓
   Service (业务逻辑)
        ↓
   Database (SQLite)
        ↓
   Transform (snake_case → camelCase)
        ↓
   Return Domain Model (camelCase)
        ↓
   IPC (类型安全)
        ↓
Renderer Process
        ↓
   Direct Use (无需转换)
```

### 关键原则

1. **类型优先**: 所有 IPC 通信完全类型安全，编译时检查
2. **职责分明**: Main 进程处理所有业务逻辑和数据转换，Renderer 仅负责 UI
3. **数据格式**: Main 进程返回 camelCase 格式的领域模型，Renderer 直接使用
4. **无业务逻辑**: Renderer 中不包含任何业务逻辑，只负责展示

## 🎯 Key Features

### Type Safety (类型优先)

- 所有模块从 TypeScript 类型开始定义
- IPC 通信完全类型安全，支持自动类型推导
- 数据库表结构类型化 (snake_case)
- 领域模型类型化 (camelCase)
- 类型工具函数 (`IPCParams<C>`, `IPCResult<C>`)

### Mock System (Mock 数据系统)

- `UserGenerator`: 生成 mock 用户数据
- `ChatGenerator`: 生成 mock 聊天数据
- `MessageGenerator`: 生成 mock 消息数据
- 支持大规模数据生成用于性能测试

### Data Transformation (数据转换)

- Main 进程负责所有数据格式转换
- 数据库层: snake_case (UserTable, ChatTable, MessageTable)
- 领域模型层: camelCase (User, Chat, Message)
- 转换工具: `src/main/utils/transformers.ts`

## 🚀 Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Type Check

```bash
pnpm typecheck
```

### Build

```bash
pnpm build
```

## 📝 Next Steps

1. **添加更多功能模块**
   - Contact (联系人)
   - Media (媒体文件)
   - Settings (设置)

2. **完善 UI 组件**
   - 安装 shadcn/ui 组件
   - 创建通用业务组件

3. **实现路由系统**
   - 配置 TanStack Router
   - 创建路由结构

4. **填充具体功能**
   - Auth 登录/注册界面
   - Chat 聊天列表和消息界面
   - 实时消息更新

5. **接入真实后端** (未来)
   - 实现 HTTP Repository
   - 替换 Mock Data Source
   - 无需修改业务逻辑

## 📖 Architecture Principles

1. **Separation of Concerns**: 清晰的层次划分
2. **Dependency Inversion**: 依赖抽象而非实现
3. **Single Responsibility**: 每个模块单一职责
4. **Open/Closed**: 对扩展开放，对修改封闭
5. **Type-First Development**: 类型优先开发

---

**Created**: 2025-12-22
**Author**: Architecture Assistant
