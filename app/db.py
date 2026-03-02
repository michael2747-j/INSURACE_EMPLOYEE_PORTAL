"""
Database Connection Module
Handles PostgreSQL connections with proper resource management
"""

import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'dbname': os.getenv('DB_NAME', 'insurance_portfolio'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'Portfolio')
}

def get_connection_string():
    """Generate PostgreSQL connection string"""
    return f"host={DB_CONFIG['host']} port={DB_CONFIG['port']} dbname={DB_CONFIG['dbname']} user={DB_CONFIG['user']} password={DB_CONFIG['password']}"

@contextmanager
def get_db_connection():
    """
    Context manager for database connections
    Ensures connections are properly closed
    """
    conn = psycopg.connect(get_connection_string(), row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()

def execute_query(query: str, params: tuple = None, fetch_one: bool = False):
    """
    Execute a SELECT query and return results
    
    Args:
        query: SQL query string
        params: Query parameters (for parameterized queries)
        fetch_one: If True, return single row; if False, return all rows
    
    Returns:
        Query results as dict or list of dicts
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            if fetch_one:
                return cur.fetchone()
            return cur.fetchall()

def execute_write(query: str, params: tuple = None, returning: bool = False):
    """
    Execute an INSERT/UPDATE/DELETE query
    
    Args:
        query: SQL query string
        params: Query parameters
        returning: If True, return the inserted/updated row
    
    Returns:
        If returning=True: the affected row
        If returning=False: number of affected rows
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            conn.commit()
            
            if returning:
                return cur.fetchone()
            return cur.rowcount