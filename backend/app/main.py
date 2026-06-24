from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import connect_to_mongo, close_mongo_connection
from .api.endpoints import auth, orders, customers, payments, notifications

app = FastAPI(
    title=settings.APP_NAME,
    description="API untuk Holy Laundry Management System",
    version="1.0.0"
)

# CORS Configuration
origins = settings.ALLOWED_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

# Database Events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Root Endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Holy Laundry API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}