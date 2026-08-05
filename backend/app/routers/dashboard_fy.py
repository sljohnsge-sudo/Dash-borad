from typing import Optional
from fastapi import APIRouter, Query
from app.core.database import get_db_connection

router = APIRouter(prefix="/api/reports", tags=["Dashboard FY"])

MONTH_MAPPING = {
    "april": 4, "may": 5, "june": 6, "july": 7,
    "august": 8, "september": 9, "october": 10,
    "november": 11, "december": 12, "january": 1,
    "february": 2, "march": 3
}

MONTH_NAMES = {
    "april": "April 2026", "may": "May 2026", "june": "June 2026", "july": "July 2026",
    "august": "August 2026", "september": "September 2026", "october": "October 2026",
    "november": "November 2026", "december": "December 2026", "january": "January 2027",
    "february": "February 2027", "march": "March 2027"
}

@router.get("/dashboard-fy-overview")
def get_dashboard_fy_overview(month: Optional[str] = Query("july")):
    selected_month = month.lower().strip() if month and month.lower().strip() in MONTH_MAPPING else "july"
    month_num = MONTH_MAPPING[selected_month]
    month_name = MONTH_NAMES[selected_month]
    year = 2027 if month_num in [1, 2, 3] else 2026

    conn = get_db_connection()
    with conn.cursor() as cursor:
        # ─── 1. TOTAL BUDGET vs ACTUAL – CURRENT MONTH ───
        cursor.execute(f"SELECT COALESCE(SUM({selected_month}), 0) as target FROM total_budget;")
        total_target_val = float(cursor.fetchone()['target'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(net_dom_amount), 0) as inv_net 
            FROM invoice_output 
            WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s;
        """, (month_num, year))
        inv_net = float(cursor.fetchone()['inv_net'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(backlog_value_base_curr), 0) as back_val 
            FROM outstanding_output 
            WHERE UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL;
        """)
        out_back_non_gstea = float(cursor.fetchone()['back_val'] or 0.0)

        total_actual_val = inv_net + out_back_non_gstea
        total_pct = round((total_actual_val / total_target_val) * 100) if total_target_val > 0 else 0
        total_variance = total_actual_val - total_target_val

        # ─── 2. DIS : PRI BUDGET vs ACTUAL – CURRENT MONTH ───
        cursor.execute("""
            SELECT COALESCE(SUM(net_dom_amount), 0) as dis_inv 
            FROM invoice_output 
            WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s 
              AND UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """, (month_num, year))
        dis_pri_inv = float(cursor.fetchone()['dis_inv'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(backlog_value_base_curr), 0) as dis_back 
            FROM outstanding_output 
            WHERE UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """)
        dis_pri_back = float(cursor.fetchone()['dis_back'] or 0.0)

        pri_actual = dis_pri_inv + dis_pri_back

        cursor.execute("""
            SELECT COALESCE(SUM(primary_target), 0) as pri_target 
            FROM dis_budget 
            WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
        """, (month_num, f"%-{month_num:02d}-%", selected_month))
        pri_target = float(cursor.fetchone()['pri_target'] or 0.0)

        pri_pct = round((pri_actual / pri_target) * 100) if pri_target > 0 else 0
        pri_variance = pri_actual - pri_target

        # ─── 3. DIRECT BUDGET vs ACTUAL – CURRENT MONTH ───
        cursor.execute("""
            SELECT COALESCE(SUM(net_dom_amount), 0) as dir_inv 
            FROM invoice_output 
            WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s 
              AND (UPPER(TRIM(cust_grp)) != 'DISTRI' OR cust_grp IS NULL)
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """, (month_num, year))
        dir_inv_net = float(cursor.fetchone()['dir_inv'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(backlog_value_base_curr), 0) as dir_back 
            FROM outstanding_output 
            WHERE (UPPER(TRIM(cust_grp)) != 'DISTRI' OR cust_grp IS NULL)
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """)
        dir_out_back = float(cursor.fetchone()['dir_back'] or 0.0)

        direct_actual = dir_inv_net + dir_out_back

        direct_target = total_target_val - pri_target
        if direct_target < 0:
            direct_target = 0.0

        direct_pct = round((direct_actual / direct_target) * 100) if direct_target > 0 else 0
        direct_variance = direct_actual - direct_target

        # ─── 4. DIS : RD BUDGET vs ACTUAL ───
        cursor.execute("""
            SELECT COALESCE(SUM(value), 0) as rd_act 
            FROM axienta_data 
            WHERE MONTH(entry_date) = %s AND YEAR(entry_date) = %s;
        """, (month_num, year))
        rd_actual = float(cursor.fetchone()['rd_act'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(rd_target), 0) as rd_target 
            FROM dis_budget 
            WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
        """, (month_num, f"%-{month_num:02d}-%", selected_month))
        rd_target = float(cursor.fetchone()['rd_target'] or 0.0)

        rd_pct = round((rd_actual / rd_target) * 100) if rd_target > 0 else 0
        rd_variance = rd_actual - rd_target

        # ─── 5. ANNUAL BUDGET vs ACTUAL ───
        cursor.execute("SELECT COALESCE(SUM(total), 0) as annual_target FROM total_budget;")
        annual_target = float(cursor.fetchone()['annual_target'] or 13554000000.0)
        annual_actual = total_actual_val
        annual_pct = round((annual_actual / annual_target) * 100) if annual_target > 0 else 0

    conn.close()

    return {
        "selected_month": selected_month,
        "month_label": month_name,
        "total_budget": {
            "target": round(total_target_val, 2),
            "actual": round(total_actual_val, 2),
            "pct": total_pct,
            "variance": round(total_variance, 2),
            "actual_formula": f"Formula: invoice_output.NET_DOM_AMOUNT (LKR {inv_net:,.2f}) + outstanding_output.backlog (Excl GSTEA: LKR {out_back_non_gstea:,.2f})",
            "target_formula": f"Formula: SUM({selected_month}) from total_budget table = LKR {total_target_val:,.2f}"
        },
        "direct_budget": {
            "target": round(direct_target, 2),
            "actual": round(direct_actual, 2),
            "pct": direct_pct,
            "variance": round(direct_variance, 2),
            "actual_formula": f"Formula: Excluded cust_grp='DISTRI' & contract='GSTEA' -> Invoice (LKR {dir_inv_net:,.2f}) + Backlog (LKR {dir_out_back:,.2f})",
            "target_formula": f"Formula: Total {month_name} Budget (LKR {total_target_val:,.2f}) - Dis Primary Target (LKR {pri_target:,.2f}) = LKR {direct_target:,.2f}"
        },
        "dis_pri": {
            "target": round(pri_target, 2),
            "actual": round(pri_actual, 2),
            "pct": pri_pct,
            "variance": round(pri_variance, 2),
            "actual_formula": f"Formula: ONLY cust_grp='DISTRI' & contract!='GSTEA' -> Invoice (LKR {dis_pri_inv:,.2f}) + Backlog (LKR {dis_pri_back:,.2f})",
            "target_formula": f"Formula: SUM(primary_target) from dis_budget for {month_name} = LKR {pri_target:,.2f}"
        },
        "dis_rd": {
            "target": round(rd_target, 2),
            "actual": round(rd_actual, 2),
            "pct": rd_pct,
            "variance": round(rd_variance, 2),
            "actual_formula": f"Formula: SUM(value) from axienta_data table for {month_name} = LKR {rd_actual:,.2f}",
            "target_formula": f"Formula: SUM(rd_target) from dis_budget table for {month_name} = LKR {rd_target:,.2f}"
        },
        "annual": {
            "target": round(annual_target, 2),
            "actual": round(annual_actual, 2),
            "pct": annual_pct,
            "actual_formula": f"Formula: Full YTD Actual = LKR {annual_actual:,.2f}",
            "target_formula": f"Formula: SUM(total) from total_budget table = LKR {annual_target:,.2f}"
        }
    }


# ─── DIS DASHBOARD FY OVERVIEW ENDPOINT ───
@router.get("/dis-dashboard-fy-overview")
def get_dis_dashboard_fy_overview(month: Optional[str] = Query("july")):
    selected_month = month.lower().strip() if month and month.lower().strip() in MONTH_MAPPING else "july"
    month_num = MONTH_MAPPING[selected_month]
    month_name = MONTH_NAMES[selected_month]
    year = 2027 if month_num in [1, 2, 3] else 2026

    conn = get_db_connection()
    with conn.cursor() as cursor:
        # 1. Primary Sales Details (cust_grp = 'DISTRI')
        cursor.execute("""
            SELECT COALESCE(SUM(net_dom_amount), 0) as dis_inv 
            FROM invoice_output 
            WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s 
              AND UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """, (month_num, year))
        pri_inv = float(cursor.fetchone()['dis_inv'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(backlog_value_base_curr), 0) as dis_back 
            FROM outstanding_output 
            WHERE UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """)
        pri_back = float(cursor.fetchone()['dis_back'] or 0.0)

        pri_actual = pri_inv + pri_back

        cursor.execute("""
            SELECT COALESCE(SUM(primary_target), 0) as pri_target 
            FROM dis_budget 
            WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
        """, (month_num, f"%-{month_num:02d}-%", selected_month))
        pri_target = float(cursor.fetchone()['pri_target'] or 0.0)

        pri_pct = round((pri_actual / pri_target) * 100) if pri_target > 0 else 0
        pri_variance = pri_actual - pri_target

        # 2. RD Sales Details (axienta_data.value for select month)
        cursor.execute("""
            SELECT COALESCE(SUM(value), 0) as rd_act 
            FROM axienta_data 
            WHERE MONTH(entry_date) = %s AND YEAR(entry_date) = %s;
        """, (month_num, year))
        rd_actual = float(cursor.fetchone()['rd_act'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(rd_target), 0) as rd_target 
            FROM dis_budget 
            WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
        """, (month_num, f"%-{month_num:02d}-%", selected_month))
        rd_target = float(cursor.fetchone()['rd_target'] or 0.0)

        rd_pct = round((rd_actual / rd_target) * 100) if rd_target > 0 else 0
        rd_variance = rd_actual - rd_target

        # 3. Full Year Totals
        cursor.execute("SELECT COALESCE(SUM(primary_target), 0) as fy_pri_tgt, COALESCE(SUM(rd_target), 0) as fy_rd_tgt FROM dis_budget;")
        fy_dis = cursor.fetchone()
        fy_pri_target = float(fy_dis['fy_pri_tgt'] or 0.0)
        fy_rd_target = float(fy_dis['fy_rd_tgt'] or 0.0)

        cursor.execute("""
            SELECT COALESCE(SUM(net_dom_amount), 0) as fy_pri_inv 
            FROM invoice_output 
            WHERE UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
        """)
        fy_pri_inv = float(cursor.fetchone()['fy_pri_inv'] or 0.0)
        fy_pri_actual = fy_pri_inv + pri_back
        fy_pri_pct = round((fy_pri_actual / fy_pri_target) * 100) if fy_pri_target > 0 else 0

        cursor.execute("SELECT COALESCE(SUM(value), 0) as fy_rd_act FROM axienta_data;")
        fy_rd_actual = float(cursor.fetchone()['fy_rd_act'] or 0.0)
        fy_rd_pct = round((fy_rd_actual / fy_rd_target) * 100) if fy_rd_target > 0 else 0

        # 4. Monthly Breakdown for Quarter Charts (12 Months)
        monthly_breakdown = []
        for m_key, m_code in MONTH_MAPPING.items():
            m_yr = 2027 if m_code in [1, 2, 3] else 2026
            
            # Pri Act
            cursor.execute("""
                SELECT COALESCE(SUM(net_dom_amount), 0) as inv 
                FROM invoice_output 
                WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s 
                  AND UPPER(TRIM(cust_grp)) = 'DISTRI'
                  AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL);
            """, (m_code, m_yr))
            m_pri_inv = float(cursor.fetchone()['inv'] or 0.0)
            m_pri_act = m_pri_inv + (pri_back if m_code == month_num else 0.0)

            # Pri Tgt
            cursor.execute("""
                SELECT COALESCE(SUM(primary_target), 0) as tgt 
                FROM dis_budget 
                WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
            """, (m_code, f"%-{m_code:02d}-%", m_key))
            m_pri_tgt = float(cursor.fetchone()['tgt'] or 0.0)

            # RD Act
            cursor.execute("""
                SELECT COALESCE(SUM(value), 0) as val 
                FROM axienta_data 
                WHERE MONTH(entry_date) = %s AND YEAR(entry_date) = %s;
            """, (m_code, m_yr))
            m_rd_act = float(cursor.fetchone()['val'] or 0.0)

            # RD Tgt
            cursor.execute("""
                SELECT COALESCE(SUM(rd_target), 0) as tgt 
                FROM dis_budget 
                WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s;
            """, (m_code, f"%-{m_code:02d}-%", m_key))
            m_rd_tgt = float(cursor.fetchone()['tgt'] or 0.0)

            qtr_label = "1st QTR" if m_code in [4, 5, 6] else ("2nd QTR" if m_code in [7, 8, 9] else ("3rd QTR" if m_code in [10, 11, 12] else "4th QTR"))

            monthly_breakdown.append({
                "month_key": m_key,
                "month_short": m_key[:3].capitalize(),
                "qtr": qtr_label,
                "pri_act": round(m_pri_act, 2),
                "pri_tgt": round(m_pri_tgt, 2),
                "rd_act": round(m_rd_act, 2),
                "rd_tgt": round(m_rd_tgt, 2)
            })

    conn.close()

    return {
        "selected_month": selected_month,
        "month_label": month_name,
        "primary_sales": {
            "actual": round(pri_actual, 2),
            "target": round(pri_target, 2),
            "pct": pri_pct,
            "variance": round(pri_variance, 2),
            "actual_formula": f"Formula: invoice_output.NET_DOM_AMOUNT (LKR {pri_inv:,.2f}) + outstanding_output.backlog (LKR {pri_back:,.2f}) where cust_grp='DISTRI'",
            "target_formula": f"Formula: SUM(primary_target) from dis_budget table for {month_name} = LKR {pri_target:,.2f}"
        },
        "rd_sales": {
            "actual": round(rd_actual, 2),
            "target": round(rd_target, 2),
            "pct": rd_pct,
            "variance": round(rd_variance, 2),
            "actual_formula": f"Formula: SUM(value) from axienta_data table for {month_name} = LKR {rd_actual:,.2f}",
            "target_formula": f"Formula: SUM(rd_target) from dis_budget table for {month_name} = LKR {rd_target:,.2f}"
        },
        "full_year": {
            "pri_target": round(fy_pri_target, 2),
            "pri_actual": round(fy_pri_actual, 2),
            "pri_pct": fy_pri_pct,
            "rd_target": round(fy_rd_target, 2),
            "rd_actual": round(fy_rd_actual, 2),
            "rd_pct": fy_rd_pct
        },
        "monthly_breakdown": monthly_breakdown
    }


# ─── DISTRI RANGE WISE FY API ENDPOINT ───
@router.get("/distri-range-fy")
def get_distri_range_fy(month: Optional[str] = Query("july")):
    selected_month = month.lower().strip() if month and month.lower().strip() in MONTH_MAPPING else "july"
    month_num = MONTH_MAPPING[selected_month]
    month_name = MONTH_NAMES[selected_month]
    year = 2027 if month_num in [1, 2, 3] else 2026

    conn = get_db_connection()
    with conn.cursor() as cursor:
        # 1. Primary target & RD target from dis_budget for July
        cursor.execute("""
            SELECT 
                TRIM(product_id) as pid,
                COALESCE(SUM(primary_target), 0) as m_pri_tgt,
                COALESCE(SUM(rd_target), 0) as m_rd_tgt
            FROM dis_budget
            WHERE MONTH(month) = %s OR month LIKE %s OR LOWER(month) = %s
            GROUP BY TRIM(product_id);
        """, (month_num, f"%-{month_num:02d}-%", selected_month))
        dis_budget_map = {r['pid']: r for r in cursor.fetchall()}

        # 2. Cumulative Primary target & RD target from dis_budget (Apr to selected month)
        cursor.execute("""
            SELECT 
                TRIM(product_id) as pid,
                COALESCE(SUM(primary_target), 0) as c_pri_tgt,
                COALESCE(SUM(rd_target), 0) as c_rd_tgt
            FROM dis_budget
            WHERE MONTH(month) <= %s
            GROUP BY TRIM(product_id);
        """, (month_num,))
        dis_budget_c_map = {r['pid']: r for r in cursor.fetchall()}

        # 3. RD actual from axienta_data for July
        cursor.execute("""
            SELECT 
                TRIM(product_id) as pid,
                COALESCE(SUM(value), 0) as m_rd_act
            FROM axienta_data
            WHERE MONTH(entry_date) = %s AND YEAR(entry_date) = %s
            GROUP BY TRIM(product_id);
        """, (month_num, year))
        axienta_m_map = {r['pid']: r['m_rd_act'] for r in cursor.fetchall()}

        # 4. Cumulative RD actual from axienta_data (Apr to selected month)
        cursor.execute("""
            SELECT 
                TRIM(product_id) as pid,
                COALESCE(SUM(value), 0) as c_rd_act
            FROM axienta_data
            WHERE MONTH(entry_date) <= %s AND YEAR(entry_date) = %s
            GROUP BY TRIM(product_id);
        """, (month_num, year))
        axienta_c_map = {r['pid']: r['c_rd_act'] for r in cursor.fetchall()}

        # 5. Primary actual from invoice_output for July
        cursor.execute("""
            SELECT 
                TRIM(catalog_no) as pid,
                COALESCE(SUM(net_dom_amount), 0) as m_inv
            FROM invoice_output
            WHERE MONTH(invoice_date) = %s AND YEAR(invoice_date) = %s
              AND UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL)
            GROUP BY TRIM(catalog_no);
        """, (month_num, year))
        inv_m_map = {r['pid']: r['m_inv'] for r in cursor.fetchall()}

        # 6. Cumulative Primary actual from invoice_output (Apr to selected month)
        cursor.execute("""
            SELECT 
                TRIM(catalog_no) as pid,
                COALESCE(SUM(net_dom_amount), 0) as c_inv
            FROM invoice_output
            WHERE MONTH(invoice_date) <= %s AND YEAR(invoice_date) = %s
              AND UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL)
            GROUP BY TRIM(catalog_no);
        """, (month_num, year))
        inv_c_map = {r['pid']: r['c_inv'] for r in cursor.fetchall()}

        # 7. Backlog from outstanding_output
        cursor.execute("""
            SELECT 
                TRIM(catalog_no) as pid,
                COALESCE(SUM(backlog_value_base_curr), 0) as back
            FROM outstanding_output
            WHERE UPPER(TRIM(cust_grp)) = 'DISTRI'
              AND (UPPER(TRIM(contract)) != 'GSTEA' OR contract IS NULL)
            GROUP BY TRIM(catalog_no);
        """)
        back_map = {r['pid']: r['back'] for r in cursor.fetchall()}

        # 8. All distinct items from total_budget
        cursor.execute("""
            SELECT DISTINCT
                TRIM(range_name) as division_name,
                TRIM(sales_group) as subgroup_name,
                TRIM(part_no) as part_no,
                TRIM(product_sku) as product_sku
            FROM total_budget
            WHERE range_name IS NOT NULL AND TRIM(range_name) != ''
              AND sales_group IS NOT NULL AND TRIM(sales_group) != ''
            ORDER BY division_name, subgroup_name, part_no;
        """)
        tb_items = cursor.fetchall()

    conn.close()

    # Build Nested 3-Level Tree: Division -> SubGroup -> Items
    divisions_dict = {}

    for item in tb_items:
        div_name = item['division_name']
        sub_name = item['subgroup_name']
        pid = item['part_no']
        sku = item['product_sku']

        m_b = dis_budget_map.get(pid, {})
        c_b = dis_budget_c_map.get(pid, {})

        p_tgt = float(m_b.get('m_pri_tgt', 0.0))
        rd_tgt = float(m_b.get('m_rd_tgt', 0.0))

        c_p_tgt = float(c_b.get('c_pri_tgt', 0.0))
        c_rd_tgt = float(c_b.get('c_rd_tgt', 0.0))

        p_act = float(inv_m_map.get(pid, 0.0)) + float(back_map.get(pid, 0.0))
        rd_act = float(axienta_m_map.get(pid, 0.0))

        c_p_act = float(inv_c_map.get(pid, 0.0)) + float(back_map.get(pid, 0.0))
        c_rd_act = float(axienta_c_map.get(pid, 0.0))

        p_pct = round((p_act / p_tgt) * 100) if p_tgt > 0 else 0
        rd_pct = round((rd_act / rd_tgt) * 100) if rd_tgt > 0 else 0

        c_p_pct = round((c_p_act / c_p_tgt) * 100) if c_p_tgt > 0 else 0
        c_rd_pct = round((c_rd_act / c_rd_tgt) * 100) if c_rd_tgt > 0 else 0

        item_obj = {
            "part_no": pid,
            "product_sku": sku,
            "p_tgt": round(p_tgt, 2),
            "p_act": round(p_act, 2),
            "p_pct": p_pct,
            "rd_tgt": round(rd_tgt, 2),
            "rd_act": round(rd_act, 2),
            "rd_pct": rd_pct,
            "c_p_tgt": round(c_p_tgt, 2),
            "c_p_act": round(c_p_act, 2),
            "c_p_pct": c_p_pct,
            "c_rd_tgt": round(c_rd_tgt, 2),
            "c_rd_act": round(c_rd_act, 2),
            "c_rd_pct": c_rd_pct
        }

        if div_name not in divisions_dict:
            divisions_dict[div_name] = {}
        if sub_name not in divisions_dict[div_name]:
            divisions_dict[div_name][sub_name] = []

        divisions_dict[div_name][sub_name].append(item_obj)

    # Format Tree Structure with Aggregations
    tree = []
    div_idx = 1

    g_p_tgt = 0.0
    g_p_act = 0.0
    g_rd_tgt = 0.0
    g_rd_act = 0.0
    g_c_p_tgt = 0.0
    g_c_p_act = 0.0
    g_c_rd_tgt = 0.0
    g_c_rd_act = 0.0

    for d_name, sub_map in divisions_dict.items():
        d_p_tgt = 0.0
        d_p_act = 0.0
        d_rd_tgt = 0.0
        d_rd_act = 0.0
        d_c_p_tgt = 0.0
        d_c_p_act = 0.0
        d_c_rd_tgt = 0.0
        d_c_rd_act = 0.0

        subgroups_list = []

        for s_name, items_list in sub_map.items():
            s_p_tgt = sum(i['p_tgt'] for i in items_list)
            s_p_act = sum(i['p_act'] for i in items_list)
            s_rd_tgt = sum(i['rd_tgt'] for i in items_list)
            s_rd_act = sum(i['rd_act'] for i in items_list)

            s_c_p_tgt = sum(i['c_p_tgt'] for i in items_list)
            s_c_p_act = sum(i['c_p_act'] for i in items_list)
            s_c_rd_tgt = sum(i['c_rd_tgt'] for i in items_list)
            s_c_rd_act = sum(i['c_rd_act'] for i in items_list)

            s_p_pct = round((s_p_act / s_p_tgt) * 100) if s_p_tgt > 0 else 0
            s_rd_pct = round((s_rd_act / s_rd_tgt) * 100) if s_rd_tgt > 0 else 0
            s_c_p_pct = round((s_c_p_act / s_c_p_tgt) * 100) if s_c_p_tgt > 0 else 0
            s_c_rd_pct = round((s_c_rd_act / s_c_rd_tgt) * 100) if s_c_rd_tgt > 0 else 0

            subgroups_list.append({
                "subgroup_name": s_name,
                "p_tgt": round(s_p_tgt, 2),
                "p_act": round(s_p_act, 2),
                "p_pct": s_p_pct,
                "rd_tgt": round(s_rd_tgt, 2),
                "rd_act": round(s_rd_act, 2),
                "rd_pct": s_rd_pct,
                "c_p_tgt": round(s_c_p_tgt, 2),
                "c_p_act": round(s_c_p_act, 2),
                "c_p_pct": s_c_p_pct,
                "c_rd_tgt": round(s_c_rd_tgt, 2),
                "c_rd_act": round(s_c_rd_act, 2),
                "c_rd_pct": s_c_rd_pct,
                "items": items_list
            })

            d_p_tgt += s_p_tgt
            d_p_act += s_p_act
            d_rd_tgt += s_rd_tgt
            d_rd_act += s_rd_act
            d_c_p_tgt += s_c_p_tgt
            d_c_p_act += s_c_p_act
            d_c_rd_tgt += s_c_rd_tgt
            d_c_rd_act += s_c_rd_act

        d_p_pct = round((d_p_act / d_p_tgt) * 100) if d_p_tgt > 0 else 0
        d_rd_pct = round((d_rd_act / d_rd_tgt) * 100) if d_rd_tgt > 0 else 0
        d_c_p_pct = round((d_c_p_act / d_c_p_tgt) * 100) if d_c_p_tgt > 0 else 0
        d_c_rd_pct = round((d_c_rd_act / d_c_rd_tgt) * 100) if d_c_rd_tgt > 0 else 0

        tree.append({
            "no": div_idx,
            "division_name": d_name,
            "p_tgt": round(d_p_tgt, 2),
            "p_act": round(d_p_act, 2),
            "p_pct": d_p_pct,
            "rd_tgt": round(d_rd_tgt, 2),
            "rd_act": round(d_rd_act, 2),
            "rd_pct": d_rd_pct,
            "c_p_tgt": round(d_c_p_tgt, 2),
            "c_p_act": round(d_c_p_act, 2),
            "c_p_pct": d_c_p_pct,
            "c_rd_tgt": round(d_c_rd_tgt, 2),
            "c_rd_act": round(d_c_rd_act, 2),
            "c_rd_pct": d_c_rd_pct,
            "subgroups": subgroups_list
        })

        div_idx += 1

        g_p_tgt += d_p_tgt
        g_p_act += d_p_act
        g_rd_tgt += d_rd_tgt
        g_rd_act += d_rd_act
        g_c_p_tgt += d_c_p_tgt
        g_c_p_act += d_c_p_act
        g_c_rd_tgt += d_c_rd_tgt
        g_c_rd_act += d_c_rd_act

    g_p_pct = round((g_p_act / g_p_tgt) * 100) if g_p_tgt > 0 else 0
    g_rd_pct = round((g_rd_act / g_rd_tgt) * 100) if g_rd_tgt > 0 else 0
    g_c_p_pct = round((g_c_p_act / g_c_p_tgt) * 100) if g_c_p_tgt > 0 else 0
    g_c_rd_pct = round((g_c_rd_act / g_c_rd_tgt) * 100) if g_c_rd_tgt > 0 else 0

    return {
        "selected_month": selected_month,
        "month_label": month_name,
        "total_divisions": len(tree),
        "grand_total": {
            "p_tgt": round(g_p_tgt, 2),
            "p_act": round(g_p_act, 2),
            "p_pct": g_p_pct,
            "rd_tgt": round(g_rd_tgt, 2),
            "rd_act": round(g_rd_act, 2),
            "rd_pct": g_rd_pct,
            "c_p_tgt": round(g_c_p_tgt, 2),
            "c_p_act": round(g_c_p_act, 2),
            "c_p_pct": g_c_p_pct,
            "c_rd_tgt": round(g_c_rd_tgt, 2),
            "c_rd_act": round(g_c_rd_act, 2),
            "c_rd_pct": g_c_rd_pct
        },
        "tree": tree
    }
