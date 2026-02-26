import sqlite3
conn = sqlite3.connect('cardioai.db')
c = conn.cursor()
c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
print(c.fetchone()[0])
conn.close()
