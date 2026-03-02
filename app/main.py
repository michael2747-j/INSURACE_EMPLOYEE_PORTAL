"""
Insurance System - Enhanced FastAPI Backend
Complete REST API with CRUD operations and advanced SQL reporting

This backend demonstrates:
- Safe SQL write operations (parameterized queries)
- Complex reporting queries (JOINs, CTEs, window functions)
- Transaction management
- Constraint handling
- RESTful API design
"""

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from decimal import Decimal

# Import our modules
from .schema import (
    AccountCreate, AccountUpdate, AccountResponse,
    PolicyCreate, PolicyUpdate, PolicyResponse,
    ClaimCreate, ClaimUpdate, ClaimResponse,
    ClaimPaymentCreate, MessageResponse
)
from . import crud, reports
from .db import execute_query, get_db_connection

# Initialize FastAPI app
app = FastAPI(
    title="Insurance System API - SQL Showcase",
    description="Production-ready insurance data management with advanced SQL capabilities",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ============================================================================
# ROOT & HEALTH CHECK
# ============================================================================

@app.get("/")
def root():
    """API root - shows available endpoint categories"""
    return {
        "message": "Insurance System API - SQL Showcase Edition",
        "version": "2.0.0",
        "features": [
            "Full CRUD operations (Create, Read, Update, Delete)",
            "Advanced SQL reporting with complex queries",
            "Transaction-safe data manipulation",
            "Constraint validation and enforcement"
        ],
        "endpoints": {
            "documentation": "/docs",
            "accounts_crud": "/accounts (GET, POST), /accounts/{id} (GET, PUT, DELETE)",
            "policies_crud": "/policies (GET, POST), /policies/{id} (GET, PUT, DELETE)",
            "claims_crud": "/claims (GET, POST), /claims/{id} (GET, PUT, DELETE)",
            "payments": "/payments (POST)",
            "reports": "/reports/* (8 advanced reporting endpoints)"
        }
    }

@app.get("/health")
def health_check():
    """Database connectivity check"""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        
        return {
            "status": "healthy",
            "database": "connected",
            "version": "2.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

# ============================================================================
# ACCOUNT ENDPOINTS (CRUD)
# ============================================================================

@app.get("/accounts")
def get_accounts(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    province: Optional[str] = None,
    search: Optional[str] = None
):
    """
    Get list of accounts with filtering
    
    SQL Skills Demonstrated:
    - Parameterized WHERE clauses
    - Dynamic query building
    - LIMIT/OFFSET pagination
    - ILIKE for case-insensitive search
    """
    query = "SELECT * FROM accounts WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = %s"
        params.append(status)
    
    if province:
        query += " AND province = %s"
        params.append(province)
    
    if search:
        query += " AND (legal_name ILIKE %s OR email ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    
    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    return execute_query(query, tuple(params))

@app.post("/accounts", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_account(account: AccountCreate):
    """
    Create a new account
    
    SQL Skills Demonstrated:
    - INSERT with RETURNING
    - UUID generation
    - Constraint validation
    """
    try:
        result = crud.create_account(account)
        return {
            "message": f"Account created successfully: {result['legal_name']}",
            "id": result['account_id']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/accounts/{account_id}")
def get_account(account_id: str):
    """Get detailed account information with related data"""
    # Get account
    account = execute_query(
        "SELECT * FROM accounts WHERE account_id = %s",
        (account_id,),
        fetch_one=True
    )
    
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Get contacts
    contacts = execute_query(
        "SELECT * FROM contacts WHERE account_id = %s",
        (account_id,)
    )
    
    # Get policies
    policies = execute_query(
        "SELECT * FROM policies WHERE account_id = %s ORDER BY created_at DESC",
        (account_id,)
    )
    
    return {
        **account,
        "contacts": contacts,
        "policies": policies
    }

@app.put("/accounts/{account_id}", response_model=MessageResponse)
def update_account(account_id: str, updates: AccountUpdate):
    """
    Update account information
    
    SQL Skills Demonstrated:
    - Dynamic UPDATE with partial updates
    - Audit trigger activation
    """
    try:
        result = crud.update_account(account_id, updates)
        if not result:
            raise HTTPException(status_code=404, detail="Account not found or no changes")
        return {
            "message": f"Account updated: {result['legal_name']}",
            "id": result['account_id']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/accounts/{account_id}", response_model=MessageResponse)
def delete_account(account_id: str):
    """
    Delete account (CASCADE to contacts/policies)
    
    SQL Skills Demonstrated:
    - CASCADE delete behavior
    - Referential integrity
    """
    try:
        rows_deleted = crud.delete_account(account_id)
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Account not found")
        return {"message": f"Account deleted successfully (with {rows_deleted} cascaded deletes)"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# POLICY ENDPOINTS (CRUD)
# ============================================================================

@app.get("/policies")
def get_policies(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    policy_type: Optional[str] = None,
    account_id: Optional[str] = None
):
    """Get list of policies with filtering"""
    query = "SELECT * FROM policies WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = %s"
        params.append(status)
    
    if policy_type:
        query += " AND policy_type = %s"
        params.append(policy_type)
    
    if account_id:
        query += " AND account_id = %s"
        params.append(account_id)
    
    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    return execute_query(query, tuple(params))

@app.post("/policies", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_policy(policy: PolicyCreate):
    """
    Create a new policy
    
    SQL Skills Demonstrated:
    - Foreign key validation
    - Date constraint checking
    - Business logic validation
    """
    try:
        result = crud.create_policy(policy)
        return {
            "message": f"Policy created: {result['policy_number']}",
            "id": result['policy_id']
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/policies/{policy_id}", response_model=MessageResponse)
def update_policy(policy_id: str, updates: PolicyUpdate):
    """Update policy (triggers audit trail)"""
    try:
        result = crud.update_policy(policy_id, updates)
        if not result:
            raise HTTPException(status_code=404, detail="Policy not found or no changes")
        return {
            "message": f"Policy updated: {result['policy_number']}",
            "id": result['policy_id']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/policies/{policy_id}", response_model=MessageResponse)
def delete_policy(policy_id: str):
    """
    Delete policy (RESTRICT if claims exist)
    
    SQL Skills Demonstrated:
    - ON DELETE RESTRICT enforcement
    - Constraint error handling
    """
    try:
        rows_deleted = crud.delete_policy(policy_id)
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Policy not found")
        return {"message": "Policy deleted successfully"}
    except Exception as e:
        # Likely constraint violation (has claims)
        raise HTTPException(status_code=409, detail=f"Cannot delete policy: {str(e)}")

# ============================================================================
# CLAIM ENDPOINTS (CRUD)
# ============================================================================

@app.get("/claims")
def get_claims(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    severity: Optional[str] = None,
    policy_id: Optional[str] = None
):
    """Get list of claims with filtering"""
    query = "SELECT * FROM claims WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = %s"
        params.append(status)
    
    if severity:
        query += " AND severity = %s"
        params.append(severity)
    
    if policy_id:
        query += " AND policy_id = %s"
        params.append(policy_id)
    
    query += " ORDER BY filed_date DESC LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    return execute_query(query, tuple(params))

@app.post("/claims", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_claim(claim: ClaimCreate):
    """
    File a new claim
    
    SQL Skills Demonstrated:
    - Multi-table business logic validation
    - Date constraint checking
    - Status workflow enforcement
    """
    try:
        result = crud.create_claim(claim)
        return {
            "message": f"Claim filed: {result['claim_number']}",
            "id": result['claim_id']
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/claims/{claim_id}", response_model=MessageResponse)
def update_claim(claim_id: str, updates: ClaimUpdate):
    """Update claim (triggers audit trail)"""
    try:
        result = crud.update_claim(claim_id, updates)
        if not result:
            raise HTTPException(status_code=404, detail="Claim not found or no changes")
        return {
            "message": f"Claim updated: {result['claim_number']}",
            "id": result['claim_id']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# PAYMENT ENDPOINTS
# ============================================================================

@app.post("/payments", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payment: ClaimPaymentCreate):
    """
    Record a claim payment
    
    SQL Skills Demonstrated:
    - Financial validation logic
    - Transaction integrity
    - Business rule enforcement (don't exceed approved amount)
    """
    try:
        result = crud.create_claim_payment(payment)
        return {
            "message": f"Payment recorded: {result['payment_number']} for ${result['payment_amount']}",
            "id": result['payment_id']
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ADVANCED REPORTING ENDPOINTS
# These endpoints showcase complex SQL from reporting_queries.sql
# ============================================================================

@app.get("/reports/top-profitable-accounts")
def report_top_profitable_accounts(limit: int = Query(10, ge=1, le=50)):
    """
    Top accounts by profitability (premium - claims paid)
    
    SQL Complexity:
    - 4-table JOIN
    - Aggregation (SUM, COUNT)
    - Loss ratio calculation
    - COALESCE for NULL handling
    """
    return reports.get_top_profitable_accounts(limit)

@app.get("/reports/claims-performance")
def report_claims_performance():
    """
    Monthly claims processing metrics
    
    SQL Complexity:
    - Date grouping (TO_CHAR)
    - Conditional aggregation (CASE)
    - Date arithmetic (EXTRACT)
    - Percentage calculations
    """
    return reports.get_claims_processing_performance()

@app.get("/reports/policy-type-analysis")
def report_policy_type_performance():
    """
    Performance analysis by policy type
    
    SQL Complexity:
    - Multi-table aggregation
    - Per-policy metrics
    - Profitability analysis
    """
    return reports.get_policy_type_performance()

@app.get("/reports/geographic-performance")
def report_geographic_performance():
    """
    Performance metrics by province
    
    SQL Complexity:
    - Geographic aggregation
    - Regional metrics
    - Customer density analysis
    """
    return reports.get_geographic_performance()

@app.get("/reports/high-risk-accounts")
def report_high_risk_accounts(min_claims: int = Query(2, ge=1)):
    """
    Accounts with multiple claims (risk analysis)
    
    SQL Complexity:
    - Common Table Expression (CTE)
    - Risk scoring
    - HAVING clause filtering
    """
    return reports.get_high_risk_accounts(min_claims)

@app.get("/reports/customer-lifetime-value")
def report_customer_lifetime_value(limit: int = Query(20, ge=1, le=100)):
    """
    Customer ranking by lifetime value
    
    SQL Complexity:
    - Window functions (RANK, NTILE)
    - Running totals (SUM OVER)
    - Percentile analysis
    """
    return reports.get_customer_lifetime_value(limit)

@app.get("/reports/claim-severity-trends")
def report_claim_severity_trends():
    """
    Claim severity trends with moving averages
    
    SQL Complexity:
    - Partitioned window functions
    - Moving average (ROWS BETWEEN)
    - Cumulative sums
    - Time series analysis
    """
    return reports.get_claim_severity_trends()

@app.get("/reports/policies-expiring-soon")
def report_policies_expiring_soon(
    days: int = Query(90, ge=1, le=365),
    min_premium: float = Query(2000, ge=0)
):
    """
    High-value policies expiring soon with risk assessment
    
    SQL Complexity:
    - Date interval filtering
    - CASE-based risk categorization
    - Multi-table aggregation
    """
    return reports.get_policies_expiring_soon(days, min_premium)

@app.get("/reports/open-claims-by-severity")
def report_open_claims_by_severity():
    """Uses vw_open_claims_by_severity view"""
    return reports.get_open_claims_by_severity()

@app.get("/reports/premium-by-account")
def report_premium_by_account(limit: int = Query(50, ge=1, le=100)):
    """Uses vw_premium_by_account view"""
    return reports.get_premium_by_account(limit)

@app.get("/reports/account-portfolio-summary")
def report_account_portfolio_summary():
    """Uses vw_account_portfolio_summary view"""
    return reports.get_account_portfolio_summary()

# ============================================================================
# AUDIT LOG ENDPOINT
# ============================================================================

@app.get("/audit-log")
def get_audit_log(
    table_name: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500)
):
    """
    View audit trail of changes
    
    SQL Skills Demonstrated:
    - Audit table querying
    - JSONB data retrieval
    - Change tracking
    """
    query = "SELECT * FROM audit_log WHERE 1=1"
    params = []
    
    if table_name:
        query += " AND table_name = %s"
        params.append(table_name)
    
    query += " ORDER BY changed_at DESC LIMIT %s"
    params.append(limit)
    
    return execute_query(query, tuple(params))

@app.get("/debug/db")
def debug_db():
    from app.db import DB_CONFIG
    return DB_CONFIG

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)