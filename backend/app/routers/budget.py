from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Query
from app.core.database import get_db_connection

router = APIRouter(prefix="/api/reports", tags=["Budget Reports"])

MONTH_NAMES = ["april", "may", "june", "july", "august", "september", "october", "november", "december", "january", "february", "march"]

@router.get("/total-budget")
def get_total_budget(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: Optional[str] = None,
    month: Optional[str] = None
):
    page_num = int(page) if isinstance(page, (int, str)) and str(page).isdigit() else 1
    limit_num = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 10
    offset = (page_num - 1) * limit_num

    # Determine current working month name
    active_month = month.lower().strip() if month and month.lower().strip() in MONTH_NAMES else "august"

    conn = get_db_connection()
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(cost_center LIKE %s OR sales_group LIKE %s OR range_name LIKE %s OR part_no LIKE %s OR product_sku LIKE %s)")
        s = f"%{search}%"
        params.extend([s, s, s, s, s])

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with conn.cursor() as cursor:
        # Calculate sum for all months
        month_sums_sql = ", ".join([f"COALESCE(SUM({m}), 0) as {m}_sum" for m in MONTH_NAMES])
        cursor.execute(f"SELECT COUNT(*) as cnt, COALESCE(SUM(total), 0) as grand_total, {month_sums_sql} FROM total_budget{where_sql};", params)
        agg = cursor.fetchone()
        total_count = agg['cnt']
        grand_total = round(agg['grand_total'], 2)

        monthly_totals = {m: round(agg[f"{m}_sum"], 2) for m in MONTH_NAMES}
        working_month_total = monthly_totals.get(active_month, 0.0)

        cursor.execute(f"SELECT * FROM total_budget{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;", params + [limit_num, offset])
        rows = cursor.fetchall()

    conn.close()

    return {
        "report_title": "Total Budget Report (FY 2026-27)",
        "total_count": total_count,
        "grand_total": grand_total,
        "active_month": active_month,
        "working_month_total": working_month_total,
        "monthly_totals": monthly_totals,
        "page": page_num,
        "limit": limit_num,
        "total_pages": (total_count + limit_num - 1) // limit_num if limit_num else 1,
        "rows": rows
    }

@router.get("/dis-budget")
def get_dis_budget(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),
    search: Optional[str] = None,
    division: Optional[str] = None,
    qtr: Optional[str] = None,
    month_num: Optional[int] = Query(8, ge=1, le=12)
):
    page_num = int(page) if isinstance(page, (int, str)) and str(page).isdigit() else 1
    limit_num = int(limit) if isinstance(limit, (int, str)) and str(limit).isdigit() else 10
    offset = (page_num - 1) * limit_num

    selected_month_num = int(month_num) if month_num and 1 <= int(month_num) <= 12 else 8

    conn = get_db_connection()
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(product_id LIKE %s OR product LIKE %s OR division_name LIKE %s)")
        s = f"%{search}%"
        params.extend([s, s, s])

    if division:
        where_clauses.append("division_name = %s")
        params.append(division)

    if qtr:
        where_clauses.append("qtr = %s")
        params.append(qtr)

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with conn.cursor() as cursor:
        # Full totals
        cursor.execute(f"""
            SELECT 
                COUNT(*) as cnt, 
                COALESCE(SUM(primary_target), 0) as total_pri_target,
                COALESCE(SUM(primary_actual), 0) as total_pri_actual,
                COALESCE(SUM(rd_target), 0) as total_rd_target,
                COALESCE(SUM(rd_actual), 0) as total_rd_actual
            FROM dis_budget{where_sql};
        """, params)
        agg = cursor.fetchone()
        total_count = agg['cnt']

        # Working month totals (e.g. August = month 8)
        wm_where_sql = f"{where_sql} {'AND' if where_sql else 'WHERE'} MONTH(month) = %s"
        cursor.execute(f"""
            SELECT 
                COALESCE(SUM(primary_target), 0) as wm_pri_target,
                COALESCE(SUM(primary_actual), 0) as wm_pri_actual,
                COALESCE(SUM(rd_target), 0) as wm_rd_target,
                COALESCE(SUM(rd_actual), 0) as wm_rd_actual
            FROM dis_budget{wm_where_sql};
        """, params + [selected_month_num])
        wm_agg = cursor.fetchone()

        cursor.execute(f"SELECT * FROM dis_budget{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;", params + [limit_num, offset])
        rows = cursor.fetchall()

        for row in rows:
            if row.get("month"):
                row["month"] = str(row["month"])

    conn.close()

    return {
        "report_title": "Distributor Budget Report (Dis Budget)",
        "total_count": total_count,
        "selected_month_num": selected_month_num,
        "summary": {
            "primary_target": round(agg['total_pri_target'], 2),
            "primary_actual": round(agg['total_pri_actual'], 2),
            "rd_target": round(agg['total_rd_target'], 2),
            "rd_actual": round(agg['total_rd_actual'], 2)
        },
        "working_month_summary": {
            "primary_target": round(wm_agg['wm_pri_target'], 2),
            "primary_actual": round(wm_agg['wm_pri_actual'], 2),
            "rd_target": round(wm_agg['wm_rd_target'], 2),
            "rd_actual": round(wm_agg['wm_rd_actual'], 2)
        },
        "page": page_num,
        "limit": limit_num,
        "total_pages": (total_count + limit_num - 1) // limit_num if limit_num else 1,
        "rows": rows
    }
