// === Modernized React App for Tutoring Session Manager ===
import { useState, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [filteredCount, setFilteredCount] = useState(null);
  const [averageDuration, setAverageDuration] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    tutor_id: "",
    student_id: "",
    subject_id: "",
    date: "",
    duration_minutes: "",
    notes: ""
  });
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterForm, setFilterForm] = useState({
    tutor_id: "",
    student_id: "",
    min_duration: "",
    max_duration: "",
    start_date: "",
    end_date: ""
  });  
  const [editingId, setEditingId] = useState(null);
  const [tutorName, setTutorName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [reportFilters, setReportFilters] = useState({
    tutor_id: "",
    subject_id: "",
    start_date: "",
    end_date: ""
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchDropdowns();
    fetchSessions();
  }, []);

  const fetchDropdowns = async () => {
    const [tutorsRes, studentsRes, subjectsRes] = await Promise.all([
      axios.get("http://localhost:5050/api/tutors"),
      axios.get("http://localhost:5050/api/students"),
      axios.get("http://localhost:5050/api/subjects")
    ]);
    setTutors(tutorsRes.data);
    setStudents(studentsRes.data);
    setSubjects(subjectsRes.data);
  };

  const fetchSessions = async () => {
    const res = await axios.get("http://localhost:5050/api/sessions");
    setSessions(res.data);
  };

  const handleFilterSessions = async () => {
    const response = await axios.post("http://localhost:5050/api/sessions/filter", {
      tutor_id: filterForm.tutor_id || null,
      student_id: filterForm.student_id || null,
      min_duration: filterForm.min_duration || null,
      max_duration: filterForm.max_duration || null,
      start_date: filterForm.start_date || null,
      end_date: filterForm.end_date || null
    });
  
    const sessions = response.data;
    setSessions(sessions);
    setFilteredCount(sessions.length);
  
    if (sessions.length > 0) {
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
      setAverageDuration((totalDuration / sessions.length).toFixed(2));
    } else {
      setAverageDuration(null);
    }
  };

  const fetchReport = async () => {
    const response = await axios.post("http://localhost:5050/api/report", {
      tutor_id: reportFilters.tutor_id || null,
      subject_id: reportFilters.subject_id || null,
      start_date: reportFilters.start_date || "2000-01-01",
      end_date: reportFilters.end_date || "2100-01-01"
    });
    setReportData(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await axios.put(`http://localhost:5050/api/sessions/${editingId}`, formData);
    } else {
      await axios.post("http://localhost:5050/api/sessions", formData);
    }
    fetchSessions();
    setFormData({ tutor_id: "", student_id: "", subject_id: "", date: "", duration_minutes: "", notes: "" });
    setEditingId(null);
  };

  const handleEdit = (session) => {
    setFormData({
      tutor_id: tutors.find(t => t.name === session.tutor_name)?.id || "",
      student_id: students.find(s => s.name === session.student_name)?.id || "",
      subject_id: subjects.find(s => s.name === session.subject_name)?.id || "",
      date: session.date,
      duration_minutes: session.duration_minutes,
      notes: session.notes
    });
    setEditingId(session.id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5050/api/sessions/${id}`);
    fetchSessions();
  };

  const handleAddTutor = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5050/api/tutors", {
      name: tutorName
    });
    setTutorName("");
    fetchDropdowns();
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5050/api/students", {
      name: studentName
    });
    setStudentName("");
    fetchDropdowns();
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5050/api/subjects", {
      name: subjectName
    });
    setSubjectName("");
    fetchDropdowns();
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto font-sans">
  <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Tutoring Session Manager</h1>

  <div className="flex flex-col md:flex-row gap-8">
    {/* Left Column */}
    <div className="md:w-1/2 pl-8">
      <h2 className="text-xl font-semibold mb-2 text-slate-700">Add Session</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mb-8">
        <select value={formData.tutor_id} onChange={e => setFormData({ ...formData, tutor_id: e.target.value })} required className="border rounded px-3 py-2">
          <option value="">Select Tutor</option>
          {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} required className="border rounded px-3 py-2">
          <option value="">Select Student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={formData.subject_id} onChange={e => setFormData({ ...formData, subject_id: e.target.value })} required className="border rounded px-3 py-2">
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="border rounded px-3 py-2" />
        <input type="number" placeholder="Duration (minutes)" value={formData.duration_minutes} onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })} required className="border rounded px-3 py-2" />
        <input type="text" placeholder="Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">
          {editingId ? "Update Session" : "Add Session"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2 text-slate-700">Filter Sessions</h2>
      <div className="flex flex-wrap gap-2 mb-3">
        <select value={filterForm.tutor_id} onChange={e => setFilterForm({ ...filterForm, tutor_id: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All Tutors</option>
          {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filterForm.student_id} onChange={e => setFilterForm({ ...filterForm, student_id: e.target.value })} className="border px-3 py-2 rounded">
          <option value="">All Students</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="number" placeholder="Min Duration" value={filterForm.min_duration} onChange={e => setFilterForm({ ...filterForm, min_duration: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="number" placeholder="Max Duration" value={filterForm.max_duration} onChange={e => setFilterForm({ ...filterForm, max_duration: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="date" value={filterForm.start_date} onChange={e => setFilterForm({ ...filterForm, start_date: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="date" value={filterForm.end_date} onChange={e => setFilterForm({ ...filterForm, end_date: e.target.value })} className="border px-3 py-2 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleFilterSessions} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded">
          Filter Sessions
        </button>
        <button
          onClick={() => {
            setFilterForm({
              tutor_id: "",
              student_id: "",
              min_duration: "",
              max_duration: "",
              start_date: "",
              end_date: ""
            });
            setFilteredCount(null);
            setAverageDuration(null);
            fetchSessions();
          }}
          className="text-sm text-blue-700 underline"
        >
          Reset Filters
        </button>
      </div>

      {filteredCount !== null && (
        <div className="mt-4 bg-gray-100 border p-3 rounded text-slate-700">
          <p><strong>Total:</strong> {filteredCount} entr{filteredCount === 1 ? "y" : "ies"} matched your filter</p>
          {averageDuration !== null && (
            <p><strong>Average Duration:</strong> {averageDuration} minutes</p>
          )}
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2 text-slate-700">Add New Tutor</h2>
        <form onSubmit={handleAddTutor} className="flex gap-2 mb-4">
          <input type="text" placeholder="Tutor Name" value={tutorName} onChange={e => setTutorName(e.target.value)} required className="border rounded px-3 py-2 w-full" />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add</button>
        </form>

        <h2 className="text-xl font-semibold mb-2 text-slate-700">Add New Student</h2>
        <form onSubmit={handleAddStudent} className="flex gap-2 mb-4">
          <input type="text" placeholder="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} required className="border rounded px-3 py-2 w-full" />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">Add</button>
        </form>

        <h2 className="text-xl font-semibold mb-2 text-slate-700">Add New Subject</h2>
        <form onSubmit={handleAddSubject} className="flex gap-2">
          <input type="text" placeholder="Subject Name" value={subjectName} onChange={e => setSubjectName(e.target.value)} required className="border rounded px-3 py-2 w-full" />
          <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded">Add</button>
        </form>
      </div>
    </div>

    {/* Right Column */}
    <div className="md:w-1/2">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">All Sessions</h2>
      <div className="space-y-4">
        {sessions.map(s => (
          <div key={s.id} className="p-4 border rounded shadow-sm bg-white">
            <p><strong>Tutor:</strong> {s.tutor_name} — <strong>Student:</strong> {s.student_name} — <strong>Subject:</strong> {s.subject_name}</p>
            <p><strong>Date:</strong> {s.date} — <strong>Duration:</strong> {s.duration_minutes} mins</p>
            <p className="italic text-slate-600">{s.notes}</p>
            <div className="mt-2 space-x-3">
              <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
  );
}
