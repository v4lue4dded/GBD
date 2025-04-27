#!/usr/bin/env python3

from flask import Flask, request, jsonify

app = Flask(__name__)

# Mapping of numbers 1-10 to jokes
jokes = {
    1: "Why don't scientists trust atoms? Because they make up everything!",
    2: "Why did the math book look sad? Because it had too many problems.",
    3: "What do you call fake spaghetti? An impasta.",
    4: "Why couldn't the bicycle stand up by itself? It was two-tired.",
    5: "I would tell you a joke about construction, but I'm still working on it.",
    6: "Why did the scarecrow win an award? Because he was outstanding in his field.",
    7: "I used to hate facial hair... but then it grew on me.",
    8: "Why did the coffee file a police report? It got mugged.",
    9: "How does a penguin build its house? Igloos it together.",
    10: "What do you call cheese that isn't yours? Nacho cheese."
}

@app.route('/jokes', methods=['POST'])
def tell_jokes():
    data = request.get_json()
    if not data or 'numbers' not in data:
        return jsonify({'error': 'Please provide a JSON with a "numbers" list.'}), 400

    numbers = data['numbers']
    result = {}
    for num in numbers:
        try:
            key = int(num)
        except (ValueError, TypeError):
            result[str(num)] = 'Invalid number.'
            continue

        if key in jokes:
            result[str(key)] = jokes[key]
        else:
            result[str(key)] = 'No joke available for this number.'

    return jsonify(result)

if __name__ == '__main__':
    # Run on port 5000 (Flask default)
    app.run(host='0.0.0.0', port=5000)
