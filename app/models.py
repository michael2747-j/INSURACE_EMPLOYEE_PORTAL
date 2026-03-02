"""
Pydantic models (response schemas) for the Insurance System API.
These power Swagger docs and validate API responses.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import date, datetime
from decimal import Decimal


# ---------------------------
# BASE ENTITIES
# ---------------------------

class Account(BaseModel):
    account_id: str
    account_number: str
    legal_name: str
    province: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str
    created_at: datetime


class Contact(BaseModel):
    contact_id: str
    account_id: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_primary: bool
    created_at: datetime


class Policy(BaseModel):
    policy_id: str
    policy_number: str
    account_id: str
    policy_type: str
    effective_date: date
    expiry_date: date
    status: str
    premium_amount: Decimal
    created_at: datetime


class Claim(BaseModel):
    claim_id: str
    policy_id: str
    claim_number: str
    claim_type: str
    status: str
    severity: str
    incident_date: date
    filed_date: date
    description: Optional[str] = None
    estimated_loss: Decimal
    created_at: datetime


class ClaimPayment(BaseModel):
    payment_id: str
    claim_id: str
    payment_date: date
    amount: Decimal
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


# ---------------------------
# DETAIL VIEWS
# (nested responses)
# ---------------------------

class AccountDetail(Account):
    contacts: List[Contact] = []
    policies: List[Policy] = []


class PolicyAccountInfo(BaseModel):
    account_number: str
    legal_name: str


class PolicyCoverage(BaseModel):
    coverage_id: str
    policy_id: str
    coverage_type: str
    coverage_limit: Decimal
    deductible: Decimal
    created_at: datetime


class PolicyDetail(Policy):
    account: Optional[PolicyAccountInfo] = None
    coverages: List[PolicyCoverage] = []
    claims: List[Claim] = []


class ClaimPolicyInfo(BaseModel):
    policy_number: str
    policy_type: str
    account_number: str
    legal_name: str


class ClaimDetail(Claim):
    policy_info: Optional[ClaimPolicyInfo] = None
    payments: List[ClaimPayment] = []


# ---------------------------
# REPORT MODELS
# ---------------------------

class PremiumByAccount(BaseModel):
    account_id: str
    account_number: str
    legal_name: str
    province: str
    policy_count: int
    total_annual_premium: Decimal
    avg_policy_premium: Decimal


class OpenClaimsBySeverity(BaseModel):
    severity: str
    claim_count: int
    total_estimated_loss: Decimal
    avg_estimated_loss: Decimal
    oldest_claim_date: date
    newest_claim_date: date


class PolicyExpiringSoon(BaseModel):
    policy_id: str
    policy_number: str
    policy_type: str
    account_number: str
    legal_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    expiry_date: date
    premium_amount: Decimal
    days_until_expiry: int
