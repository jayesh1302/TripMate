from flask import Flask, request
from flask_cors import CORS
from apis.search_cheapest_flights import search_cheapest_flights
from apis.search_locations_by_keyword import search_locations_by_keyword

app = Flask(__name__)
CORS(app)

@app.route('/search_flights', methods=['POST'])
def search_flights():
    data = request.json
    origin = data['origin']
    destination = data['destination']
    departure_date = data['departure_date']
    return search_cheapest_flights(origin, destination, departure_date)

@app.route('/search_locations', methods=['POST'])
def search_locations():
    data = request.json
    keyword = data['keyword']
    limit = data.get('limit',5)  # Get the limit from the request, if provided
    return search_locations_by_keyword(keyword, limit)

if __name__ == '__main__':
    app.run(debug=True)
