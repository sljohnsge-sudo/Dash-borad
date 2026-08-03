import os
import time
from database import init_db, clear_database, get_db_connection
from seed_csv_data import seed_invoice_output, seed_outstanding_output

def main():
    start_time = time.time()
    print("=== INITIALIZING MYSQL DATABASE ===")
    init_db()
    
    conn = get_db_connection()
    try:
        print("=== CLEARING EXISTING TABLES ===")
        clear_database(conn)
        
        print("=== IMPORTING CSV DATA TO MYSQL ===")
        c1 = seed_invoice_output(conn)
        c2 = seed_outstanding_output(conn)
        
        elapsed = round(time.time() - start_time, 2)
        print(f"\nSUCCESS! Total records imported across active tables: {c1 + c2} in {elapsed}s")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
