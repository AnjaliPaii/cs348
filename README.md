Set up venv
python3 -m venv venv
source venv/bin/activate

Install reqs
pip install -r requirements.txt

Initialize db
export FLASK_APP=backend.py
flask initdb

Run backend
flask --app backend run --port 5050

Run frontend
Set up venv
python3 -m venv venv
source venv/bin/activate

Install reqs
pip install -r requirements.txt

Go into frontend directory
cd 248webapp

Run frontend
npm install
npm run dev

Click the link
