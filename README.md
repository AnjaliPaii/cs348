# How to Run the Tutoring Session Manager App

This guide explains how to set up and run both the **Flask backend** and **React frontend** for the Tutoring Session Manager project.

---

## Backend Setup (Flask + SQLite)

1. **Create and activate a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the database**
   ```bash
   export FLASK_APP=backend.py
   flask initdb
   ```

4. **Run the Flask backend**
   ```bash
   flask --app backend run --port 5050
   ```
   The backend will be available at: `http://localhost:5050`

---

## Frontend Setup (React)

1. **In a new terminal, go into the frontend directory**
   ```bash
   cd 348webapp
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Run the React frontend**
   ```bash
   npm run dev
   ```

4. **Click the local link (usually)**
   ```
   http://localhost:5173
   ```

---

Make sure the backend is running before starting the frontend so that API calls from React work correctly.
