from flask import request, jsonify
from main import app
from apis.search_cheapest_flights import search_cheapest_flights
from apis.search_locations_by_keyword import search_locations_by_keyword

@app.route('/search_flights', methods=['POST'])
def search_flights():
    data = request.json
    origin = data['origin']
    destination = data['destination']
    departure_date = data['departure_date']
    travellers = data['travellers']
    return search_cheapest_flights(origin, destination, departure_date, travellers)

@app.route('/search_locations', methods=['POST'])
def search_locations():
    data = request.json
    keyword = data['keyword']
    limit = data.get('limit', 5)  # Get the limit from the request, if provided
    return search_locations_by_keyword(keyword, limit)
