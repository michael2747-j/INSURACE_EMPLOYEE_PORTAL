"""
Reports Module
Advanced SQL reporting queries demonstrating complex analytical skills
Uses queries from reporting_queries.sql
"""

from typing import List, Dict, Any, Optional
from .db import execute_query

# ============================================================================
# QUERY 1: Top Profitable Accounts
# Business Question: Which accounts generate the most profit?
# SQL Skills: Multi-table JOIN, aggregation, COALESCE, loss ratio calculation
# ============================================================================

def get_top_profitable_accounts(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns accounts ranked by profitability (premium - claims paid)
    
    Demonstrates:
    - 4-table JOIN (accounts → policies → claims → claim_payments)
    - Aggregate functions (SUM, COUNT)
    - NULL handling with COALESCE
    - Financial calculations (loss ratio)
    - Parameterized LIMIT
    """
    query = """
        SELECT 
            a.account_number,
            a.legal_name,
            a.province,
            COUNT(DISTINCT p.policy_id) AS policy_count,
            SUM(p.premium_amount) AS total_premium,
            COALESCE(SUM(cp.payment_amount), 0) AS total_claims_paid,
            SUM(p.premium_amount) - COALESCE(SUM(cp.payment_amount), 0) AS profit,
            ROUND(
                COALESCE(SUM(cp.payment_amount), 0) / NULLIF(SUM(p.premium_amount), 0) * 100,
                2
            ) AS loss_ratio_pct
        FROM accounts a
        JOIN policies p ON a.account_id = p.account_id
        LEFT JOIN claims c ON p.policy_id = c.policy_id
        LEFT JOIN claim_payments cp ON c.claim_id = cp.claim_id
        WHERE p.status = 'active' AND a.status = 'active'
        GROUP BY a.account_id, a.account_number, a.legal_name, a.province
        HAVING SUM(p.premium_amount) > 0
        ORDER BY profit DESC
        LIMIT %s
    """
    
    return execute_query(query, (limit,))

# ============================================================================
# QUERY 2: Claims Processing Performance
# Business Question: How quickly are we processing claims?
# SQL Skills: Time-based aggregation, date functions, conditional counting
# ============================================================================

def get_claims_processing_performance() -> List[Dict[str, Any]]:
    """
    Returns monthly claims processing metrics
    
    Demonstrates:
    - TO_CHAR for date formatting
    - CASE expressions for conditional aggregation
    - Date arithmetic (EXTRACT)
    - Percentage calculations
    - GROUP BY with date functions
    """
    query = """
        SELECT 
            TO_CHAR(c.filed_date, 'YYYY-MM') AS month,
            COUNT(*) AS total_claims,
            COUNT(CASE WHEN c.status = 'closed' THEN 1 END) AS closed_claims,
            ROUND(
                COUNT(CASE WHEN c.status = 'closed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100,
                2
            ) AS closure_rate_pct,
            ROUND(AVG(CASE 
                WHEN c.status = 'closed' THEN EXTRACT(DAY FROM (c.closed_date - c.filed_date))
            END), 1) AS avg_days_to_close,
            SUM(c.estimated_loss) AS total_estimated_loss,
            SUM(c.approved_amount) AS total_approved_amount
        FROM claims c
        GROUP BY TO_CHAR(c.filed_date, 'YYYY-MM')
        ORDER BY month DESC
    """
    
    return execute_query(query)

# ============================================================================
# QUERY 3: Policy Type Performance
# Business Question: Which policy types are most/least profitable?
# SQL Skills: Aggregation by category, profitability analysis
# ============================================================================

def get_policy_type_performance() -> List[Dict[str, Any]]:
    """
    Returns performance metrics by policy type
    
    Demonstrates:
    - GROUP BY categorical data
    - Multiple aggregate functions
    - Calculated fields (claims per policy, loss ratio)
    - LEFT JOIN for optional relationships
    """
    query = """
        SELECT 
            p.policy_type,
            COUNT(DISTINCT p.policy_id) AS policy_count,
            COUNT(DISTINCT a.account_id) AS unique_customers,
            SUM(p.premium_amount) AS total_premium,
            COUNT(c.claim_id) AS claim_count,
            COALESCE(SUM(c.approved_amount), 0) AS total_claims_cost,
            ROUND(
                COALESCE(SUM(c.approved_amount), 0) / NULLIF(SUM(p.premium_amount), 0) * 100,
                2
            ) AS loss_ratio_pct,
            ROUND(AVG(p.premium_amount), 2) AS avg_premium,
            ROUND(
                COUNT(c.claim_id)::NUMERIC / COUNT(DISTINCT p.policy_id)::NUMERIC,
                2
            ) AS claims_per_policy
        FROM policies p
        JOIN accounts a ON p.account_id = a.account_id
        LEFT JOIN claims c ON p.policy_id = c.policy_id AND c.status IN ('approved', 'closed')
        WHERE p.status = 'active'
        GROUP BY p.policy_type
        ORDER BY total_premium DESC
    """
    
    return execute_query(query)

# ============================================================================
# QUERY 4: Geographic Performance
# Business Question: Which provinces are most profitable?
# SQL Skills: Geographic analysis, aggregation
# ============================================================================

def get_geographic_performance() -> List[Dict[str, Any]]:
    """
    Returns performance metrics by province
    
    Demonstrates:
    - Geographic data aggregation
    - Customer density metrics
    - Regional profitability analysis
    """
    query = """
        SELECT 
            a.province,
            COUNT(DISTINCT a.account_id) AS customer_count,
            COUNT(DISTINCT p.policy_id) AS policy_count,
            SUM(p.premium_amount) AS total_premium,
            COUNT(c.claim_id) AS total_claims,
            COALESCE(SUM(c.approved_amount), 0) AS total_claims_cost,
            ROUND(
                COALESCE(SUM(c.approved_amount), 0) / NULLIF(SUM(p.premium_amount), 0) * 100,
                2
            ) AS loss_ratio_pct,
            ROUND(SUM(p.premium_amount) / COUNT(DISTINCT a.account_id), 2) AS premium_per_customer
        FROM accounts a
        LEFT JOIN policies p ON a.account_id = p.account_id AND p.status = 'active'
        LEFT JOIN claims c ON p.policy_id = c.policy_id
        WHERE a.status = 'active'
        GROUP BY a.province
        ORDER BY total_premium DESC
    """
    
    return execute_query(query)

# ============================================================================
# QUERY 5: High-Risk Accounts
# Business Question: Which accounts are filing the most claims?
# SQL Skills: CTE, risk analysis, filtering
# ============================================================================

def get_high_risk_accounts(min_claims: int = 2) -> List[Dict[str, Any]]:
    """
    Returns accounts with multiple claims (high risk)
    
    Demonstrates:
    - Common Table Expression (CTE)
    - Subquery for complex filtering
    - Risk categorization
    - HAVING clause for post-aggregation filtering
    """
    query = """
        WITH account_claims AS (
            SELECT 
                a.account_id,
                a.account_number,
                a.legal_name,
                COUNT(DISTINCT c.claim_id) AS total_claims,
                COUNT(DISTINCT p.policy_id) AS policy_count,
                SUM(p.premium_amount) AS annual_premium,
                SUM(c.estimated_loss) AS total_estimated_loss,
                SUM(c.approved_amount) AS total_approved_amount
            FROM accounts a
            JOIN policies p ON a.account_id = p.account_id
            LEFT JOIN claims c ON p.policy_id = c.policy_id
            WHERE p.status = 'active'
            GROUP BY a.account_id, a.account_number, a.legal_name
        )
        SELECT 
            account_number,
            legal_name,
            policy_count,
            total_claims,
            ROUND(total_claims::NUMERIC / policy_count::NUMERIC, 2) AS claims_per_policy,
            annual_premium,
            total_estimated_loss,
            total_approved_amount,
            ROUND(
                COALESCE(total_approved_amount, 0) / NULLIF(annual_premium, 0) * 100,
                2
            ) AS loss_ratio_pct
        FROM account_claims
        WHERE total_claims >= %s
        ORDER BY total_claims DESC, loss_ratio_pct DESC
    """
    
    return execute_query(query, (min_claims,))

# ============================================================================
# QUERY 6: Customer Lifetime Value
# Business Question: Who are our most valuable customers?
# SQL Skills: Window functions, ranking, running totals
# ============================================================================

def get_customer_lifetime_value(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Returns top customers ranked by lifetime value
    
    Demonstrates:
    - CTE for complex calculations
    - Window functions (RANK, NTILE, SUM OVER)
    - Running totals
    - Percentile analysis
    """
    query = """
        WITH customer_value AS (
            SELECT 
                a.account_id,
                a.account_number,
                a.legal_name,
                a.province,
                SUM(p.premium_amount) AS total_premium,
                COUNT(DISTINCT p.policy_id) AS policy_count,
                COALESCE(SUM(c.approved_amount), 0) AS total_claims,
                SUM(p.premium_amount) - COALESCE(SUM(c.approved_amount), 0) AS net_value
            FROM accounts a
            LEFT JOIN policies p ON a.account_id = p.account_id
            LEFT JOIN claims c ON p.policy_id = c.policy_id
            WHERE a.status = 'active'
            GROUP BY a.account_id, a.account_number, a.legal_name, a.province
        )
        SELECT 
            account_number,
            legal_name,
            province,
            policy_count,
            total_premium,
            total_claims,
            net_value,
            RANK() OVER (ORDER BY net_value DESC) AS value_rank,
            NTILE(10) OVER (ORDER BY net_value DESC) AS value_decile,
            ROUND(
                100.0 * SUM(net_value) OVER (ORDER BY net_value DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
                / SUM(net_value) OVER (),
                2
            ) AS cumulative_pct_of_total_value
        FROM customer_value
        WHERE total_premium > 0
        ORDER BY value_rank
        LIMIT %s
    """
    
    return execute_query(query, (limit,))

# ============================================================================
# QUERY 7: Claim Severity Trends
# Business Question: Are claims getting more severe over time?
# SQL Skills: Time series analysis, window functions, moving averages
# ============================================================================

def get_claim_severity_trends() -> List[Dict[str, Any]]:
    """
    Returns claim severity trends with moving averages
    
    Demonstrates:
    - Partitioned window functions
    - Moving average (ROWS BETWEEN)
    - Cumulative sums
    - Time series analysis
    """
    query = """
        SELECT 
            TO_CHAR(filed_date, 'YYYY-MM') AS month,
            severity,
            COUNT(*) AS claim_count,
            AVG(estimated_loss) AS avg_loss,
            SUM(COUNT(*)) OVER (
                PARTITION BY severity 
                ORDER BY TO_CHAR(filed_date, 'YYYY-MM')
            ) AS cumulative_claims,
            AVG(AVG(estimated_loss)) OVER (
                PARTITION BY severity 
                ORDER BY TO_CHAR(filed_date, 'YYYY-MM')
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ) AS moving_avg_loss_3mo
        FROM claims
        GROUP BY TO_CHAR(filed_date, 'YYYY-MM'), severity
        ORDER BY month DESC, severity
    """
    
    return execute_query(query)

# ============================================================================
# QUERY 8: Policies Expiring Soon
# Business Question: Which high-value policies need renewal attention?
# SQL Skills: Date filtering, interval arithmetic, risk scoring
# ============================================================================

def get_policies_expiring_soon(days: int = 90, min_premium: float = 2000) -> List[Dict[str, Any]]:
    """
    Returns high-value policies expiring soon with risk assessment
    
    Demonstrates:
    - Date interval filtering
    - CASE expression for categorization
    - Multi-table aggregation
    - Business logic in SQL
    """
    query = """
        SELECT 
            p.policy_number,
            p.policy_type,
            a.account_number,
            a.legal_name,
            a.email,
            a.phone,
            p.premium_amount,
            p.expiry_date,
            (p.expiry_date - CURRENT_DATE) AS days_until_expiry,
            COUNT(c.claim_id) AS claim_count,
            COALESCE(SUM(c.approved_amount), 0) AS total_claims_paid,
            CASE 
                WHEN COUNT(c.claim_id) = 0 THEN 'Low Risk - No Claims'
                WHEN COALESCE(SUM(c.approved_amount), 0) / p.premium_amount < 0.3 THEN 'Low Risk'
                WHEN COALESCE(SUM(c.approved_amount), 0) / p.premium_amount < 0.7 THEN 'Medium Risk'
                ELSE 'High Risk'
            END AS risk_category
        FROM policies p
        JOIN accounts a ON p.account_id = a.account_id
        LEFT JOIN claims c ON p.policy_id = c.policy_id
        WHERE p.status = 'active'
          AND p.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '%s days'
          AND p.premium_amount >= %s
        GROUP BY p.policy_id, p.policy_number, p.policy_type, a.account_number, 
                 a.legal_name, a.email, a.phone, p.premium_amount, p.expiry_date
        ORDER BY p.premium_amount DESC, days_until_expiry
    """
    
    # Note: Using string formatting for INTERVAL (safe since it's an integer parameter)
    return execute_query(query % (days, '%s'), (min_premium,))

# ============================================================================
# VIEW-BASED REPORTS (using created views)
# ============================================================================

def get_open_claims_by_severity() -> List[Dict[str, Any]]:
    """Uses vw_open_claims_by_severity view"""
    query = "SELECT * FROM vw_open_claims_by_severity"
    return execute_query(query)

def get_premium_by_account(limit: int = 50) -> List[Dict[str, Any]]:
    """Uses vw_premium_by_account view"""
    query = "SELECT * FROM vw_premium_by_account LIMIT %s"
    return execute_query(query, (limit,))

def get_account_portfolio_summary() -> List[Dict[str, Any]]:
    """Uses vw_account_portfolio_summary view"""
    query = "SELECT * FROM vw_account_portfolio_summary"
    return execute_query(query)