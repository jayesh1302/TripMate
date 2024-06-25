from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from apis.search_cheapest_flights import search_cheapest_flights
from apis.search_locations_by_keyword import search_locations_by_keyword
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sessions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Import routes after initializing Flask app to avoid circular imports
from apis.session_routes import *
from apis.search_routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)