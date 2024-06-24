from amadeus import Client, ResponseError, Location
from flask import jsonify
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Amadeus client
amadeus = Client(
    client_id=os.getenv('AMADEUS_CLIENT_ID'),
    client_secret=os.getenv('AMADEUS_CLIENT_SECRET')
)

def search_locations_by_keyword(keyword, limit=None):
    try:
        params = {
            'keyword': keyword,
            'subType': Location.ANY
        }
        if limit:
            params['page[limit]'] = limit
        
        response = amadeus.reference_data.locations.get(**params)
        return jsonify(response.data)
    except ResponseError as error:
        return jsonify({"error": str(error)}), 500
