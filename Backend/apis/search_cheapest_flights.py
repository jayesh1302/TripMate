from amadeus import Client, ResponseError
from dotenv import load_dotenv
from flask import jsonify
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Amadeus client
amadeus = Client(
    client_id=os.getenv('AMADEUS_CLIENT_ID'),
    client_secret=os.getenv('AMADEUS_CLIENT_SECRET')
)

def search_cheapest_flights(origin, destination, departure_date):
    try:
        response = amadeus.shopping.flight_offers_search.get(
            originLocationCode=origin,
            destinationLocationCode=destination,
            departureDate=departure_date,
            adults=1,
            max=5
        )
        return jsonify(response.data)
    except ResponseError as error:
        return jsonify({"error": str(error)}), 500
