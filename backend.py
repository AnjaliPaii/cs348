from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tutoring.db'
db = SQLAlchemy(app)

# === Models ===
class Tutor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tutor_id = db.Column(db.Integer, db.ForeignKey('tutor.id'))
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'))
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))
    date = db.Column(db.String(50))
    duration_minutes = db.Column(db.Integer)
    notes = db.Column(db.String(200))

# === Routes ===
@app.route('/api/tutors')
def get_tutors():
    tutors = Tutor.query.all()
    return jsonify([{'id': t.id, 'name': t.name} for t in tutors])

@app.route('/api/students')
def get_students():
    students = Student.query.all()
    return jsonify([{'id': s.id, 'name': s.name} for s in students])

@app.route('/api/subjects')
def get_subjects():
    subjects = Subject.query.all()
    return jsonify([{'id': s.id, 'name': s.name} for s in subjects])

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    sessions = Session.query.all()
    results = []
    for s in sessions:
        tutor = Tutor.query.get(s.tutor_id)
        student = Student.query.get(s.student_id)
        subject = Subject.query.get(s.subject_id)
        results.append({
            'id': s.id,
            'tutor_name': tutor.name if tutor else "Unknown",
            'student_name': student.name if student else "Unknown",
            'subject_name': subject.name if subject else "Unknown",
            'date': s.date,
            'duration_minutes': s.duration_minutes,
            'notes': s.notes
        })
    return jsonify(results)

@app.route('/api/sessions', methods=['POST'])
def add_session():
    data = request.json
    new_session = Session(**data)
    db.session.add(new_session)
    db.session.commit()
    return jsonify({'message': 'Session added'})

@app.route('/api/sessions/<int:id>', methods=['PUT'])
def update_session(id):
    data = request.json
    session = Session.query.get(id)
    for key, value in data.items():
        setattr(session, key, value)
    db.session.commit()
    return jsonify({'message': 'Session updated'})

@app.route('/api/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    session = Session.query.get(id)
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Session deleted'})

@app.route('/api/tutors', methods=['POST'])
def add_tutor():
    data = request.json
    new_tutor = Tutor(name=data['name'])
    db.session.add(new_tutor)
    db.session.commit()
    return jsonify({'message': 'Tutor added'}), 201

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    new_student = Student(name=data['name'])
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Student added'}), 201

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    data = request.json
    new_subject = Subject(name=data['name'])
    db.session.add(new_subject)
    db.session.commit()
    return jsonify({'message': 'Subject added'}), 201


# Add the filter route here
@app.route('/api/sessions/filter', methods=['POST'])
def filter_sessions():
    filters = request.json
    query_str = '''
        SELECT * FROM session
        WHERE 1=1
    '''
    params = {}
    if filters.get("tutor_id"):
        query_str += " AND tutor_id = :tutor_id"
        params["tutor_id"] = filters["tutor_id"]
    if filters.get("student_id"):
        query_str += " AND student_id = :student_id"
        params["student_id"] = filters["student_id"]
    if filters.get("min_duration"):
        query_str += " AND duration_minutes >= :min_duration"
        params["min_duration"] = filters["min_duration"]
    if filters.get("max_duration"):
        query_str += " AND duration_minutes <= :max_duration"
        params["max_duration"] = filters["max_duration"]
    if filters.get("start_date"):
        query_str += " AND date >= :start_date"
        params["start_date"] = filters["start_date"]
    if filters.get("end_date"):
        query_str += " AND date <= :end_date"
        params["end_date"] = filters["end_date"]

    query = text(query_str)
    results = db.session.execute(query, params).fetchall()

    output = []
    for row in results:
        tutor = Tutor.query.get(row.tutor_id)
        student = Student.query.get(row.student_id)
        subject = Subject.query.get(row.subject_id)
        output.append({
            'id': row.id,
            'tutor_name': tutor.name if tutor else "Unknown",
            'student_name': student.name if student else "Unknown",
            'subject_name': subject.name if subject else "Unknown",
            'date': row.date,
            'duration_minutes': row.duration_minutes,
            'notes': row.notes
        })

    return jsonify(output)


# === Report Route Using Prepared Statement ===
@app.route('/api/report', methods=['POST'])
def report():
    filters = request.json
    query = text('''
        SELECT 
            COUNT(*) as total_sessions,
            AVG(duration_minutes) as avg_duration,
            SUM(duration_minutes) as total_time
        FROM session
        WHERE (:tutor_id IS NULL OR tutor_id = :tutor_id)
          AND (:subject_id IS NULL OR subject_id = :subject_id)
          AND date BETWEEN :start_date AND :end_date
    ''')
    result = db.session.execute(query, filters).fetchone()
    return jsonify(dict(result))

# === Initialize the DB ===
@app.cli.command('initdb')
def initdb():
    db.drop_all()
    db.create_all()

    # Sample data
    t1 = Tutor(name="Alice Smith")
    s1 = Student(name="John Doe")
    subj1 = Subject(name="Math")
    db.session.add_all([t1, s1, subj1])
    db.session.commit()

    # Add indexes
    db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_sessions_tutor_subject_date ON session(tutor_id, subject_id, date);"))
    db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_sessions_student ON session(student_id);"))
    db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_tutors_name ON tutor(name);"))
    db.session.commit()

    print("Database initialized with sample data and indexes.")

if __name__ == '__main__':
    app.run(debug=True)
