from typing import Optional
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, get_db_connection
import seed_excel_data

app = FastAPI(
    title="George Steuart Health Executive Dashboard API",
    description="Backend REST API supplying live data from MySQL gsh_dashboard database built from Excel reports",
    version="2.0.0"
)

# Enable CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    init_db()

@app.get("/api/health")
def health_check():
    try:
        conn = get_db_connection()
        counts = {}
        tables = [
            "invoice_output",
            "outstanding_output"
        ]
        with conn.cursor() as cursor:
            for table in tables:
                cursor.execute(f"SELECT COUNT(*) as count FROM `{table}`;")
                res = cursor.fetchone()
                counts[table] = res['count'] if isinstance(res, dict) else res[0]
        conn.close()
        return {
            "status": "connected",
            "database": "gsh_dashboard",
            "db_type": "MySQL / XAMPP",
            "table_count": len(counts),
            "total_records": sum(counts.values()),
            "table_records": counts
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# 1. Customer Invoice Lines Endpoint (108k+ records, paginated)
@app.get("/api/reports/customer-invoice-lines")
def get_customer_invoice_lines(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    company: Optional[str] = None
):
    conn = get_db_connection()
    offset = (page - 1) * limit
    where_clauses = []
    params = []

    if search:
        where_clauses.append("(order_no LIKE %s OR identity LIKE %s OR company LIKE %s)")
        search_param = f"%{search}%"
        params.extend([search_param, search_param, search_param])
    
    if company:
        where_clauses.append("company = %s")
        params.append(company)

    where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

    with conn.cursor() as cursor:
        # Count total matching rows and sum total net_curr_amount
        cursor.execute(f"SELECT COUNT(*) as cnt, COALESCE(SUM(net_curr_amount), 0) as total_net FROM customer_invoice_lines{where_sql};", params)
        agg = cursor.fetchone()
        total_count = agg['cnt']
        total_net_amount = round(agg['total_net'], 2)

        # Fetch paginated rows
        query_sql = f"SELECT id, order_no, company, identity, invoice_date, net_curr_amount FROM customer_invoice_lines{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;"
        cursor.execute(query_sql, params + [limit, offset])
        rows = cursor.fetchall()
        
        # Format datetimes
        for row in rows:
            if row.get("invoice_date"):
                row["invoice_date"] = str(row["invoice_date"])

    conn.close()

    return {
        "report_title": "MTL Sales - Customer Invoice Lines",
        "total_count": total_count,
        "total_net_amount": total_net_amount,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if limit else 1,
        "rows": rows
    }

# 2. Invoiced Sales Endpoint (Divasa / GSHD)
@app.get("/api/reports/invoiced-sales")
def get_invoiced_sales(search: Optional[str] = None):
    conn = get_db_connection()
    where_sql = ""
    params = []

    if search:
        where_sql = " WHERE (contract LIKE %s OR catalog_no LIKE %s OR description LIKE %s OR catalog_group LIKE %s)"
        s = f"%{search}%"
        params = [s, s, s, s]

    with conn.cursor() as cursor:
        cursor.execute(f"SELECT id, contract, catalog_no, description, invoice_date, net_curr_amount, catalog_group FROM invoiced_sales{where_sql} ORDER BY id ASC;", params)
        rows = cursor.fetchall()

        for row in rows:
            if row.get("invoice_date"):
                row["invoice_date"] = str(row["invoice_date"])

        cursor.execute(f"SELECT catalog_group, COUNT(*) as cnt, COALESCE(SUM(net_curr_amount), 0) as group_total FROM invoiced_sales{where_sql} GROUP BY catalog_group ORDER BY group_total ASC;", params)
        group_summary = cursor.fetchall()

    conn.close()

    total_net_amount = round(sum(r["net_curr_amount"] or 0 for r in rows), 2)

    return {
        "report_title": "Divasa - Invoiced Sales (Group Wise)",
        "total_count": len(rows),
        "total_net_amount": total_net_amount,
        "group_summary": group_summary,
        "rows": rows
    }

# 3. Outstanding Orders Endpoint (Distributor Reserved Sales)
@app.get("/api/reports/outstanding-orders")
def get_outstanding_orders(search: Optional[str] = None):
    conn = get_db_connection()
    where_sql = ""
    params = []

    if search:
        where_sql = " WHERE (customer_no LIKE %s OR customer_name LIKE %s OR catalog_no LIKE %s OR catalog_desc LIKE %s OR catalog_group LIKE %s)"
        s = f"%{search}%"
        params = [s, s, s, s, s]

    with conn.cursor() as cursor:
        cursor.execute(f"SELECT id, customer_no, customer_name, catalog_no, catalog_desc, baseamt, catalog_group FROM outstanding_orders{where_sql} ORDER BY id ASC;", params)
        rows = cursor.fetchall()

        cursor.execute(f"SELECT catalog_group, COUNT(*) as cnt, COALESCE(SUM(baseamt), 0) as group_baseamt FROM outstanding_orders{where_sql} GROUP BY catalog_group ORDER BY group_baseamt DESC;", params)
        group_summary = cursor.fetchall()

    conn.close()

    total_baseamt = round(sum(r["baseamt"] or 0 for r in rows), 2)

    return {
        "report_title": "Distributor Reserved Sales - Outstanding Orders",
        "total_count": len(rows),
        "total_baseamt": total_baseamt,
        "group_summary": group_summary,
        "rows": rows
    }

# 4. Reserved Sales Summary Endpoint (GSH1N GSHD)
@app.get("/api/reports/reserved-sales-summary")
def get_reserved_sales_summary():
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, product_category, sales_group, total_product_category, total_by_sales_group, contract FROM reserved_sales_summary ORDER BY id ASC;")
        rows = cursor.fetchall()
    conn.close()

    grand_total_cat = round(sum(r["total_product_category"] or 0 for r in rows), 2)
    grand_total_group = round(sum(r["total_by_sales_group"] or 0 for r in rows), 2)

    return {
        "report_title": "Total GSH 1 Reserved Sales Summary (GSHD / GSH1N)",
        "total_count": len(rows),
        "grand_total_product_category": grand_total_cat,
        "grand_total_sales_group": grand_total_group,
        "rows": rows
    }

# 5. Invoice Output Endpoint (New CSV dataset, 19k records)
@app.get("/api/reports/invoice-output")
def get_invoice_output(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = None
):
    conn = get_db_connection()
    offset = (page - 1) * limit
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

        cursor.execute(f"SELECT * FROM invoice_output{where_sql} ORDER BY id ASC LIMIT %s OFFSET %s;", params + [limit, offset])
        rows = cursor.fetchall()

        for row in rows:
            if row.get("invoice_date"):
                row["invoice_date"] = str(row["invoice_date"])

    conn.close()

    return {
        "report_title": "Invoice Output Report",
        "total_count": total_count,
        "total_net_amount": total_net_amount,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if limit else 1,
        "rows": rows
    }

# 6. Outstanding Output Endpoint (New CSV dataset)
@app.get("/api/reports/outstanding-output")
def get_outstanding_output(search: Optional[str] = None):
    conn = get_db_connection()
    where_sql = ""
    params = []

    if search:
        where_sql = " WHERE (customer_no LIKE %s OR customer_name LIKE %s OR order_no LIKE %s OR catalog_no LIKE %s OR catalog_desc LIKE %s)"
        s = f"%{search}%"
        params = [s, s, s, s, s]

    with conn.cursor() as cursor:
        cursor.execute(f"SELECT * FROM outstanding_output{where_sql} ORDER BY id ASC;", params)
        rows = cursor.fetchall()

        for row in rows:
            if row.get("planned_delivery_date"):
                row["planned_delivery_date"] = str(row["planned_delivery_date"])

    conn.close()

    total_backlog = round(sum(r.get("backlog_value_base_curr") or 0 for r in rows), 2)

    return {
        "report_title": "Outstanding Output Report",
        "total_count": len(rows),
        "total_backlog_value": total_backlog,
        "rows": rows
    }

# Seed DB endpoint
@app.post("/api/seed")
def seed_db_endpoint():
    try:
        seed_excel_data.main()
        return {"status": "success", "message": "Database successfully re-seeded!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
