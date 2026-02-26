import sqlite3
import sys

try:
    conn = sqlite3.connect("cardioai.db")
    c = conn.cursor()
    c.execute("ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT 'User' NOT NULL")
    conn.commit()
    conn.close()
    print("Column added successfully.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
