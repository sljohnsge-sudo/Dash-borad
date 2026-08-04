from typing import Optional
from fastapi import APIRouter, Query
from app.core.database import get_db_connection

router = APIRouter(prefix="/api/reports", tags=["Reports"])

# 1. Invoice Output Endpoint (19,046 records)
@router.get("/invoice-output")
def get_invoice_output(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: Optional[str] = None
):
    page_num = int(page) if isinstance(page, (int, str)) and str(page).isdigit() else 1
    limit_num = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 10
    offset = (page_num - 1) * limit_num

    conn = get_db_connection()
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(invoice_no LIKE %s OR order_no LIKE %s OR delivery_customer_name LIKE %s OR catalog_no LIKE %s OR description LIKE %s)")
        s = f"%{search}%"
        params.extend([s, s, s, s, s])

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with conn.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) as cnt, COALESCE(SUM(net_dom_amount), 0) as total_net FROM invoice_output{where_sql};", params)
        agg = cursor.fetchone()
        total_count = agg['cnt']
        total_net_amount = round(agg['total_net'], 2)

        cursor.execute(f"SELECT * FROM invoice_output{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;", params + [limit_num, offset])
        rows = cursor.fetchall()

        for row in rows:
            if row.get("invoice_date"):
                row["invoice_date"] = str(row["invoice_date"])

    conn.close()

    return {
        "report_title": "Invoice Output Report",
        "total_count": total_count,
        "total_net_amount": total_net_amount,
        "page": page_num,
        "limit": limit_num,
        "total_pages": (total_count + limit_num - 1) // limit_num if limit_num else 1,
        "rows": rows
    }

# 2. Outstanding Output Endpoint (170 records)
@router.get("/outstanding-output")
def get_outstanding_output(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: Optional[str] = None
):
    page_num = int(page) if isinstance(page, (int, str)) and str(page).isdigit() else 1
    limit_num = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 10
    offset = (page_num - 1) * limit_num

    conn = get_db_connection()
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(customer_no LIKE %s OR customer_name LIKE %s OR order_no LIKE %s OR catalog_no LIKE %s OR catalog_desc LIKE %s)")
        s = f"%{search}%"
        params.extend([s, s, s, s, s])

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with conn.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) as cnt, COALESCE(SUM(backlog_value_base_curr), 0) as total_backlog FROM outstanding_output{where_sql};", params)
        agg = cursor.fetchone()
        total_count = agg['cnt']
        total_backlog = round(agg['total_backlog'], 2)

        cursor.execute(f"SELECT * FROM outstanding_output{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;", params + [limit_num, offset])
        rows = cursor.fetchall()

        for row in rows:
            if row.get("planned_delivery_date"):
                row["planned_delivery_date"] = str(row["planned_delivery_date"])

    conn.close()

    return {
        "report_title": "Outstanding Output Report",
        "total_count": total_count,
        "total_backlog_value": total_backlog,
        "page": page_num,
        "limit": limit_num,
        "total_pages": (total_count + limit_num - 1) // limit_num if limit_num else 1,
        "rows": rows
    }
