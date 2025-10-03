import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import JobsPage from "./features/jobs/jobs";
import CandidatesPage from "./features/candidates/CandidatesPage";
import CandidateProfile from "./features/candidates/CandidateProfile";
import AssessmentBuilder from "./features/assesments/AssessmentBuilder";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <header className="app-header">
        <h1>TalentFlow</h1>
        <nav>
          <NavLink 
            to="/jobs" 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Jobs
          </NavLink>
          <NavLink 
            to="/candidates" 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Candidates
          </NavLink>
          <NavLink 
            to="/assessments/1" 
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            Assessments
          </NavLink>
        </nav>
      </header>

      {isHome && (
        <section className="hero">
          <div className="hero-content">
            <h2>Streamline Your Hiring Process</h2>
            <p>
              TalentFlow makes it easy for HR teams to manage job postings, 
              track candidates, and create assessments — all in one place.
            </p>
            <NavLink to="/jobs" className="cta-button">Get Started</NavLink>
          </div>
          <div className="hero-illustration">
            {/* You can replace this with an SVG or image */}
            <div className="illustration-box">🌟</div>
          </div>
        </section>
      )}

      <main className="app-main">
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/assessments/:jobId" element={<AssessmentBuilder />} />
        </Routes>
      </main>

      <footer className="app-footer">
        &copy; {new Date().getFullYear()} TalentFlow. All rights reserved.
      </footer>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
