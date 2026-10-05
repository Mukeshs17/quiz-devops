from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
# React frontend kooda cross-origin connectivity kaga CORS enable panroam
CORS(app)  

# Database table initialize panra function
def init_db():
    conn = sqlite3.connect('quiz.db')
    c = conn.cursor()
    # User data & score save panna table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT UNIQUE, 
            score INTEGER
        )
    ''')
    conn.commit()
    conn.close()

# 1. Login API Endpoint (User DB Sync)
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({"status": "error", "message": "Username is required"}), 400
        
    conn = sqlite3.connect('quiz.db')
    c = conn.cursor()
    # New user ah irundha DB-la add pannum, already irundha ignore pannum
    c.execute("INSERT OR IGNORE INTO users (username, score) VALUES (?, ?)", (username, 0))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success", "message": "User logged in and synced with DB"}), 200

# 2. Score Update API Endpoint
@app.route('/api/score', methods=['POST'])
def update_score():
    data = request.get_json()
    username = data.get('username')
    score = data.get('score')
    
    conn = sqlite3.connect('quiz.db')
    c = conn.cursor()
    c.execute("UPDATE users SET score = ? WHERE username = ?", (score, username))
    conn.commit()
    conn.close()
    
    return jsonify({"status": "success", "message": "Score updated successfully"}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
