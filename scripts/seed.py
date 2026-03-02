"""
Enhanced Seed Script - Insurance System
Populates all tables with realistic, relational data
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from decimal import Decimal

import psycopg
from faker import Faker

# ---- DATABASE CONFIG ----
DB_NAME = "insurance_portfolio"
DB_USER = "postgres"
DB_PASSWORD = "Portfolio"
DB_HOST = "localhost"
DB_PORT = 5432
# -------------------------

fake = Faker()
Faker.seed(42)  # For reproducible data
random.seed(42)

# Constants
ACCOUNT_TYPES = ["individual", "business"]
ACCOUNT_STATUSES = ["active", "suspended", "closed"]
PROVINCES = ["ON", "BC", "QC", "AB", "MB", "SK", "NS", "NB", "NL", "PE"]
POLICY_TYPES = ["auto", "home", "life", "health", "business", "umbrella"]
POLICY_STATUSES = ["quote", "active", "suspended", "cancelled", "expired"]
PAYMENT_FREQUENCIES = ["monthly", "quarterly", "semi-annual", "annual"]
CONTACT_TYPES = ["primary", "billing", "claims", "other"]
CLAIM_STATUSES = ["submitted", "under_review", "approved", "denied", "closed"]
CLAIM_SEVERITIES = ["minor", "moderate", "major", "catastrophic"]
PAYMENT_METHODS = ["check", "ach", "wire", "debit_card"]

# Coverage types by policy type
COVERAGE_TYPES = {
    "auto": ["liability", "collision", "comprehensive", "uninsured_motorist"],
    "home": ["dwelling", "personal_property", "liability", "loss_of_use"],
    "life": ["term_life", "whole_life", "accidental_death"],
    "health": ["medical", "dental", "vision", "prescription"],
    "business": ["general_liability", "property", "workers_comp", "business_interruption"],
    "umbrella": ["excess_liability", "personal_injury"]
}

CLAIM_TYPES = {
    "auto": ["collision", "theft", "vandalism", "weather_damage"],
    "home": ["fire", "water_damage", "theft", "wind_damage", "liability"],
    "life": ["death_benefit", "terminal_illness"],
    "health": ["medical_treatment", "surgery", "hospitalization"],
    "business": ["property_damage", "liability_claim", "workers_injury"],
    "umbrella": ["excess_liability", "legal_defense"]
}


def generate_account_number():
    """Generate unique account number"""
    return f"ACC-{fake.unique.random_number(digits=8, fix_len=True)}"


def generate_policy_number():
    """Generate unique policy number"""
    return f"POL-{fake.unique.random_number(digits=8, fix_len=True)}"


def generate_claim_number():
    """Generate unique claim number"""
    return f"CLM-{fake.unique.random_number(digits=8, fix_len=True)}"


def generate_payment_number():
    """Generate unique payment number"""
    return f"PAY-{fake.unique.random_number(digits=8, fix_len=True)}"


def main() -> None:
    print("=" * 70)
    print("INSURANCE SYSTEM - COMPREHENSIVE DATA SEEDING")
    print("=" * 70)
    print()

    conn_str = (
        f"dbname={DB_NAME} user={DB_USER} password={DB_PASSWORD} "
        f"host={DB_HOST} port={DB_PORT}"
    )

    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            print("✓ Connected to PostgreSQL")
            print()

            # Clear existing data
            print("Clearing existing data...")
            cur.execute("TRUNCATE TABLE claim_payments RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE claims RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE policy_coverages RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE policies RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;")
            cur.execute("TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;")
            print("✓ Tables cleared")
            print()

            # ==================================================================
            # SEED ACCOUNTS (80 accounts)
            # ==================================================================
            print("Seeding accounts...")
            account_ids = []
            account_data = []

            for i in range(80):
                account_type = random.choice(ACCOUNT_TYPES)
                
                if account_type == "business":
                    legal_name = fake.company()
                else:
                    legal_name = fake.name()
                
                account_number = generate_account_number()
                email = fake.email()
                phone = fake.phone_number()[:20]
                address_line1 = fake.street_address()
                city = fake.city()
                province = random.choice(PROVINCES)
                postal_code = fake.postcode()[:7]
                
                # Most accounts active, some suspended/closed
                status = random.choices(
                    ACCOUNT_STATUSES,
                    weights=[85, 10, 5]
                )[0]

                cur.execute(
                    """
                    INSERT INTO accounts (
                        account_number, account_type, legal_name, email, phone,
                        address_line1, city, province, postal_code, status
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING account_id
                    """,
                    (account_number, account_type, legal_name, email, phone,
                     address_line1, city, province, postal_code, status)
                )
                account_id = cur.fetchone()[0]
                account_ids.append(account_id)
                account_data.append({
                    'id': account_id,
                    'type': account_type,
                    'status': status
                })

            print(f"✓ Created {len(account_ids)} accounts")

            # ==================================================================
            # SEED CONTACTS (1-3 per account)
            # ==================================================================
            print("Seeding contacts...")
            contact_count = 0

            for account in account_data:
                num_contacts = random.randint(1, 3)
                
                for i in range(num_contacts):
                    first_name = fake.first_name()
                    last_name = fake.last_name()
                    email = fake.email()
                    phone = fake.phone_number()[:20]
                    contact_type = random.choice(CONTACT_TYPES)
                    is_primary = (i == 0)  # First contact is primary

                    cur.execute(
                        """
                        INSERT INTO contacts (
                            account_id, first_name, last_name, email, phone,
                            contact_type, is_primary
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (account['id'], first_name, last_name, email, phone,
                         contact_type, is_primary)
                    )
                    contact_count += 1

            print(f"✓ Created {contact_count} contacts")

            # ==================================================================
            # SEED POLICIES (1-4 per active account)
            # ==================================================================
            print("Seeding policies...")
            policy_data = []
            policy_count = 0

            for account in account_data:
                # Only create policies for active accounts mostly
                if account['status'] != 'active' and random.random() > 0.2:
                    continue

                num_policies = random.randint(1, 4)
                
                for _ in range(num_policies):
                    policy_number = generate_policy_number()
                    policy_type = random.choice(POLICY_TYPES)
                    
                    # Policy dates
                    days_back = random.randint(0, 730)  # Up to 2 years back
                    effective_date = datetime.now().date() - timedelta(days=days_back)
                    expiry_date = effective_date + timedelta(days=365)
                    
                    # Determine status based on dates
                    today = datetime.now().date()
                    if today < effective_date:
                        status = "quote"
                    elif today > expiry_date:
                        status = "expired"
                    else:
                        status = random.choices(
                            ["active", "suspended", "cancelled"],
                            weights=[85, 5, 10]
                        )[0]
                    
                    # Premium based on policy type
                    if policy_type == "auto":
                        premium = round(random.uniform(1200, 4000), 2)
                    elif policy_type == "home":
                        premium = round(random.uniform(1000, 3500), 2)
                    elif policy_type == "life":
                        premium = round(random.uniform(500, 5000), 2)
                    elif policy_type == "health":
                        premium = round(random.uniform(2000, 8000), 2)
                    elif policy_type == "business":
                        premium = round(random.uniform(3000, 25000), 2)
                    else:  # umbrella
                        premium = round(random.uniform(300, 1500), 2)
                    
                    payment_frequency = random.choice(PAYMENT_FREQUENCIES)

                    cur.execute(
                        """
                        INSERT INTO policies (
                            account_id, policy_number, policy_type, status,
                            effective_date, expiry_date, premium_amount, payment_frequency
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING policy_id
                        """,
                        (account['id'], policy_number, policy_type, status,
                         effective_date, expiry_date, premium, payment_frequency)
                    )
                    policy_id = cur.fetchone()[0]
                    policy_data.append({
                        'id': policy_id,
                        'type': policy_type,
                        'status': status,
                        'effective_date': effective_date,
                        'premium': premium
                    })
                    policy_count += 1

            print(f"✓ Created {policy_count} policies")

            # ==================================================================
            # SEED POLICY COVERAGES (2-4 per policy)
            # ==================================================================
            print("Seeding policy coverages...")
            coverage_count = 0

            for policy in policy_data:
                coverages = COVERAGE_TYPES.get(policy['type'], ["general_coverage"])
                num_coverages = min(random.randint(2, 4), len(coverages))
                selected_coverages = random.sample(coverages, num_coverages)
                
                # Distribute premium across coverages
                premium_per_coverage = policy['premium'] / num_coverages
                
                for coverage_type in selected_coverages:
                    # Coverage limits based on type
                    if "liability" in coverage_type:
                        limit = random.choice([100000, 250000, 500000, 1000000])
                    elif "property" in coverage_type or "dwelling" in coverage_type:
                        limit = random.choice([200000, 500000, 1000000, 2000000])
                    else:
                        limit = random.choice([25000, 50000, 100000, 250000])
                    
                    deductible = random.choice([500, 1000, 2500, 5000])
                    coverage_premium = round(premium_per_coverage * random.uniform(0.8, 1.2), 2)

                    cur.execute(
                        """
                        INSERT INTO policy_coverages (
                            policy_id, coverage_type, coverage_limit, deductible, premium_amount
                        )
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (policy['id'], coverage_type, limit, deductible, coverage_premium)
                    )
                    coverage_count += 1

            print(f"✓ Created {coverage_count} policy coverages")

            # ==================================================================
            # SEED CLAIMS (~40% of active policies)
            # ==================================================================
            print("Seeding claims...")
            claim_data = []
            claim_count = 0

            active_policies = [p for p in policy_data if p['status'] == 'active']
            policies_with_claims = random.sample(
                active_policies,
                int(len(active_policies) * 0.4)
            )

            for policy in policies_with_claims:
                # Some policies have multiple claims
                num_claims = random.choices([1, 2, 3], weights=[70, 25, 5])[0]
                
                for _ in range(num_claims):
                    claim_number = generate_claim_number()
                    claim_types = CLAIM_TYPES.get(policy['type'], ["general_claim"])
                    claim_type = random.choice(claim_types)
                    
                    # Claim dates within policy period
                    days_after_effective = random.randint(30, 300)
                    incident_date = policy['effective_date'] + timedelta(days=days_after_effective)
                    filed_date = incident_date + timedelta(days=random.randint(1, 14))
                    
                    severity = random.choices(
                        CLAIM_SEVERITIES,
                        weights=[40, 35, 20, 5]
                    )[0]
                    
                    # Loss amounts based on severity
                    severity_multipliers = {
                        "minor": (500, 5000),
                        "moderate": (5000, 25000),
                        "major": (25000, 100000),
                        "catastrophic": (100000, 500000)
                    }
                    min_loss, max_loss = severity_multipliers[severity]
                    estimated_loss = round(random.uniform(min_loss, max_loss), 2)
                    
                    # Status and approval
                    status = random.choices(
                        CLAIM_STATUSES,
                        weights=[10, 20, 40, 10, 20]
                    )[0]
                    
                    approved_amount = None
                    closed_date = None
                    
                    if status in ["approved", "closed"]:
                        # Approved amount is 70-100% of estimated loss
                        approved_amount = round(estimated_loss * random.uniform(0.7, 1.0), 2)
                        
                    if status == "closed":
                        closed_date = filed_date + timedelta(days=random.randint(30, 180))
                    
                    description = fake.text(max_nb_chars=200)

                    cur.execute(
                        """
                        INSERT INTO claims (
                            policy_id, claim_number, claim_type, status, severity,
                            incident_date, filed_date, description, estimated_loss,
                            approved_amount, closed_date
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING claim_id
                        """,
                        (policy['id'], claim_number, claim_type, status, severity,
                         incident_date, filed_date, description, estimated_loss,
                         approved_amount, closed_date)
                    )
                    claim_id = cur.fetchone()[0]
                    claim_data.append({
                        'id': claim_id,
                        'status': status,
                        'approved_amount': approved_amount,
                        'filed_date': filed_date
                    })
                    claim_count += 1

            print(f"✓ Created {claim_count} claims")

            # ==================================================================
            # SEED CLAIM PAYMENTS (for closed claims)
            # ==================================================================
            print("Seeding claim payments...")
            payment_count = 0

            closed_claims = [c for c in claim_data if c['status'] == 'closed' and c['approved_amount']]

            for claim in closed_claims:
                # Some claims have multiple payments
                num_payments = random.choices([1, 2, 3], weights=[60, 30, 10])[0]
                
                remaining_amount = Decimal(str(claim['approved_amount']))
                
                for i in range(num_payments):
                    payment_number = generate_payment_number()
                    
                    # Last payment gets remaining amount
                    if i == num_payments - 1:
                        payment_amount = float(remaining_amount)
                    else:
                        # Split amount
                        payment_amount = round(
                            float(remaining_amount) * random.uniform(0.3, 0.6),
                            2
                        )
                        remaining_amount -= Decimal(str(payment_amount))
                    
                    payment_date = claim['filed_date'] + timedelta(days=random.randint(45, 120))
                    payment_method = random.choice(PAYMENT_METHODS)
                    payee_name = fake.name()
                    notes = fake.sentence() if random.random() > 0.5 else None

                    cur.execute(
                        """
                        INSERT INTO claim_payments (
                            claim_id, payment_number, payment_amount, payment_date,
                            payment_method, payee_name, notes
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (claim['id'], payment_number, payment_amount, payment_date,
                         payment_method, payee_name, notes)
                    )
                    payment_count += 1

            print(f"✓ Created {payment_count} claim payments")

            # Commit all changes
            conn.commit()

            # ==================================================================
            # SUMMARY
            # ==================================================================
            print()
            print("=" * 70)
            print("DATA SEEDING COMPLETE ✅")
            print("=" * 70)
            print()
            print(f"  Accounts:          {len(account_ids)}")
            print(f"  Contacts:          {contact_count}")
            print(f"  Policies:          {policy_count}")
            print(f"  Policy Coverages:  {coverage_count}")
            print(f"  Claims:            {claim_count}")
            print(f"  Claim Payments:    {payment_count}")
            print()
            print("Database is ready for querying and API development!")
            print()


if __name__ == "__main__":
    main()