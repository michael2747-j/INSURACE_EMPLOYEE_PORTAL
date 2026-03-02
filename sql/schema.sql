-- ============================================================================
-- INSURANCE SYSTEM - REPORTING QUERIES (PHASE 3)
-- Advanced SQL queries demonstrating joins, aggregates, and window functions
-- ============================================================================

-- ============================================================================
-- REPORTING VIEWS
-- ============================================================================

-- View 1: Open Claims by Severity
CREATE OR REPLACE VIEW vw_open_claims_by_severity AS
SELECT 
    c.severity,
    COUNT(*) AS claim_count,
    SUM(c.estimated_loss) AS total_estimated_loss,
    AVG(c.estimated_loss) AS avg_estimated_loss,
    MIN(c.filed_date) AS oldest_claim_date,
    MAX(c.filed_date) AS newest_claim_date
FROM claims 
WHERE c.status IN ('submitted', 'under_review', 'approved')
GROUP BY c.severity
ORDER BY 
    CASE c.severity
        WHEN 'catastrophic' THEN 1
        WHEN 'major' THEN 2
        WHEN 'moderate' THEN 3
        WHEN 'minor' THEN 4
    END;

-- View 2: Premium Revenue by Account
CREATE OR REPLACE VIEW vw_premium_by_account AS
SELECT 
    a.account_id,
    a.account_number,
    a.legal_name,
    a.province,
    COUNT(p.policy_id) AS policy_count,
    SUM(p.premium_amount) AS total_annual_premium,
    AVG(p.premium_amount) AS avg_policy_premium,
    STRING_AGG(DISTINCT p.policy_type, ', ') AS policy_types
FROM accounts a
LEFT JOIN policies p ON a.account_id = p.account_id AND p.status = 'active'
GROUP BY a.account_id, a.account_number, a.legal_name, a.province
HAVING COUNT(p.policy_id) > 0
ORDER BY total_annual_premium DESC;

-- View 3: Policies Expiring Soon (next 90 days)
CREATE OR REPLACE VIEW vw_policies_expiring_soon AS
SELECT 
    p.policy_id,
    p.policy_number,
    p.policy_type,
    a.account_number,
    a.legal_name,
    a.email,
    a.phone,
    p.expiry_date,
    p.premium_amount,
    (p.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM policies p
JOIN accounts a ON p.account_id = a.account_id
WHERE p.status = 'active'
  AND p.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
ORDER BY p.expiry_date;

-- View 4: Claims by Status and Month
CREATE OR REPLACE VIEW vw_claims_by_status_month AS
SELECT 
    TO_CHAR(c.filed_date, 'YYYY-MM') AS filing_month,
    c.status,
    COUNT(*) AS claim_count,
    SUM(c.estimated_loss) AS total_estimated_loss,
    SUM(c.approved_amount) AS total_approved_amount,
    ROUND(AVG(EXTRACT(DAY FROM (COALESCE(c.closed_date, CURRENT_DATE) - c.filed_date))), 1) AS avg_days_to_resolution
FROM claims c
GROUP BY TO_CHAR(c.filed_date, 'YYYY-MM'), c.status
ORDER BY filing_month DESC, c.status;

-- View 5: Account Portfolio Summary
CREATE OR REPLACE VIEW vw_account_portfolio_summary AS
SELECT 
    a.account_id,
    a.account_number,
    a.legal_name,
    a.account_type,
    a.province,
    COUNT(DISTINCT p.policy_id) AS active_policies,
    COUNT(DISTINCT c.claim_id) AS total_claims,
    COUNT(DISTINCT CASE WHEN c.status IN ('submitted', 'under_review') THEN c.claim_id END) AS open_claims,
    SUM(p.premium_amount) AS annual_premium,
    COALESCE(SUM(c.approved_amount), 0) AS total_claims_paid,
    ROUND(
        COALESCE(SUM(c.approved_amount), 0) / NULLIF(SUM(p.premium_amount), 0) * 100, 
        2
    ) AS loss_ratio_pct
FROM accounts a
LEFT JOIN policies p ON a.account_id = p.account_id AND p.status = 'active'
LEFT JOIN claims c ON p.policy_id = c.policy_id
WHERE a.status = 'active'
GROUP BY a.account_id, a.account_number, a.legal_name, a.account_type, a.province
ORDER BY annual_premium DESC;

-- ============================================================================
-- COMPLEX ANALYTICAL QUERIES
-- These demonstrate advanced SQL skills
-- ============================================================================

-- Query 1: Top 10 Most Profitable Accounts (Premium vs Claims Paid)
-- Business Question: Which accounts generate the most profit?
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
LIMIT 10;

-- Query 2: Claims Processing Performance by Month
-- Business Question: How quickly are we processing claims over time?
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
ORDER BY month DESC;

-- Query 3: Policy Type Performance Analysis
-- Business Question: Which policy types are most/least profitable?
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
ORDER BY total_premium DESC;

-- Query 4: Geographic Performance by Province
-- Business Question: Which provinces are most profitable?
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
ORDER BY total_premium DESC;

-- Query 5: High-Risk Accounts (Multiple Claims)
-- Business Question: Which accounts are filing the most claims?
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
WHERE total_claims >= 2
ORDER BY total_claims DESC, loss_ratio_pct DESC;

-- Query 6: Coverage Analysis - Most Common Coverages
-- Business Question: What coverages do customers buy most?
SELECT 
    pc.coverage_type,
    COUNT(*) AS coverage_count,
    AVG(pc.coverage_limit) AS avg_coverage_limit,
    AVG(pc.deductible) AS avg_deductible,
    SUM(pc.premium_amount) AS total_premium,
    ROUND(AVG(pc.premium_amount), 2) AS avg_premium
FROM policy_coverages pc
JOIN policies p ON pc.policy_id = p.policy_id
WHERE p.status = 'active'
GROUP BY pc.coverage_type
ORDER BY coverage_count DESC;

-- Query 7: Claim Severity Trends Over Time (Window Functions)
-- Business Question: Are claims getting more severe over time?
SELECT 
    TO_CHAR(filed_date, 'YYYY-MM') AS month,
    severity,
    COUNT(*) AS claim_count,
    AVG(estimated_loss) AS avg_loss,
    SUM(COUNT(*)) OVER (PARTITION BY severity ORDER BY TO_CHAR(filed_date, 'YYYY-MM')) AS cumulative_claims,
    AVG(AVG(estimated_loss)) OVER (
        PARTITION BY severity 
        ORDER BY TO_CHAR(filed_date, 'YYYY-MM')
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS moving_avg_loss_3mo
FROM claims
GROUP BY TO_CHAR(filed_date, 'YYYY-MM'), severity
ORDER BY month DESC, severity;

-- Query 8: Payment Analysis - Claims vs Actual Payments
-- Business Question: How much are we paying vs approving?
SELECT 
    c.claim_number,
    c.claim_type,
    c.severity,
    c.estimated_loss,
    c.approved_amount,
    COUNT(cp.payment_id) AS payment_count,
    SUM(cp.payment_amount) AS total_paid,
    c.approved_amount - COALESCE(SUM(cp.payment_amount), 0) AS remaining_to_pay,
    ROUND(
        COALESCE(SUM(cp.payment_amount), 0) / NULLIF(c.approved_amount, 0) * 100,
        2
    ) AS pct_paid
FROM claims c
LEFT JOIN claim_payments cp ON c.claim_id = cp.claim_id
WHERE c.status IN ('approved', 'closed') AND c.approved_amount > 0
GROUP BY c.claim_id, c.claim_number, c.claim_type, c.severity, c.estimated_loss, c.approved_amount
ORDER BY remaining_to_pay DESC;

-- Query 9: Customer Lifetime Value Ranking (Window Functions)
-- Business Question: Who are our most valuable customers?
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
        100.0 * SUM(net_value) OVER (ORDER BY net_value DESC) / SUM(net_value) OVER (),
        2
    ) AS cumulative_pct_of_total_value
FROM customer_value
WHERE total_premium > 0
ORDER BY value_rank
LIMIT 20;

-- Query 10: Renewal Opportunity Analysis
-- Business Question: Which high-value policies are expiring soon?
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
  AND p.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '90 days'
  AND p.premium_amount >= 2000
GROUP BY p.policy_id, p.policy_number, p.policy_type, a.account_number, 
         a.legal_name, a.email, a.phone, p.premium_amount, p.expiry_date
ORDER BY p.premium_amount DESC, days_until_expiry;

-- ============================================================================
-- END OF REPORTING QUERIES
-- ============================================================================


