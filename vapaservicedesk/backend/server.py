from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os, logging, uuid, jwt, httpx, secrets
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
from dotenv import load_dotenv
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'servicedesk_production')]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'servicedesk-secret-key')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

security = HTTPBearer(auto_error=False)
app = FastAPI(title="Vapa Service Desk API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    domain: Optional[str] = None
    plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    email: EmailStr
    name: str
    password_hash: Optional[str] = None
    role: str = "agent"  # superadmin, admin, manager, agent, client
    avatar: Optional[str] = None
    department: Optional[str] = None
    active: bool = True
    google_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "agent"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    company_id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    department: Optional[str] = None
    active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Ticket(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ticket_number: str = Field(default_factory=lambda: f"TK-{uuid.uuid4().hex[:6].upper()}")
    company_id: str
    title: str
    description: str
    status: str = "open"  # open, in_progress, pending, resolved, closed
    priority: str = "medium"  # low, medium, high, critical
    category: str = "general"
    assigned_to: Optional[str] = None
    created_by: str
    client_id: Optional[str] = None
    tags: List[str] = []
    comments: List[Dict] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolved_at: Optional[datetime] = None

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    category: str = "general"
    assigned_to: Optional[str] = None
    client_id: Optional[str] = None
    tags: List[str] = []

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None

class TicketComment(BaseModel):
    content: str
    is_internal: bool = False

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    active: Optional[bool] = None

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    client_id: str
    name: str
    description: str = ""
    status: str = "active"
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assigned_workers: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    client_id: str
    name: str
    description: str = ""
    status: str = "active"
    budget: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    assigned_workers: List[str] = []

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    project_id: str
    title: str
    description: str = ""
    status: str = "pending"
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "pending"
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None

class Worker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    user_id: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    department: str = "general"
    position: str = ""
    salary: Optional[float] = None
    start_date: Optional[str] = None
    active: bool = True
    skills: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department: str = "general"
    position: str = ""
    salary: Optional[float] = None
    start_date: Optional[str] = None
    skills: List[str] = []

class Invoice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    invoice_number: str = Field(default_factory=lambda: f"INV-{uuid.uuid4().hex[:6].upper()}")
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    items: List[Dict] = []
    subtotal: float = 0
    tax: float = 0
    total: float = 0
    status: str = "draft"  # draft, sent, paid, overdue, cancelled
    issue_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    due_date: Optional[str] = None
    paid_date: Optional[str] = None
    notes: Optional[str] = None
    alert_days_before: int = 3
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvoiceCreate(BaseModel):
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    items: List[Dict] = []
    tax: float = 0
    due_date: Optional[str] = None
    notes: Optional[str] = None
    alert_days_before: int = 3

class ScheduledPayment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    title: str
    amount: float
    category: str = "other"
    recipient: Optional[str] = None
    scheduled_date: str
    recurring: bool = False
    recurring_period: Optional[str] = None  # monthly, weekly, yearly
    status: str = "pending"  # pending, paid, cancelled
    alert_days_before: int = 3
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ScheduledPaymentCreate(BaseModel):
    title: str
    amount: float
    category: str = "other"
    recipient: Optional[str] = None
    scheduled_date: str
    recurring: bool = False
    recurring_period: Optional[str] = None
    alert_days_before: int = 3
    notes: Optional[str] = None

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    type: str  # income, expense
    title: str
    amount: float
    category: str = "other"
    date: str = Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    description: Optional[str] = None
    client_id: Optional[str] = None
    invoice_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    type: str
    title: str
    amount: float
    category: str = "other"
    date: Optional[str] = None
    description: Optional[str] = None
    client_id: Optional[str] = None

class Department(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    name: str
    description: str = ""
    manager_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DepartmentCreate(BaseModel):
    name: str
    description: str = ""
    manager_id: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class CompanyRegister(BaseModel):
    company_name: str
    admin_name: str
    admin_email: EmailStr
    admin_password: str

# ============= AUTH HELPERS =============

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return User(**user)

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Se requiere rol de administrador")
    return current_user

async def require_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "superadmin", "manager"]:
        raise HTTPException(status_code=403, detail="Se requiere rol de manager o superior")
    return current_user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=Token)
async def register_company(data: CompanyRegister):
    existing = await db.users.find_one({"email": data.admin_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    company = Company(name=data.company_name)
    company_doc = company.model_dump()
    company_doc["created_at"] = company_doc["created_at"].isoformat()
    await db.companies.insert_one(company_doc)
    user = User(
        company_id=company.id,
        email=data.admin_email,
        name=data.admin_name,
        password_hash=get_password_hash(data.admin_password),
        role="admin"
    )
    user_doc = user.model_dump()
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user.id, "company_id": company.id}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse(**user.model_dump()))

@api_router.post("/auth/login", response_model=Token)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not user.get("active", True):
        raise HTTPException(status_code=401, detail="Usuario desactivado")
    if isinstance(user["created_at"], str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    token = create_access_token({"sub": user["id"], "company_id": user["company_id"]}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse(**user))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.model_dump())

@api_router.get("/auth/google")
async def google_login():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google SSO no configurado")
    redirect_uri = f"{FRONTEND_URL}/auth/google/callback"
    url = f"https://accounts.google.com/o/oauth2/auth?client_id={GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=openid email profile"
    return {"url": url}

@api_router.post("/auth/google/callback")
async def google_callback(code: str, company_id: Optional[str] = None):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Google SSO no configurado")
    redirect_uri = f"{FRONTEND_URL}/auth/google/callback"
    async with httpx.AsyncClient() as client_http:
        token_res = await client_http.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri, "grant_type": "authorization_code"
        })
        token_data = token_res.json()
        user_res = await client_http.get("https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"})
        google_user = user_res.json()
    existing = await db.users.find_one({"email": google_user["email"]}, {"_id": 0})
    if existing:
        if isinstance(existing["created_at"], str):
            existing["created_at"] = datetime.fromisoformat(existing["created_at"])
        token = create_access_token({"sub": existing["id"], "company_id": existing["company_id"]}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        return Token(access_token=token, token_type="bearer", user=UserResponse(**existing))
    if not company_id:
        raise HTTPException(status_code=400, detail="Se requiere company_id para nuevo usuario")
    user = User(company_id=company_id, email=google_user["email"], name=google_user.get("name", ""), google_id=google_user["id"], avatar=google_user.get("picture"), role="agent")
    user_doc = user.model_dump()
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    await db.users.insert_one(user_doc)
    token = create_access_token({"sub": user.id, "company_id": company_id}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", user=UserResponse(**user.model_dump()))

@api_router.put("/auth/change-password")
async def change_password(data: PasswordChange, current_user: User = Depends(get_current_user)):
    if not current_user.password_hash or not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    await db.users.update_one({"id": current_user.id}, {"$set": {"password_hash": get_password_hash(data.new_password)}})
    return {"message": "Contraseña actualizada"}

# ============= COMPANY ROUTES =============

@api_router.get("/company")
async def get_company(current_user: User = Depends(get_current_user)):
    company = await db.companies.find_one({"id": current_user.company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return company

@api_router.put("/company")
async def update_company(data: dict, current_user: User = Depends(require_admin)):
    await db.companies.update_one({"id": current_user.company_id}, {"$set": data})
    return {"message": "Empresa actualizada"}

# ============= USERS ROUTES =============

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find({"company_id": current_user.company_id}, {"_id": 0}).to_list(200)
    result = []
    for u in users:
        if isinstance(u["created_at"], str):
            u["created_at"] = datetime.fromisoformat(u["created_at"])
        result.append(UserResponse(**u))
    return result

@api_router.post("/users", response_model=UserResponse)
async def create_user(data: UserCreate, current_user: User = Depends(require_admin)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = User(company_id=current_user.company_id, email=data.email, name=data.name, password_hash=get_password_hash(data.password), role=data.role, department=data.department)
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)
    return UserResponse(**user.model_dump())

@api_router.put("/users/{user_id}")
async def update_user(user_id: str, data: dict, current_user: User = Depends(require_admin)):
    data.pop("password_hash", None)
    await db.users.update_one({"id": user_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Usuario actualizado"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(require_admin)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
    await db.users.delete_one({"id": user_id, "company_id": current_user.company_id})
    return {"message": "Usuario eliminado"}

@api_router.put("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, data: dict, current_user: User = Depends(require_admin)):
    new_password = data.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Se requiere nueva contraseña")
    await db.users.update_one({"id": user_id, "company_id": current_user.company_id}, {"$set": {"password_hash": get_password_hash(new_password)}})
    return {"message": "Contraseña restablecida"}

# ============= TICKETS ROUTES =============

@api_router.get("/tickets")
async def get_tickets(status: Optional[str] = None, priority: Optional[str] = None, assigned_to: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"company_id": current_user.company_id}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if assigned_to:
        query["assigned_to"] = assigned_to
    tickets = await db.tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    for t in tickets:
        for field in ["created_at", "updated_at", "resolved_at"]:
            if t.get(field) and isinstance(t[field], str):
                t[field] = datetime.fromisoformat(t[field])
    return tickets

@api_router.post("/tickets")
async def create_ticket(data: TicketCreate, current_user: User = Depends(get_current_user)):
    ticket = Ticket(company_id=current_user.company_id, created_by=current_user.id, **data.model_dump())
    doc = ticket.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.tickets.insert_one(doc)
    return doc

@api_router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str, current_user: User = Depends(get_current_user)):
    ticket = await db.tickets.find_one({"id": ticket_id, "company_id": current_user.company_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    for field in ["created_at", "updated_at", "resolved_at"]:
        if ticket.get(field) and isinstance(ticket[field], str):
            ticket[field] = datetime.fromisoformat(ticket[field])
    return ticket

@api_router.put("/tickets/{ticket_id}")
async def update_ticket(ticket_id: str, data: TicketUpdate, current_user: User = Depends(get_current_user)):
    update = data.model_dump(exclude_unset=True)
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    if update.get("status") == "resolved":
        update["resolved_at"] = datetime.now(timezone.utc).isoformat()
    await db.tickets.update_one({"id": ticket_id, "company_id": current_user.company_id}, {"$set": update})
    return {"message": "Ticket actualizado"}

@api_router.delete("/tickets/{ticket_id}")
async def delete_ticket(ticket_id: str, current_user: User = Depends(require_manager)):
    await db.tickets.delete_one({"id": ticket_id, "company_id": current_user.company_id})
    return {"message": "Ticket eliminado"}

@api_router.post("/tickets/{ticket_id}/comments")
async def add_comment(ticket_id: str, data: TicketComment, current_user: User = Depends(get_current_user)):
    comment = {"id": str(uuid.uuid4()), "content": data.content, "is_internal": data.is_internal, "author_id": current_user.id, "author_name": current_user.name, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.tickets.update_one({"id": ticket_id, "company_id": current_user.company_id}, {"$push": {"comments": comment}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}})
    return comment

# ============= CLIENTS ROUTES =============

@api_router.get("/clients")
async def get_clients(current_user: User = Depends(get_current_user)):
    clients = await db.clients.find({"company_id": current_user.company_id}, {"_id": 0}).sort("name", 1).to_list(500)
    for c in clients:
        if isinstance(c.get("created_at"), str):
            c["created_at"] = datetime.fromisoformat(c["created_at"])
    return clients

@api_router.post("/clients")
async def create_client(data: ClientCreate, current_user: User = Depends(get_current_user)):
    client = Client(company_id=current_user.company_id, **data.model_dump())
    doc = client.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.clients.insert_one(doc)
    return doc

@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, data: ClientUpdate, current_user: User = Depends(get_current_user)):
    update = data.model_dump(exclude_unset=True)
    await db.clients.update_one({"id": client_id, "company_id": current_user.company_id}, {"$set": update})
    return {"message": "Cliente actualizado"}

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(require_manager)):
    await db.clients.delete_one({"id": client_id, "company_id": current_user.company_id})
    return {"message": "Cliente eliminado"}

# ============= PROJECTS ROUTES =============

@api_router.get("/projects")
async def get_projects(client_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"company_id": current_user.company_id}
    if client_id:
        query["client_id"] = client_id
    projects = await db.projects.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    for p in projects:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return projects

@api_router.post("/projects")
async def create_project(data: ProjectCreate, current_user: User = Depends(get_current_user)):
    project = Project(company_id=current_user.company_id, **data.model_dump())
    doc = project.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.projects.insert_one(doc)
    return doc

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, data: dict, current_user: User = Depends(get_current_user)):
    await db.projects.update_one({"id": project_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Proyecto actualizado"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(require_manager)):
    await db.projects.delete_one({"id": project_id, "company_id": current_user.company_id})
    await db.tasks.delete_many({"project_id": project_id})
    return {"message": "Proyecto eliminado"}

# ============= TASKS ROUTES =============

@api_router.get("/projects/{project_id}/tasks")
async def get_tasks(project_id: str, current_user: User = Depends(get_current_user)):
    tasks = await db.tasks.find({"project_id": project_id, "company_id": current_user.company_id}, {"_id": 0}).to_list(200)
    for t in tasks:
        if isinstance(t.get("created_at"), str):
            t["created_at"] = datetime.fromisoformat(t["created_at"])
    return tasks

@api_router.post("/projects/{project_id}/tasks")
async def create_task(project_id: str, data: TaskCreate, current_user: User = Depends(get_current_user)):
    task = Task(company_id=current_user.company_id, project_id=project_id, created_by=current_user.id, **data.model_dump())
    doc = task.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.tasks.insert_one(doc)
    return doc

@api_router.put("/projects/{project_id}/tasks/{task_id}")
async def update_task(project_id: str, task_id: str, data: dict, current_user: User = Depends(get_current_user)):
    await db.tasks.update_one({"id": task_id, "project_id": project_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Tarea actualizada"}

@api_router.delete("/projects/{project_id}/tasks/{task_id}")
async def delete_task(project_id: str, task_id: str, current_user: User = Depends(get_current_user)):
    await db.tasks.delete_one({"id": task_id, "project_id": project_id, "company_id": current_user.company_id})
    return {"message": "Tarea eliminada"}

# ============= WORKERS ROUTES =============

@api_router.get("/workers")
async def get_workers(current_user: User = Depends(get_current_user)):
    workers = await db.workers.find({"company_id": current_user.company_id}, {"_id": 0}).sort("name", 1).to_list(200)
    for w in workers:
        if isinstance(w.get("created_at"), str):
            w["created_at"] = datetime.fromisoformat(w["created_at"])
    return workers

@api_router.post("/workers")
async def create_worker(data: WorkerCreate, current_user: User = Depends(require_manager)):
    worker = Worker(company_id=current_user.company_id, **data.model_dump())
    doc = worker.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.workers.insert_one(doc)
    return doc

@api_router.put("/workers/{worker_id}")
async def update_worker(worker_id: str, data: dict, current_user: User = Depends(require_manager)):
    await db.workers.update_one({"id": worker_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Trabajador actualizado"}

@api_router.delete("/workers/{worker_id}")
async def delete_worker(worker_id: str, current_user: User = Depends(require_manager)):
    await db.workers.delete_one({"id": worker_id, "company_id": current_user.company_id})
    return {"message": "Trabajador eliminado"}

# ============= DEPARTMENTS ROUTES =============

@api_router.get("/departments")
async def get_departments(current_user: User = Depends(get_current_user)):
    deps = await db.departments.find({"company_id": current_user.company_id}, {"_id": 0}).to_list(100)
    return deps

@api_router.post("/departments")
async def create_department(data: DepartmentCreate, current_user: User = Depends(require_admin)):
    dep = Department(company_id=current_user.company_id, **data.model_dump())
    doc = dep.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.departments.insert_one(doc)
    return doc

@api_router.delete("/departments/{dep_id}")
async def delete_department(dep_id: str, current_user: User = Depends(require_admin)):
    await db.departments.delete_one({"id": dep_id, "company_id": current_user.company_id})
    return {"message": "Departamento eliminado"}

# ============= INVOICES ROUTES =============

@api_router.get("/invoices")
async def get_invoices(status: Optional[str] = None, current_user: User = Depends(get_current_user)):
    query = {"company_id": current_user.company_id}
    if status:
        query["status"] = status
    invoices = await db.invoices.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    for inv in invoices:
        if isinstance(inv.get("created_at"), str):
            inv["created_at"] = datetime.fromisoformat(inv["created_at"])
    return invoices

@api_router.post("/invoices")
async def create_invoice(data: InvoiceCreate, current_user: User = Depends(get_current_user)):
    items = data.items
    subtotal = sum(item.get("quantity", 1) * item.get("price", 0) for item in items)
    total = subtotal + (subtotal * data.tax / 100)
    invoice = Invoice(company_id=current_user.company_id, title=data.title, client_id=data.client_id, project_id=data.project_id, items=items, subtotal=subtotal, tax=data.tax, total=total, due_date=data.due_date, notes=data.notes, alert_days_before=data.alert_days_before)
    doc = invoice.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.invoices.insert_one(doc)
    return doc

@api_router.put("/invoices/{invoice_id}")
async def update_invoice(invoice_id: str, data: dict, current_user: User = Depends(get_current_user)):
    await db.invoices.update_one({"id": invoice_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Factura actualizada"}

@api_router.delete("/invoices/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: User = Depends(require_manager)):
    await db.invoices.delete_one({"id": invoice_id, "company_id": current_user.company_id})
    return {"message": "Factura eliminada"}

# ============= SCHEDULED PAYMENTS ROUTES =============

@api_router.get("/payments/scheduled")
async def get_scheduled_payments(current_user: User = Depends(get_current_user)):
    payments = await db.scheduled_payments.find({"company_id": current_user.company_id}, {"_id": 0}).sort("scheduled_date", 1).to_list(200)
    for p in payments:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return payments

@api_router.post("/payments/scheduled")
async def create_scheduled_payment(data: ScheduledPaymentCreate, current_user: User = Depends(get_current_user)):
    payment = ScheduledPayment(company_id=current_user.company_id, **data.model_dump())
    doc = payment.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.scheduled_payments.insert_one(doc)
    return doc

@api_router.put("/payments/scheduled/{payment_id}")
async def update_scheduled_payment(payment_id: str, data: dict, current_user: User = Depends(get_current_user)):
    await db.scheduled_payments.update_one({"id": payment_id, "company_id": current_user.company_id}, {"$set": data})
    return {"message": "Pago actualizado"}

@api_router.delete("/payments/scheduled/{payment_id}")
async def delete_scheduled_payment(payment_id: str, current_user: User = Depends(get_current_user)):
    await db.scheduled_payments.delete_one({"id": payment_id, "company_id": current_user.company_id})
    return {"message": "Pago eliminado"}

# ============= TRANSACTIONS / BALANCE ROUTES =============

@api_router.get("/transactions")
async def get_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"company_id": current_user.company_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for t in transactions:
        if isinstance(t.get("created_at"), str):
            t["created_at"] = datetime.fromisoformat(t["created_at"])
    return transactions

@api_router.post("/transactions")
async def create_transaction(data: TransactionCreate, current_user: User = Depends(get_current_user)):
    transaction = Transaction(company_id=current_user.company_id, **data.model_dump())
    if data.date:
        transaction.date = data.date
    doc = transaction.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.transactions.insert_one(doc)
    return doc

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, current_user: User = Depends(require_manager)):
    await db.transactions.delete_one({"id": transaction_id, "company_id": current_user.company_id})
    return {"message": "Transacción eliminada"}

@api_router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"company_id": current_user.company_id}, {"_id": 0}).to_list(10000)
    total_income = sum(t["amount"] for t in transactions if t["type"] == "income")
    total_expense = sum(t["amount"] for t in transactions if t["type"] == "expense")
    balance = total_income - total_expense
    invoices_paid = await db.invoices.find({"company_id": current_user.company_id, "status": "paid"}, {"_id": 0}).to_list(1000)
    invoices_pending = await db.invoices.find({"company_id": current_user.company_id, "status": {"$in": ["sent", "overdue"]}}, {"_id": 0}).to_list(1000)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    upcoming_payments = await db.scheduled_payments.find({"company_id": current_user.company_id, "status": "pending", "scheduled_date": {"$gte": today}}, {"_id": 0}).sort("scheduled_date", 1).to_list(10)
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "invoices_paid_total": sum(inv["total"] for inv in invoices_paid),
        "invoices_pending_total": sum(inv["total"] for inv in invoices_pending),
        "upcoming_payments": upcoming_payments
    }

# ============= DASHBOARD ROUTES =============

@api_router.get("/dashboard")
async def get_dashboard(current_user: User = Depends(get_current_user)):
    cid = current_user.company_id
    tickets_open = await db.tickets.count_documents({"company_id": cid, "status": "open"})
    tickets_in_progress = await db.tickets.count_documents({"company_id": cid, "status": "in_progress"})
    tickets_resolved_today = await db.tickets.count_documents({"company_id": cid, "status": "resolved", "resolved_at": {"$gte": datetime.now(timezone.utc).replace(hour=0, minute=0).isoformat()}})
    tickets_critical = await db.tickets.count_documents({"company_id": cid, "status": {"$in": ["open", "in_progress"]}, "priority": "critical"})
    total_clients = await db.clients.count_documents({"company_id": cid, "active": True})
    total_workers = await db.workers.count_documents({"company_id": cid, "active": True})
    total_projects = await db.projects.count_documents({"company_id": cid, "status": "active"})
    recent_tickets = await db.tickets.find({"company_id": cid}, {"_id": 0}).sort("created_at", -1).to_list(5)
    for t in recent_tickets:
        for field in ["created_at", "updated_at"]:
            if isinstance(t.get(field), str):
                t[field] = datetime.fromisoformat(t[field])
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    alerts = []
    invoices_overdue = await db.invoices.find({"company_id": cid, "status": "sent", "due_date": {"$lt": today}}, {"_id": 0}).to_list(10)
    for inv in invoices_overdue:
        alerts.append({"type": "invoice_overdue", "message": f"Factura vencida: {inv['invoice_number']} - {inv['title']}", "id": inv["id"]})
    upcoming_payments = await db.scheduled_payments.find({"company_id": cid, "status": "pending"}, {"_id": 0}).to_list(100)
    for payment in upcoming_payments:
        days_until = (datetime.strptime(payment["scheduled_date"], "%Y-%m-%d") - datetime.now()).days
        if days_until <= payment.get("alert_days_before", 3):
            alerts.append({"type": "payment_due", "message": f"Pago próximo: {payment['title']} - {payment['amount']}€ el {payment['scheduled_date']}", "id": payment["id"]})
    return {
        "tickets": {"open": tickets_open, "in_progress": tickets_in_progress, "resolved_today": tickets_resolved_today, "critical": tickets_critical},
        "totals": {"clients": total_clients, "workers": total_workers, "projects": total_projects},
        "recent_tickets": recent_tickets,
        "alerts": alerts
    }

@api_router.get("/")
async def root():
    return {"message": "Vapa Service Desk API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    logger.info("Vapa Service Desk API iniciado")
