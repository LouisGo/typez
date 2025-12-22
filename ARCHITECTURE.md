# Typey IM Application - Architecture Overview

## 📁 Project Structure

```
src/
├── main/                          # Electron 主进程
│   ├── database/                  # SQLite 数据库
│   │   ├── migrations/           # 数据库迁移脚本
│   │   │   └── 001_init.sql     # 初始化表结构
│   │   └── index.ts              # DatabaseService 类
│   ├── ipc/                       # IPC Handlers
│   │   ├── database.handler.ts   # 数据库操作处理器
│   │   └── index.ts
│   └── index.ts                   # 主进程入口
│
├── preload/                       # Preload 脚本
│   ├── index.ts                   # API 暴露
│   └── index.d.ts                 # 类型定义
│
├── renderer/src/                  # 渲染进程
│   ├── app/                       # 应用配置层
│   │   └── providers/            # 全局 Providers
│   │       ├── query-provider.tsx
│   │       └── index.tsx
│   │
│   ├── features/                  # 功能模块（按领域划分）
│   │   ├── auth/                 # 认证模块
│   │   │   ├── domain/           # 领域层
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.entity.ts
│   │   │   │   └── types.ts
│   │   │   ├── data/             # 数据层
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth.repository.ts
│   │   │   │   └── sources/
│   │   │   │       └── auth.mock.ts
│   │   │   └── application/      # 应用层
│   │   │       └── stores/
│   │   │           └── auth.store.ts (Zustand)
│   │   │
│   │   └── chat/                 # 聊天模块
│   │       ├── domain/
│   │       │   └── entities/
│   │       │       ├── chat.entity.ts
│   │       │       └── message.entity.ts
│   │       ├── data/
│   │       │   └── sources/
│   │       │       └── chat.mock.ts
│   │       ├── application/
│   │       │   └── stores/
│   │       │       └── chat.store.ts
│   │       └── presentation/     # 表现层
│   │           ├── components/
│   │           │   └── ChatList.tsx
│   │           └── pages/
│   │               └── ChatPage.tsx
│   │
│   ├── infra/                     # 基础设施层
│   │   ├── ipc/                  # IPC 客户端
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   └── mock/                 # Mock 数据
│   │       └── generators/
│   │           ├── user.generator.ts
│   │           ├── chat.generator.ts
│   │           ├── message.generator.ts
│   │           └── index.ts
│   │
│   ├── shared/                    # 共享代码
│   │   ├── utils/                # 工具函数
│   │   │   ├── cn.ts             # Tailwind class merger
│   │   │   ├── date.ts           # 日期格式化
│   │   │   └── index.ts
│   │   └── types/                # 共享类型
│   │       ├── common.ts
│   │       └── index.ts
│   │
│   ├── App.tsx                    # 根组件
│   ├── main.tsx                   # 渲染进程入口
│   └── styles/
│       └── globals.css           # 全局样式
│
└── shared/                        # 主进程和渲染进程共享
    ├── types/                    # 共享类型定义
    │   ├── ipc.ts                # IPC 通道类型
    │   ├── database.ts           # 数据库表类型
    │   └── index.ts
    └── constants/                # 共享常量
        └── index.ts
```

## 🏗️ Architecture Layers

### 1. Infrastructure Layer (基础设施层)
**Location**: `src/main/database`, `src/renderer/src/infra`

- **SQLite Database**: 本地数据持久化
- **IPC Communication**: 主进程与渲染进程通信
- **Mock Generators**: 使用 Faker.js 生成测试数据

### 2. Data Layer (数据层)
**Location**: `src/renderer/src/features/*/data`

- **Repositories**: 数据访问抽象接口
- **Data Sources**: Mock 和 SQLite 实现
- **可切换性**: 通过接口实现 Mock ↔ 真实 API 无缝切换

### 3. Domain Layer (领域层)
**Location**: `src/renderer/src/features/*/domain`

- **Entities**: 领域实体类 (User, Chat, Message)
- **Business Logic**: 实体方法包含业务逻辑
- **Types**: 领域特定类型定义

### 4. Application Layer (应用层)
**Location**: `src/renderer/src/features/*/application`

- **Stores (Zustand)**: 全局状态管理
- **Queries (React Query)**: 服务端状态管理 (预留)
- **Services**: 业务用例编排 (预留)

### 5. Presentation Layer (表现层)
**Location**: `src/renderer/src/features/*/presentation`

- **Components**: React 组件
- **Pages**: 页面级组件
- **Hooks**: UI 相关 hooks

## 🔧 Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Desktop | Electron | 39.x | 桌面应用框架 |
| Build | Vite | 7.x | 构建工具 |
| Framework | React | 19.x | UI 框架 |
| Language | TypeScript | 5.x | 类型系统 |
| Styling | Tailwind CSS | 3.x | CSS 框架 |
| UI Components | shadcn/ui | latest | 组件库 (预留) |
| State | Zustand | 5.x | 状态管理 |
| Server State | React Query | 5.x | 服务端状态 |
| Router | TanStack Router | 1.x | 路由管理 (预留) |
| Animation | Framer Motion | 12.x | 动画库 (预留) |
| Database | better-sqlite3 | 12.x | SQLite 驱动 |
| Mock Data | @faker-js/faker | 9.x | Mock 数据生成 |

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
