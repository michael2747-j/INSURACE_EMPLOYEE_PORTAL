"""
Pydantic Schemas for Request/Response Validation
Ensures data integrity and provides automatic API documentation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
# ============================================================================
# REQUEST SCHEMAS (for POST/PUT operations)
# ============================================================================

class AccountCreate(BaseModel):
    """Schema for creating a new account"""
    account_type: str = Field(..., pattern="^(individual|business)$")
    legal_name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    province: str = Field(..., pattern="^(ON|BC|QC|AB|MB|SK|NS|NB|NL|PE)$")
    postal_code: Optional[str] = Field(None, max_length=7)

class AccountUpdate(BaseModel):
    """Schema for updating an existing account"""
    legal_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    province: Optional[str] = Field(None, pattern="^(ON|BC|QC|AB|MB|SK|NS|NB|NL|PE)$")
    postal_code: Optional[str] = Field(None, max_length=7)
    status: Optional[str] = Field(None, pattern="^(active|suspended|closed)$")

class PolicyCreate(BaseModel):
    """Schema for creating a new policy"""
    account_id: str
    policy_type: str = Field(..., pattern="^(auto|home|life|health|business|umbrella)$")
    effective_date: date
    expiry_date: date
    premium_amount: Decimal = Field(..., gt=0)
    payment_frequency: str = Field(..., pattern="^(monthly|quarterly|semi-annual|annual)$")

class PolicyUpdate(BaseModel):
    """Schema for updating an existing policy"""
    status: Optional[str] = Field(None, pattern="^(quote|active|suspended|cancelled|expired)$")
    premium_amount: Optional[Decimal] = Field(None, gt=0)
    payment_frequency: Optional[str] = Field(None, pattern="^(monthly|quarterly|semi-annual|annual)$")

class ClaimCreate(BaseModel):
    """Schema for creating a new claim"""
    policy_id: str
    claim_type: str = Field(..., min_length=1, max_length=30)
    severity: str = Field(..., pattern="^(minor|moderate|major|catastrophic)$")
    incident_date: date
    filed_date: date
    description: Optional[str] = None
    estimated_loss: Optional[Decimal] = Field(None, ge=0)

class ClaimUpdate(BaseModel):
    """Schema for updating an existing claim"""
    status: Optional[str] = Field(None, pattern="^(submitted|under_review|approved|denied|closed)$")
    approved_amount: Optional[Decimal] = Field(None, ge=0)
    closed_date: Optional[date] = None
    description: Optional[str] = None

class ClaimPaymentCreate(BaseModel):
    """Schema for creating a claim payment"""
    claim_id: str
    payment_amount: Decimal = Field(..., gt=0)
    payment_date: date
    payment_method: str = Field(..., pattern="^(check|ach|wire|debit_card)$")
    payee_name: str = Field(..., min_length=1, max_length=255)
    notes: Optional[str] = None

# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class AccountResponse(BaseModel):
    """Schema for account responses"""
    account_id: str
    account_number: str
    account_type: str
    legal_name: str
    email: Optional[str]
    phone: Optional[str]
    province: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PolicyResponse(BaseModel):
    """Schema for policy responses"""
    policy_id: str
    account_id: str
    policy_number: str
    policy_type: str
    status: str
    effective_date: date
    expiry_date: date
    premium_amount: float
    payment_frequency: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClaimResponse(BaseModel):
    """Schema for claim responses"""
    claim_id: str
    policy_id: str
    claim_number: str
    claim_type: str
    status: str
    severity: str
    incident_date: date
    filed_date: date
    estimated_loss: Optional[float]
    approved_amount: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    id: UUID