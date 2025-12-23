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
│   ├── api/                       # API 客户端层 (类比 HTTP 客户端)
│   │   ├── client.ts              # 拦截器与核心调用逻辑
│   │   ├── auth.api.ts
│   │   └── chat.api.ts
│   ├── features/                  # 功能模块 (3层扁平化)
│   │   ├── auth/
│   │   │   ├── domain/           # 领域类型与实体
│   │   │   ├── store/            # 状态管理 (Zustand + API)
│   │   │   └── components/       # UI 组件
│   │   └── chat/...
│   ├── app/                       # 全局配置与容器
│   ├── pages/                     # 路由页面 (View 层)
│   └── shared/                    # 共享组件与工具
│
└── shared/                        # 跨进程共享代码
    ├── types/                    # 数据库表与 IPC 协议类型
    └── constants/
```

## 🏗️ Architecture Layers (3-Layer Features)

通过对 Renderer 进程的深度精简，我们采用了扁平化的三层架构：

### 1. Domain Layer (领域层)

- **Location**: `features/*/domain`
- **Responsibility**: 定义业务实体 (Entities) 和类型声明 (Types)。包含与 UI 无关的核心业务逻辑（如下拉刷新时间计算、状态判断等）。

### 2. Store Layer (状态层)

- **Location**: `features/*/store`
- **Responsibility**: 使用 Zustand 直接调用 `api/*` 模块。负责将原始数据转换为实体对象并维护全局响应式状态。

### 3. Presentation Layer (表现层)

- **Location**: `features/*/components`
- **Responsibility**: React 组件，通过 Store 获取状态。不直接感知 IPC 或 Main 进程逻辑。

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
User Interaction (UI)
        ↓
   Component
        ↓
   Zustand Store / React Query
        ↓
   Repository Interface
        ↓
   Mock Data Source ←→ SQLite (via IPC) ←→ 真实 API (未来)
```

## 🎯 Key Features

### Type Safety (类型优先)

- 所有模块从 TypeScript 类型开始定义
- IPC 通信类型安全
- 数据库表结构类型化

### Mock System (Mock 数据系统)

- `UserGenerator`: 生成 mock 用户数据
- `ChatGenerator`: 生成 mock 聊天数据
- `MessageGenerator`: 生成 mock 消息数据
- 支持大规模数据生成用于性能测试

### Future-Proof (面向未来)

- Repository Pattern 支持数据源切换
- 预留 React Query 用于真实 API
- 预留 TanStack Router 用于路由
- 预留 shadcn/ui 组件

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
