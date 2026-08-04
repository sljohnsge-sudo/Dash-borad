from typing import Optional, List, Dict
from fastapi import APIRouter, HTTPException, Query, Body
from app.core.database import get_db_connection

router = APIRouter(prefix="/api/division-mappings", tags=["Division Mappings"])

DEFAULT_MAPPINGS = [
    ("ADCOCK", "OAKNET"),
    ("ADCOCK-LO", "OAKNET"),
    ("ALP", "ALPAYA"),
    ("PRYMAX SAL", "SURGICAL CONSUMABLES - divasa"),
    ("ROCKET SAL", "SUR CONSUMABLES"),
    ("ARR G (A)", "ARROWIL A1"),
    ("ARR U (A)", "ARROWIL A1"),
    ("ARRA4", "ARROWIL A4"),
    ("ARR C (A)", "ARROWIL A2"),
    ("ARRA2I", "ARROWIL A2"),
    ("ARRA2U", "ARROWIL A2"),
    ("ARRA2UGE", "ARROWIL A2"),
    ("ARRA3S", "ARROWIL A3"),
    ("ARR C (B1)", "ARROWIL B1"),
    ("ARR U (B)", "ARROWIL B1"),
    ("ARRB1S", "ARROWIL B1"),
    ("ARR C (B)", "ARROWIL B2"),
    ("ARR GE (B)", "ARROWIL B2"),
    ("ARR P (B)", "ARROWIL B2"),
    ("ARRB2S", "ARROWIL B2"),
    ("ARRB2U", "ARROWIL B2"),
    ("ARR U B7", "ARROWIL B7"),
    ("ACCESSORIE", "B BRAUN"),
    ("B BRAUNACC", "B BRAUN"),
    ("B.B.ANG &", "STENTS & CATHLAB"),
    ("CATHE.LAB", "STENTS & CATHLAB"),
    ("NBQ-BBSL", "B BRAUN SUTURES"),
    ("CENTAUR PH", "CENTAUR"),
    ("APPA FOR", "EYECARE"),
    ("APPA NOR", "EYECARE"),
    ("APP-PFS", "EYECARE"),
    ("FDN BL", "ALTIVON"),
    ("GENPHAMA", "LANMED"),
    ("GENPH-EYE", "LANMED"),
    ("FREDAN PHA", "FREDUN"),
    ("LACTO", "LACTONOVA"),
    ("SNZ", "LACTONOVA"),
    ("ARCADE", "LANMED"),
    ("IBN", "LANMED"),
    ("MARIO", "LANMED"),
    ("PULSE", "LANMED"),
    ("LEPU", "LEPU"),
    ("MEDOCHEM", "MEDOCHEMIE"),
    ("NABIQASIM", "NQ"),
    ("NBQ-IV", "NQ"),
    ("NBQNC", "NBQ - NEPROLOGY"),
    ("NQ BL", "ALTIVON"),
    ("NQDDP", "NQ"),
    ("CELL", "SPECIALTY- CELLTRION"),
    ("UNITED BIO", "SPECIALTY- UBPL"),
    ("VCHOW", "SPECIALTY- CELLTRION"),
    ("OTSUKA", "OTSUKA"),
    ("BL LOCAL", "BL"),
    ("BL SALE", "BL"),
    ("MEN - SALE", "BL"),
    ("DENTAIDS", "DENTAL"),
    ("ICPA - SAL", "DENTAL"),
    ("KATARA", "DENTAL"),
    ("SILMET", "DENTAL"),
    ("VERSAH", "DENTAL"),
    ("CARA", "AEROMED"),
    ("INGA", "AEROMED"),
    ("PLATINUM S", "AEROMED"),
    ("AR PRO (B)", "BBRAUN WOUND CARE"),
    ("ARR PR (B)", "PRECICION COATING"),
    ("UL CEN", "UL-CEN"),
    ("UL SALE", "UL"),
    ("UL-NBQ", "UL-CEN"),
    ("UL-SWISS", "UL-CEN"),
    ("VIRCW", "UL"),
    ("ELASTRO", "SPORTS MEDICINE"),
    ("MUELLER SA", "SPORTS MEDICINE"),
    ("SPOL SALES", "SPORTS MEDICINE"),
    ("STRECHIT", "SPORTS MEDICINE"),
    ("SURJAVY", "SPORTS MEDICINE"),
    ("BTL SALES", "MEDICAL EQUIP"),
    ("DSI", "MEDICAL EQUIP"),
    ("HEUSER", "MEDICAL EQUIP"),
    ("LIFE CARE", "MEDICAL EQUIP"),
    ("MULTI", "MEDICAL EQUIP"),
    ("OTTO", "MEDICAL EQUIP"),
    ("RUPS", "MEDICAL EQUIP"),
    ("SISSEL", "MEDICAL EQUIP"),
    ("TIL HEALTH", "TIL"),
    ("BIONOTE", "VETINERARY"),
    ("BRILLIANT", "VETINERARY"),
    ("VET F", "VETINERARY"),
    ("VET L", "VETINERARY"),
    ("VSY SALES", "EYECARE"),
    ("WYETH SALE", "WYETH"),
    ("HETERO", "HETERO"),
    ("UPL HETERO", "UPL HETERO"),
    ("(blank)", "B BRAUN 3PL"),
    ("(blank)", "COLLOMBO"),
    ("(blank)", "DIAGNOSTIC"),
    ("(blank)", "MADIWELA"),
    ("GLUCOMETER", "DIAGNOSTIC"),
    ("DVAN", "LACTONOVA"),
    ("SCS-LOCAL", "SRI CHIN"),
    ("BIOTEST", "DIAGNOSTIC"),
    ("UL-CEN", "UL-CEN"),
    ("STRIPS & C", "DIAGNOSTIC"),
    ("SD BIO", "DIAGNOSTIC"),
    ("ALTAYLAR S", "SUR CONSUMABLES"),
    ("TAJ SALES", ""),
    ("ARRB7", "ARROWIL B7"),
    ("MEDEQUIP", "DIAGNOSTIC"),
]

_db_initialized = False

def init_division_mappings_table():
    global _db_initialized
    if _db_initialized:
        return
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS division_mappings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sales_group VARCHAR(100) NOT NULL,
                range_name VARCHAR(100) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_sg_rn (sales_group, range_name)
            );
        """)
        cursor.execute("SELECT COUNT(*) as cnt FROM division_mappings;")
        cnt = cursor.fetchone()["cnt"]
        if cnt == 0:
            cursor.executemany("""
                INSERT IGNORE INTO division_mappings (sales_group, range_name)
                VALUES (%s, %s);
            """, DEFAULT_MAPPINGS)
    conn.close()
    _db_initialized = True


@router.on_event("startup")
def on_startup():
    try:
        init_division_mappings_table()
    except Exception as e:
        print(f"Error initializing division_mappings table: {e}")


@router.get("")
def list_division_mappings(search: Optional[str] = Query(None)):
    init_division_mappings_table()
    conn = get_db_connection()
    with conn.cursor() as cursor:
        if search:
            like_str = f"%{search}%"
            cursor.execute("""
                SELECT id, sales_group, range_name, DATE_FORMAT(updated_at, '%%Y-%%m-%%d %%H:%%i') as updated_at
                FROM division_mappings
                WHERE sales_group LIKE %s OR range_name LIKE %s
                ORDER BY id ASC;
            """, (like_str, like_str))
        else:
            cursor.execute("""
                SELECT id, sales_group, range_name, DATE_FORMAT(updated_at, '%%Y-%%m-%%d %%H:%%i') as updated_at
                FROM division_mappings
                ORDER BY id ASC;
            """)
        rows = cursor.fetchall()
    conn.close()
    return {"status": "success", "total": len(rows), "data": rows}


@router.post("")
def create_division_mapping(
    sales_group: str = Body(..., embed=True),
    range_name: str = Body(..., embed=True)
):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            INSERT INTO division_mappings (sales_group, range_name)
            VALUES (%s, %s);
        """, (sales_group, range_name))
        new_id = cursor.lastrowid
    conn.close()
    return {"status": "success", "id": new_id, "sales_group": sales_group, "range_name": range_name}


@router.put("/{mapping_id}")
def update_division_mapping(
    mapping_id: int,
    sales_group: str = Body(..., embed=True),
    range_name: str = Body(..., embed=True)
):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE division_mappings
            SET sales_group = %s, range_name = %s
            WHERE id = %s;
        """, (sales_group, range_name, mapping_id))
    conn.close()
    return {"status": "success", "id": mapping_id, "sales_group": sales_group, "range_name": range_name}


@router.delete("/{mapping_id}")
def delete_division_mapping(mapping_id: int):
    conn = get_db_connection()
    with conn.cursor() as cursor:
        cursor.execute("DELETE FROM division_mappings WHERE id = %s;", (mapping_id,))
    conn.close()
    return {"status": "success", "message": f"Mapping ID {mapping_id} deleted."}
