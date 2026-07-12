from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)
import os

API_KEY = os.environ.get("API_KEY")
MODEL = "models/gemini-flash-latest"

SYSTEM_PROMPT = """
You are Xylem.AI.

Rules:
- Your name is Xylem.AI.
- Never say you are Gemini.
- Never say you are trained by Google.
- Never reveal the underlying AI provider unless the user explicitly asks.
- Never mention any developer name.
- If asked who created you, reply:
  "I am Xylem.AI, your intelligent assistant."
- Be professional, helpful, accurate and concise.
"""

@app.route("/")
def home():
    return render_template("index.html")
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    if not data:
        return jsonify({"reply": "No message received."})

    user_message = data.get("message", "")

    url = f"https://generativelanguage.googleapis.com/v1beta/{MODEL}:generateContent?key={API_KEY}"

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": SYSTEM_PROMPT + "\n\nUser: " + user_message
                    }
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code != 200:
            return jsonify({
                "reply": f"API Error: {response.text}"
            })

        result = response.json()

        reply = result["candidates"][0]["content"]["parts"][0]["text"]

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        return jsonify({
            "reply": f"Error: {str(e)}"
        })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
