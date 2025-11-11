# Task Management API - Dual Architecture Implementation

A TypeScript/Express.js REST API demonstrating **MVC** and **Module-based** architectural patterns.

## 🏗️ Two Architectural Approaches

This project implements **both MVC and Module-based architectures** side-by-side. Both are fully functional and production-ready.

---

### Approach 1: MVC (Model-View-Controller) ✅ Currently Active

Traditional layered architecture organizing code by technical responsibility.

**Structure:**
```
src/
├── models/           # Data layer (User, Task)
├── controllers/      # Business logic (authController, tasksController)
├── routes/           # Route definitions (apiAuthRoutes, taskRoutes)
├── middleware/       # Cross-cutting concerns (auth)
└── utils/            # Helpers (auth, redis)
```

**Flow:** `Route → Controller → Model → Response`

**Example:**
```typescript
// src/routes/taskRoutes.ts
router.post("/", verifyToken, createTask);

// src/controllers/tasksController.ts
export const createTask = async (req, res) => {
  const task = await Task.create({ title, owner: req.user.userId });
  res.status(201).json({ success: true, data: task });
};
```

**Pros:**
- Industry standard, widely understood
- Easy to onboard developers
- Clear separation by layer
- Simple mental model

---

### Approach 2: Module-Based Architecture ⚡ Available

Feature-oriented architecture organizing code by domain/feature.

**Structure:**
```
src/
├── modules/
│   ├── IModule.ts              # Module contract
│   ├── ModuleRegistry.ts       # Central registry
│   ├── auth/
│   │   ├── AuthModule.ts       # Auth domain
│   │   └── actions/
│   │       ├── register.ts     # Self-contained handler
│   │       └── login.ts
│   └── tasks/
│       ├── TasksModule.ts      # Tasks domain
│       └── actions/
│           ├── createTask.ts
│           ├── listTasks.ts
│           └── ...
```

**Flow:** `Route → Module → Action → Model → Response`

**Example:**
```typescript
// src/modules/tasks/TasksModule.ts
class TasksModule implements IModule {
  name = "Tasks";
  prefix = "/tasks";

  setupRoutes() {
    this.router.post("/", verifyToken, createTaskAction.handler);
  }
}

// src/modules/tasks/actions/createTask.ts
export default {
  name: "createTask",
  handler: async (req, res) => { /* logic */ }
};
```

**Pros:**
- Features grouped together (vertical slicing)
- High cohesion, low coupling
- Easy to find related code
- Scalable for large apps
- DDD-inspired principles

---

## 📁 Full Project Structure

```
src/
├── controllers/          # [MVC] Business logic
│   ├── authController.ts
│   └── tasksController.ts
│
├── routes/              # [MVC] Routes
│   ├── apiAuthRoutes.ts
│   └── taskRoutes.ts
│
├── modules/             # [MODULE] Feature modules
│   ├── IModule.ts
│   ├── ModuleRegistry.ts
│   ├── auth/
│   │   ├── AuthModule.ts
│   │   └── actions/
│   └── tasks/
│       ├── TasksModule.ts
│       └── actions/
│
├── models/              # [SHARED] Mongoose schemas
├── middleware/          # [SHARED] Auth, etc.
├── utils/               # [SHARED] Helpers
└── index.ts             # Entry point
```

## 🔄 Switching Between Architectures

Both architectures are fully implemented. Switch in [src/index.ts](src/index.ts):

```typescript
// Currently using MVC:
app.use("/api/auth", apiAuthRoutes);      // MVC routes
app.use("/api/tasks", taskRoutes);        // MVC routes

// To switch to Module-based (uncomment this and comment the above route registration logic):
// moduleRegistry.registerRoutes(app);     // Module-based routes
```

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services (app + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

**Access the API:** `http://localhost:3020`

The Docker setup includes:
- Node.js app with hot reload (port 3020)
- MongoDB 7 (port 27017)
- Automatic health checks
- Volume persistence for database

### Manual Setup (Without Docker)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
npm run dev
```

**Environment variables:**
```env
MONGO_URI=mongodb://localhost:27017/task_db
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
REDIS_URL=redis://localhost:6379  # Optional
```

---

## 📦 Tech Stack

- TypeScript + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Redis (caching)
- bcrypt (password hashing)

