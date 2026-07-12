from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"status": "ATK Capital API is LIVE"})

@app.route("/api/binance/balance")
def binance_balance():
    return jsonify({"total": 1.3, "btc": 0.0, "eth": 0.0, "pnl": "+0.00"})

@app.route("/api/binance/positions")
def binance_positions():
    return jsonify([])

@app.route("/api/coinbase/balance")
def coinbase_balance():
    return jsonify({"total": 0.0, "cash": 0.0})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)