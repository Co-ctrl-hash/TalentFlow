import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./AssessmentBuilder.css";

const QUESTION_TYPES = [
  "short-text",
  "long-text",
  "single-choice",
  "multi-choice",
  "numeric",
  "file"
];

function AssessmentBuilder() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState({ sections: [] });
  const [sectionTitle, setSectionTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments/${jobId}`);
        const data = await res.json();
        setAssessment(data || { sections: [] });
      } catch (err) {
        console.error("Failed to fetch assessment", err);
      }
      setLoading(false);
    };
    fetchAssessment();
  }, [jobId]);

  const addSection = () => {
    if (!sectionTitle.trim()) return alert("Section title required!");
    setAssessment({
      ...assessment,
      sections: [...assessment.sections, { title: sectionTitle, questions: [] }]
    });
    setSectionTitle("");
  };

  const addQuestion = (sectionIndex, label, type) => {
    if (!label.trim()) return alert("Question text required!");
    if (!QUESTION_TYPES.includes(type)) return alert("Invalid type");

    const newSections = [...assessment.sections];
    newSections[sectionIndex].questions.push({ label, type });
    setAssessment({ ...assessment, sections: newSections });
  };

  const saveAssessment = async () => {
    try {
      await fetch(`/api/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment)
      });
      alert("Assessment saved!");
    } catch (err) {
      console.error("Failed to save assessment", err);
    }
  };

  return (
    <div className="assessment-container">
      <h2>Assessment Builder</h2>
      {loading && <p className="loading">Loading assessment...</p>}

      <div className="add-section">
        <input
          type="text"
          placeholder="New section title"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          className="section-input"
        />
        <button onClick={addSection} className="btn">Add Section</button>
        <button onClick={saveAssessment} className="btn save-btn">Save Assessment</button>
      </div>

      <div className="sections-list">
        {assessment.sections.map((sec, i) => (
          <div key={i} className="section-card">
            <h3>{sec.title}</h3>
            <AddQuestionForm onAdd={(label, type) => addQuestion(i, label, type)} />

            {sec.questions.length === 0 && <p className="no-questions">No questions yet.</p>}
            <ul>
              {sec.questions.map((q, j) => (
                <li key={j}>
                  {q.label} <span className="question-type">({q.type})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddQuestionForm({ onAdd }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("short-text");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(label, type);
    setLabel("");
    setType("short-text");
  };

  return (
    <form className="add-question-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Question text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {QUESTION_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button type="submit" className="btn add-question-btn">+ Add Question</button>
    </form>
  );
}

export default AssessmentBuilder;
