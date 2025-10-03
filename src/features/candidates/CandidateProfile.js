import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CandidateProfile.css";

function CandidateProfile() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/candidates/${id}/timeline`);
        const data = await res.json();
        setTimeline(data.timeline || []);
      } catch (err) {
        console.error("Failed to fetch timeline", err);
      }
      setLoading(false);
    };
    fetchTimeline();
  }, [id]);

  return (
    <div className="candidate-profile-container">
      <h2>Candidate Timeline</h2>

      {loading && <p className="loading">Loading timeline...</p>}

      {timeline.length === 0 && !loading && <p>No timeline events yet.</p>}

      <ul className="timeline-list">
        {timeline.map((t, idx) => (
          <li key={idx} className="timeline-card">
            <span className={`timeline-stage ${t.stage}`}>{t.stage}</span>
            <span className="timeline-date">
              {new Date(t.date).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CandidateProfile;
