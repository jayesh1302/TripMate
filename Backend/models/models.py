from main import db

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_code = db.Column(db.String(6), unique=True, nullable=False)
    creator = db.Column(db.String(80), nullable=False)
    participants = db.Column(db.String(255))

    def __repr__(self):
        return f'<Session {self.session_code}>'