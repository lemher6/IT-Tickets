# IT Support — Command Center

Full-stack web application for IT Support operations.
**Backend**: C# .NET 8 Web API · **Frontend**: React 18 + TypeScript + Vite

---

## Prerequisites

| Tool     | Version | Download                              |
| -------- | ------- | ------------------------------------- |
| .NET SDK | 8.0+    | https://dotnet.microsoft.com/download |
| Node.js  | 18+     | https://nodejs.org                    |

---

## Setup

### 1. Copy the data file

Place `IT_Support_DataModel.xlsx` in:

```
backend/ITSupport.Api/Data/IT_Support_DataModel.xlsx
```

### 2. Start the backend

```bash
cd backend/ITSupport.Api
dotnet restore
dotnet run
```

API runs at **http://localhost:5000**
Swagger UI at **http://localhost:5000/swagger**

### 3. Start the frontend (new terminal)

```bash
cd frontend
npm create vite@latest frontend
npm run dev
```

App runs at **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint                  | Description                                       |
| ------ | ------------------------- | ------------------------------------------------- |
| GET    | /api/dashboard/stats      | KPIs and breakdowns                               |
| GET    | /api/tickets              | List tickets (filter: priority, open, department) |
| GET    | /api/tickets/{id}         | Single ticket                                     |
| POST   | /api/tickets              | Create new ticket                                 |
| PATCH  | /api/tickets/{id}/resolve | Resolve ticket + satisfaction score               |
| GET    | /api/agents               | All agents with stats                             |
| GET    | /api/dashboard/submitters | All submitters                                    |

---

## Project Structure

```
IT Support/
├── backend/
│   └── ITSupport.Api/
│       ├── Controllers/     # REST endpoints
│       ├── Models/          # C# data models
│       ├── Services/        # ExcelDataService (read/write xlsx)
│       ├── Data/            # Place IT_Support_DataModel.xlsx here
│       └── Program.cs
└── frontend/
    └── src/
        ├── pages/           # Dashboard, Tickets, Agents
        ├── components/      # Layout, sidebar
        ├── services/        # api.ts (fetch wrapper)
        └── types/           # TypeScript interfaces
```
