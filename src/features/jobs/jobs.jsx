import React, { useEffect, useState } from "react";
import "./JobsPage.css";

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");

  // in JobsPage.jsx (replace your fetchJobs with this)
const fetchJobs = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/jobs?search=${encodeURIComponent(search)}&page=1&pageSize=10`);
    const ct = res.headers.get("content-type") || "";

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (ct.includes("application/json")) {
      const data = await res.json();
      setJobs(data.jobs || data);
    } else {
      // got HTML (likely index.html) -> fallback to localStorage
      console.warn("Expected JSON but got HTML. Falling back to localStorage.");
      const saved = localStorage.getItem("mf_jobs_v1");
      setJobs(saved ? JSON.parse(saved) : []);
    }
  } catch (err) {
    console.warn("Fetch jobs failed, using fallback:", err);
    const saved = localStorage.getItem("mf_jobs_v1");
    setJobs(saved ? JSON.parse(saved) : []);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchJobs();
  }, [search]);

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required!");

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          status,
          order: jobs.length + 1,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        })
      });
      setTitle("");
      setTags("");
      setStatus("active");
      fetchJobs();
    } catch (err) {
      console.error("Failed to add job", err);
    }
  };

  return (
    <div className="jobs-container">
      <h2>Jobs</h2>

      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <form onSubmit={handleAddJob} className="add-job-form">
        <input
          type="text"
          placeholder="New job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="job-input"
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="job-input"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="job-select"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <button type="submit" className="add-btn">Add Job</button>
      </form>

      {loading && <p className="loading">Loading jobs...</p>}

      <ul className="jobs-list">
        {jobs.map((job) => (
          <li key={job.id} className="job-card">
            <div>
              <h3 className="job-title">{job.title}</h3>
              <p className="job-tags">
                Tags: {job.tags.length > 0 ? job.tags.join(", ") : "None"}
              </p>
            </div>
            <span className={`job-status ${job.status}`}>{job.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobsPage;
