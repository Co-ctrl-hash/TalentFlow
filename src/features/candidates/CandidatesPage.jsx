import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CandidatesPage.css";

function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("applied");

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candidates?search=${search}&page=1&pageSize=20`);
      const data = await res.json();
      setCandidates(data.data || data.candidates || []);
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return alert("Name and Email required!");

    const newCandidate = {
      id: Date.now(),
      name,
      email,
      stage,
    };

    try {
      await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCandidate),
      });

      setCandidates((prev) => [newCandidate, ...prev]);
    } catch (err) {
      console.error("Failed to add candidate", err);
    }

    setName("");
    setEmail("");
    setStage("applied");
  };

  return (
    <div className="candidates-container">
      <h2>Candidates</h2>

      <input
        type="text"
        placeholder="Search by name/email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <form onSubmit={handleAddCandidate} className="add-form">
        <input
          type="text"
          placeholder="Candidate Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Candidate Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="applied">Applied</option>
          <option value="screen">Screen</option>
          <option value="tech">Tech</option>
          <option value="offer">Offer</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit">Add Candidate</button>
      </form>

      {loading && <p className="loading">Loading candidates...</p>}

      <ul className="candidates-list">
        {candidates.map((c) => (
          <li key={c.id} className="candidate-card">
            <Link to={`/candidates/${c.id}`} className="candidate-link">
              <div>
                <h3 className="candidate-name">{c.name}</h3>
                <p className="candidate-email">{c.email}</p>
              </div>
              <span className={`candidate-stage ${c.stage}`}>{c.stage}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CandidatesPage;
