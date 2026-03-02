import os
import random
from datetime import date, datetime, timedelta
import psycopg

# -----------------------------
# Config
# -----------------------------
DEFAULT_DB = {
    "host": "localhost",
    "port": 5432,
    "dbname": "insurance_portfolio",
    "user": "postgres",
    "password": "Portfolio",
}

SEED_COMPANIES = 50
RESET_BEFORE_SEED = False


# -----------------------------
# Helpers
# -----------------------------
def conn_params():
    """Uses DATABASE_URL if present, otherwise falls back to defaults."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    return (
        f"host={DEFAULT_DB['host']} port={DEFAULT_DB['port']} "
        f"dbname={DEFAULT_DB['dbname']} user={DEFAULT_DB['user']} password={DEFAULT_DB['password']}"
    )

def now_ts():
    return datetime.now()

def rand_phone():
    return f"({random.randint(200, 999)}) {random.randint(200, 999)}-{random.randint(1000, 9999)}"

def rand_postal():
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return f"{random.choice(letters)}{random.randint(0,9)}{random.choice(letters)}{random.randint(0,9)}{random.choice(letters)}{random.randint(0,9)}"

def rand_account_number(i: int) -> str:
    return f"ACC-{i:04d}{random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ')}{random.randint(10,99)}"

def rand_policy_number(i: int) -> str:
    return f"POL-{i:05d}"

def rand_claim_number(i: int) -> str:
    return f"CLM-{i:05d}"

def rand_payment_number(i: int) -> str:
    return f"PAY-{i:06d}"

def random_date_in_past(days_back: int):
    return date.today() - timedelta(days=random.randint(1, days_back))

def random_date_range(start: date, min_days: int, max_days: int):
    return start + timedelta(days=random.randint(min_days, max_days))

# -----------------------------
# DB Reset (optional)
# -----------------------------
def reset_tables(cur):
    # reverse dependency order
    cur.execute("TRUNCATE TABLE claim_payments RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE claims RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE policy_coverages RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE policies RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;")

# -----------------------------
# Seed Data Pools
# -----------------------------
COMPANY_NAMES = [
    "Northern Logistics Inc", "Maple Industries Ltd", "Pacific Transport Inc",
    "Alberta Energy Solutions", "Maritime Fisheries Co-op", "Prairie Agriculture Group",
    "Quebec Manufacturing Corp", "Northern Mining Operations", "City of Winnipeg",
    "Atlantic Shipping Lines", "BlueRiver Construction", "Evergreen Retail Group",
    "Summit Auto Fleet", "IronGate Security Services", "Sunrise Healthcare Partners",
]

PROVINCES = ["ON", "BC", "AB", "QC", "MB", "NS", "NB", "SK", "NL", "PE", "NT", "NU", "YT"]
POLICY_TYPES = ["auto", "home", "life", "health", "business", "umbrella"]
PAYMENT_FREQUENCY = ["monthly", "quarterly", "annual"]
CLAIM_TYPES = ["property_damage", "bodily_injury", "theft", "collision", "fire"]
CLAIM_STATUS = ["submitted", "under_review", "approved", "denied", "closed"]
SEVERITY = ["minor", "moderate", "major", "catastrophic"]
CONTACT_TYPES = ["primary", "billing", "claims", "other"]
PAYMENT_METHODS = ["check", "ach", "wire", "debit_card"]

# -----------------------------
# Main Seeder
# -----------------------------
def main():
    print("seed_bulk.py started...")

    with psycopg.connect(conn_params()) as conn:
        with conn.cursor() as cur:
            if RESET_BEFORE_SEED:
                print("Resetting tables...")
                reset_tables(cur)

            ts = now_ts()

            # -----------------------------
            # 1) ACCOUNTS
            # -----------------------------
            accounts = []
            for i in range(1, SEED_COMPANIES + 1):
                name = random.choice(COMPANY_NAMES)
                if i > len(COMPANY_NAMES):
                    name = f"{name} #{i}"

                account_type = random.choice(["business", "individual"])
                acct_num = rand_account_number(i)
                email = f"info@{name.lower().replace(' ', '').replace('#','')}.com"
                phone = rand_phone()

                address_line1 = f"{random.randint(10, 999)} {random.choice(['Industrial', 'Harbour', 'Main', 'King', 'Queen'])} {random.choice(['St', 'Ave', 'Rd', 'Blvd', 'Way'])}"
                address_line2 = random.choice([None, "Unit 12", "Suite 200", "Floor 3"])
                city = random.choice(["Toronto", "Vancouver", "Calgary", "Montreal", "Winnipeg", "Halifax"])
                province = random.choice(PROVINCES)
                postal_code = rand_postal()
                status = "active"

                cur.execute(
                    """
                    INSERT INTO accounts (
                        account_number, account_type, legal_name,
                        email, phone,
                        address_line1, address_line2, city, province, postal_code,
                        status, created_at, updated_at
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING account_id;
                    """,
                    (
                        acct_num, account_type, name,
                        email, phone,
                        address_line1, address_line2, city, province, postal_code,
                        status, ts, ts
                    )
                )
                account_id = cur.fetchone()[0]
                accounts.append((account_id, acct_num, name, province, status))

            print(f"Inserted accounts: {len(accounts)}")

            # -----------------------------
            # 2) CONTACTS
            # -----------------------------
            contacts = []
            for account_id, acct_num, name, province, status in accounts:
                first = random.choice(["Sam", "Jordan", "Taylor", "Alex", "Jamie", "Morgan", "Casey"])
                last = random.choice(["Smith", "Johnson", "Brown", "Wilson", "Lee", "Martinez", "Nguyen"])
                email = f"{first.lower()}.{last.lower()}@{name.lower().replace(' ', '').replace('#','')}.com"
                phone = rand_phone()

                cur.execute(
                    """
                    INSERT INTO contacts (
                        account_id, first_name, last_name,
                        email, phone,
                        contact_type, is_primary,
                        created_at, updated_at
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING contact_id;
                    """,
                    (account_id, first, last, email, phone, "primary", True, ts, ts)
                )
                contacts.append(cur.fetchone()[0])

                if random.random() < 0.5:
                    first2 = random.choice(["Avery", "Riley", "Dana", "Chris", "Pat", "Robin"])
                    last2 = random.choice(["Clark", "Lewis", "Hall", "Young", "Allen", "King"])
                    email2 = f"{first2.lower()}.{last2.lower()}@{name.lower().replace(' ', '').replace('#','')}.com"
                    phone2 = rand_phone()
                    ctype = random.choice([ct for ct in CONTACT_TYPES if ct != "primary"])                    
                    
                    cur.execute(
                        """
                        INSERT INTO contacts (
                            account_id, first_name, last_name,
                            email, phone,
                            contact_type, is_primary,
                            created_at, updated_at
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        RETURNING contact_id;
                        """,
                        (account_id, first2, last2, email2, phone2, ctype, False, ts, ts)
                    )

            print("Inserted contacts.")

            # -----------------------------
            # 3) POLICIES
            # -----------------------------
            policies = []
            policy_counter = 1
            for (account_id, acct_num, name, province, status) in accounts:
                for _ in range(random.randint(1, 3)):
                    policy_number = rand_policy_number(policy_counter)
                    policy_counter += 1
                    policy_type = random.choice(POLICY_TYPES)
                    p_status = random.choice(["active", "cancelled", "expired"])
                    effective = random_date_in_past(365)
                    expiry = random_date_range(effective, 90, 365)
                    premium_amount = round(random.uniform(2500, 250000), 2)
                    payment_frequency = random.choice(PAYMENT_FREQUENCY)

                    cur.execute(
                        """
                        INSERT INTO policies (
                            account_id,
                            policy_number, policy_type,
                            status,
                            effective_date, expiry_date,
                            premium_amount, payment_frequency,
                            created_at, updated_at
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        RETURNING policy_id;
                        """,
                        (account_id, policy_number, policy_type, p_status, 
                         effective, expiry, premium_amount, payment_frequency, ts, ts)
                    )
                    policy_id = cur.fetchone()[0]
                    policies.append((policy_id, account_id, policy_number, p_status, premium_amount))

            print(f"Inserted policies: {len(policies)}")

            # -----------------------------
            # 4) POLICY COVERAGES
            # -----------------------------
            for (policy_id, account_id, policy_number, p_status, prem) in policies:
                for _ in range(random.randint(1, 2)):
                    coverage_type = random.choice(["base", "extended", "premium"])
                    coverage_limit = round(random.uniform(50000, 5000000), 2)
                    deductible = round(random.choice([500, 1000, 2500, 5000, 10000]), 2)
                    coverage_premium = round(prem * random.uniform(0.2, 0.6), 2)

                    cur.execute(
                        """
                        INSERT INTO policy_coverages (
                            policy_id, coverage_type, coverage_limit,
                            deductible, premium_amount, created_at
                        )
                        VALUES (%s,%s,%s,%s,%s,%s);
                        """,
                        (policy_id, coverage_type, coverage_limit, deductible, coverage_premium, ts)
                    )

            print("Inserted policy_coverages.")

            # -----------------------------
            # 5) CLAIMS
            # -----------------------------
            claims = []
            claim_counter = 1
            for (policy_id, account_id, policy_number, p_status, prem) in policies:
                for _ in range(random.randint(0, 2)):
                    claim_number = rand_claim_number(claim_counter)
                    claim_counter += 1
                    claim_type = random.choice(CLAIM_TYPES)
                    severity = random.choice(SEVERITY)
                    status = random.choice(["submitted", "under_review", "approved", "closed", "denied"])
                    incident = random_date_in_past(365)
                    filed = incident + timedelta(days=random.randint(0, 30))
                    estimated_loss = round(random.uniform(1000, 500000), 2)

                    approved_amount = None
                    closed_date = None
                    if status in ("approved", "closed"):
                        approved_amount = round(estimated_loss * random.uniform(0.3, 1.0), 2)
                    if status in ("closed", "denied"):
                        closed_date = filed + timedelta(days=random.randint(10, 120))

                    description = f"{claim_type.replace('_',' ').title()} claim - {severity} severity"

                    cur.execute(
                        """
                        INSERT INTO claims (
                            policy_id, claim_number, claim_type, status,
                            severity, incident_date, filed_date, description,
                            estimated_loss, approved_amount, closed_date,
                            created_at, updated_at
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                        RETURNING claim_id;
                        """,
                        (policy_id, claim_number, claim_type, status, severity, incident, 
                         filed, description, estimated_loss, approved_amount, closed_date, ts, ts)
                    )
                    claim_id = cur.fetchone()[0]
                    claims.append((claim_id, status, approved_amount))

            print(f"Inserted claims: {len(claims)}")

            # -----------------------------
            # 6) CLAIM PAYMENTS
            # -----------------------------
            pay_counter = 1
            for (claim_id, status, approved_amount) in claims:
                if approved_amount is None:
                    continue

                remaining = approved_amount
                num_payments = random.choice([1, 2])
                for p in range(num_payments):
                    amount = round(remaining, 2) if p == num_payments - 1 else round(remaining * random.uniform(0.3, 0.7), 2)
                    remaining -= amount

                    payment_number = rand_payment_number(pay_counter)
                    pay_counter += 1
                    payment_date = date.today() - timedelta(days=random.randint(1, 120))
                    method = random.choice(["check", "ach", "wire", "debit_card"])
                    payee_name = random.choice(["Repair Shop Ltd", "Medical Clinic Inc", "Contractor Group", "Client Settlement"])
                    notes = random.choice([None, "partial payment", "final settlement", "invoice paid"])

                    cur.execute(
                        """
                        INSERT INTO claim_payments (
                            claim_id, payment_number, payment_amount,
                            payment_date, payment_method, payee_name,
                            notes, created_at
                        )
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s);
                        """,
                        (claim_id, payment_number, amount, payment_date, method, payee_name, notes, ts)
                    )

            print("Inserted claim_payments.")
        conn.commit()

    print(" Seeding complete.")

if __name__ == "__main__":
    main()