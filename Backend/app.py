from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import random
import string
from apis.search_cheapest_flights import search_cheapest_flights
from apis.search_locations_by_keyword import search_locations_by_keyword

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sessions.db'  # Use a SQLite database named sessions.db
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Define the Session model
class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_code = db.Column(db.String(6), unique=True, nullable=False)
    creator = db.Column(db.String(80), nullable=False)
    participants = db.Column(db.String(255))  # CSV of participant IPs

    def __repr__(self):
        return f'<Session {self.session_code}>'

# Generate a unique session code
def generate_session_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

# Routes and logic
@app.route('/create_session', methods=['POST'])
def create_session():
    userName = request.json['userName']
    sessionCode = generate_session_code()
    new_session = Session(session_code=sessionCode, creator=userName, participants=userName)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({'sessionCode': sessionCode})

@app.route('/join_session', methods=['POST'])
def join_session():
    sessionCode = request.json['sessionCode']
    session = Session.query.filter_by(session_code=sessionCode).first()
    if session:
        session.participants += ',' + request.remote_addr
        db.session.commit()
        return jsonify({'status': 'joined'})
    else:
        return jsonify({'error': 'Session code does not exist'}), 404

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
    limit = data.get('limit',5)  # Get the limit from the request, if provided
    return search_locations_by_keyword(keyword, limit)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the database tables inside an application context
    app.run(debug=True)

