"""
CRUD Operations Module
Handles all database write operations with proper SQL practices
Demonstrates: Parameterized queries, transactions, constraint handling
"""

from datetime import datetime
from typing import Optional, Dict, Any
import uuid
from .db import execute_write, execute_query
from .schema import (
    AccountCreate, AccountUpdate,
    PolicyCreate, PolicyUpdate,
    ClaimCreate, ClaimUpdate,
    ClaimPaymentCreate
)

# ============================================================================
# ACCOUNT CRUD OPERATIONS
# ============================================================================

def create_account(account: AccountCreate) -> Dict[str, Any]:
    """
    Create a new account with auto-generated account number
    
    SQL Skills Demonstrated:
    - Parameterized INSERT (SQL injection prevention)
    - RETURNING clause
    - UUID generation
    """
    # Generate unique account number
    account_number = f"ACC-{str(uuid.uuid4())[:8].upper()}"
    
    query = """
        INSERT INTO accounts (
            account_number, account_type, legal_name, email, phone,
            address_line1, address_line2, city, province, postal_code, status
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'active')
        RETURNING account_id, account_number, legal_name, created_at
    """
    
    params = (
        account_number,
        account.account_type,
        account.legal_name,
        account.email,
        account.phone,
        account.address_line1,
        account.address_line2,
        account.city,
        account.province,
        account.postal_code
    )
    
    result = execute_write(query, params, returning=True)
    return result

def update_account(account_id: str, updates: AccountUpdate) -> Optional[Dict[str, Any]]:
    """
    Update account with partial updates
    
    SQL Skills Demonstrated:
    - Dynamic UPDATE with only changed fields
    - WHERE clause with UUID
    - NULL handling
    """
    # Build dynamic UPDATE query with only provided fields
    update_fields = []
    params = []
    
    update_data = updates.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        update_fields.append(f"{field} = %s")
        params.append(value)
    
    if not update_fields:
        return None
    
    # Add updated_at
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    
    # Add account_id for WHERE clause
    params.append(account_id)
    
    query = f"""
        UPDATE accounts
        SET {', '.join(update_fields)}
        WHERE account_id = %s
        RETURNING account_id, account_number, legal_name, status, updated_at
    """
    
    result = execute_write(query, tuple(params), returning=True)
    return result

def delete_account(account_id: str) -> int:
    """
    Delete account (will CASCADE to related policies/contacts)
    
    SQL Skills Demonstrated:
    - CASCADE delete behavior
    - Referential integrity
    """
    query = "DELETE FROM accounts WHERE account_id = %s"
    return execute_write(query, (account_id,))

# ============================================================================
# POLICY CRUD OPERATIONS
# ============================================================================

def create_policy(policy: PolicyCreate) -> Dict[str, Any]:
    """
    Create a new policy with validation
    
    SQL Skills Demonstrated:
    - Foreign key validation
    - CHECK constraint validation
    - Date range validation
    """
    # Generate unique policy number
    policy_number = f"POL-{str(uuid.uuid4())[:8].upper()}"
    
    # Validate account exists
    account_check = execute_query(
        "SELECT account_id FROM accounts WHERE account_id = %s",
        (policy.account_id,),
        fetch_one=True
    )
    
    if not account_check:
        raise ValueError(f"Account {policy.account_id} not found")
    
    # Validate dates
    if policy.expiry_date <= policy.effective_date:
        raise ValueError("Expiry date must be after effective date")
    
    query = """
        INSERT INTO policies (
            account_id, policy_number, policy_type, status,
            effective_date, expiry_date, premium_amount, payment_frequency
        )
        VALUES (%s, %s, %s, 'quote', %s, %s, %s, %s)
        RETURNING policy_id, policy_number, policy_type, premium_amount, created_at
    """
    
    params = (
        policy.account_id,
        policy_number,
        policy.policy_type,
        policy.effective_date,
        policy.expiry_date,
        float(policy.premium_amount),
        policy.payment_frequency
    )
    
    result = execute_write(query, params, returning=True)
    return result

def update_policy(policy_id: str, updates: PolicyUpdate) -> Optional[Dict[str, Any]]:
    """
    Update policy status or premium
    
    SQL Skills Demonstrated:
    - Audit trigger activation
    - Status transition logic
    """
    update_fields = []
    params = []
    
    update_data = updates.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "premium_amount":
            update_fields.append(f"{field} = %s")
            params.append(float(value))
        else:
            update_fields.append(f"{field} = %s")
            params.append(value)
    
    if not update_fields:
        return None
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    params.append(policy_id)
    
    query = f"""
        UPDATE policies
        SET {', '.join(update_fields)}
        WHERE policy_id = %s
        RETURNING policy_id, policy_number, status, premium_amount, updated_at
    """
    
    result = execute_write(query, tuple(params), returning=True)
    return result

def delete_policy(policy_id: str) -> int:
    """
    Delete policy (will CASCADE to coverages, RESTRICT if claims exist)
    
    SQL Skills Demonstrated:
    - ON DELETE RESTRICT behavior
    - Constraint enforcement
    """
    query = "DELETE FROM policies WHERE policy_id = %s"
    return execute_write(query, (policy_id,))

# ============================================================================
# CLAIM CRUD OPERATIONS
# ============================================================================

def create_claim(claim: ClaimCreate) -> Dict[str, Any]:
    """
    File a new claim
    
    SQL Skills Demonstrated:
    - Multi-table validation
    - Date logic validation
    - Automatic number generation
    """
    # Generate unique claim number
    claim_number = f"CLM-{str(uuid.uuid4())[:8].upper()}"
    
    # Validate policy exists and is active
    policy_check = execute_query(
        "SELECT policy_id, status FROM policies WHERE policy_id = %s",
        (claim.policy_id,),
        fetch_one=True
    )
    
    if not policy_check:
        raise ValueError(f"Policy {claim.policy_id} not found")
    
    if policy_check['status'] not in ['active', 'quote']:
        raise ValueError(f"Cannot file claim on {policy_check['status']} policy")
    
    # Validate dates
    if claim.filed_date < claim.incident_date:
        raise ValueError("Filed date cannot be before incident date")
    
    query = """
        INSERT INTO claims (
            policy_id, claim_number, claim_type, status, severity,
            incident_date, filed_date, description, estimated_loss
        )
        VALUES (%s, %s, %s, 'submitted', %s, %s, %s, %s, %s)
        RETURNING claim_id, claim_number, claim_type, severity, status, created_at
    """
    
    params = (
        claim.policy_id,
        claim_number,
        claim.claim_type,
        claim.severity,
        claim.incident_date,
        claim.filed_date,
        claim.description,
        float(claim.estimated_loss) if claim.estimated_loss else None
    )
    
    result = execute_write(query, params, returning=True)
    return result

def update_claim(claim_id: str, updates: ClaimUpdate) -> Optional[Dict[str, Any]]:
    """
    Update claim status or approval amount
    
    SQL Skills Demonstrated:
    - Status workflow enforcement
    - Conditional updates
    - Audit trail (trigger captures this)
    """
    update_fields = []
    params = []
    
    update_data = updates.model_dump(exclude_unset=True)
    
    # Special handling for approved_amount
    if 'approved_amount' in update_data and update_data['approved_amount'] is not None:
        update_fields.append("approved_amount = %s")
        params.append(float(update_data['approved_amount']))
        del update_data['approved_amount']
    
    for field, value in update_data.items():
        update_fields.append(f"{field} = %s")
        params.append(value)
    
    if not update_fields:
        return None
    
    update_fields.append("updated_at = CURRENT_TIMESTAMP")
    params.append(claim_id)
    
    query = f"""
        UPDATE claims
        SET {', '.join(update_fields)}
        WHERE claim_id = %s
        RETURNING claim_id, claim_number, status, approved_amount, updated_at
    """
    
    result = execute_write(query, tuple(params), returning=True)
    return result

# ============================================================================
# CLAIM PAYMENT OPERATIONS
# ============================================================================

def create_claim_payment(payment: ClaimPaymentCreate) -> Dict[str, Any]:
    """
    Record a payment on an approved claim
    
    SQL Skills Demonstrated:
    - Business logic validation
    - Transaction integrity
    - Financial calculations
    """
    # Generate unique payment number
    payment_number = f"PAY-{str(uuid.uuid4())[:8].upper()}"
    
    # Validate claim exists and is approved
    claim_check = execute_query(
        "SELECT claim_id, status, approved_amount FROM claims WHERE claim_id = %s",
        (payment.claim_id,),
        fetch_one=True
    )
    
    if not claim_check:
        raise ValueError(f"Claim {payment.claim_id} not found")
    
    if claim_check['status'] not in ['approved', 'closed']:
        raise ValueError(f"Cannot pay on {claim_check['status']} claim")
    
    # Check total payments don't exceed approved amount
    total_paid = execute_query(
        "SELECT COALESCE(SUM(payment_amount), 0) as total FROM claim_payments WHERE claim_id = %s",
        (payment.claim_id,),
        fetch_one=True
    )
    
    if claim_check['approved_amount']:
        remaining = float(claim_check['approved_amount']) - float(total_paid['total'])
        if float(payment.payment_amount) > remaining:
            raise ValueError(f"Payment exceeds remaining approved amount. Remaining: {remaining}")
    
    query = """
        INSERT INTO claim_payments (
            claim_id, payment_number, payment_amount, payment_date,
            payment_method, payee_name, notes
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING payment_id, payment_number, payment_amount, payment_date
    """
    
    params = (
        payment.claim_id,
        payment_number,
        float(payment.payment_amount),
        payment.payment_date,
        payment.payment_method,
        payment.payee_name,
        payment.notes
    )
    
    result = execute_write(query, params, returning=True)
    return result