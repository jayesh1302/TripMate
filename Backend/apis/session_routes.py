from flask import request, jsonify
from main import db, app
from models.models import Session
import random
import string

def generate_session_code():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))

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
