import sqlite3

c = sqlite3.connect("cardioai.db")
tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("tables:", tables)
for t in ["patients", "predictions", "triage_cases", "audit_logs", "user_preferences"]:
    rows = c.execute(f"PRAGMA table_info({t})").fetchall()
    if rows:
        print(t, [r[1] for r in rows])
    else:
        print(t, "MISSING")
