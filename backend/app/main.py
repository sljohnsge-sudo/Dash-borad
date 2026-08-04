from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import init_db
from app.routers import health, reports, seed, budget, dashboard_fy, custom_dashboard

app = FastAPI(
    title="George Steuart Health Executive Dashboard API",
    description="Backend REST API supplying live data from MySQL gsh_dashboard database built from Excel reports",
    version="2.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    init_db()

# Include Routers
app.include_router(health.router)
app.include_router(reports.router)
app.include_router(seed.router)
app.include_router(budget.router)
app.include_router(dashboard_fy.router)
app.include_router(custom_dashboard.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
