import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // ============================================================
  // LOAD INCIDENT MEMORY
  // ============================================================

  const loadIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/incidents`);
      const data = await response.json();

      if (data.success) {
        setIncidents(data.incidents);
      }
    } catch (err) {
      console.error("Unable to load memory:", err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // ============================================================
  // ANALYZE ERROR
  // ============================================================

  const analyzeError = async () => {
    if (!error.trim()) return;

    setLoading(true);
    setResult(null);
    setFeedback(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error }),
      });

      const data = await response.json();

      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message:
          "Unable to connect to EDA Copilot backend. Make sure FastAPI is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENGINEER FEEDBACK
  // ============================================================

  const sendFeedback = async (success) => {
    if (!result) return;

    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incident_id: result.incident_id,
          error: result.error,
          root_cause: result.diagnosis.root_cause,
          fix: result.recommendation,
          success,
        }),
      });

      setFeedback(
        success
          ? "SUCCESS_RECORDED"
          : "FAILURE_RECORDED"
      );

      await loadIncidents();
    } catch (err) {
      setFeedback("FEEDBACK_ERROR");
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const reset = () => {
    setError("");
    setResult(null);
    setFeedback(null);
  };

  // ============================================================
  // QUICK EDA TESTS
  // ============================================================

  const quickErrors = {
    liberty:
      "OpenSTA cannot find liberty file",

    clock:
      "Clock not found during timing analysis",

    setup:
      "Setup timing violation detected",
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app">

      {/* Background grid */}
      <div className="grid-background"></div>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            ◈
          </div>

          <div>
            <h1>EDA COPILOT</h1>

            <p>
              VLSI ENGINEERING MEMORY SYSTEM
            </p>
          </div>

        </div>


        <div className="header-right">

          <button
            className="history-button"
            onClick={() =>
              setShowHistory(!showHistory)
            }
          >
            🧠 MEMORY [{incidents.length}]
          </button>


          <div className="system-status">

            <span className="status-dot"></span>

            SYSTEM ONLINE

          </div>

        </div>

      </header>


      {/* ======================================================
          MEMORY SIDEBAR
      ====================================================== */}

      {showHistory && (

        <aside className="memory-sidebar">

          <div className="sidebar-header">

            <div>

              <span className="sidebar-title">
                ENGINEERING MEMORY
              </span>

              <span className="sidebar-subtitle">
                STORED INCIDENTS
              </span>

            </div>


            <button
              onClick={() =>
                setShowHistory(false)
              }
              className="close-button"
            >
              ×
            </button>

          </div>


          {incidents.length === 0 ? (

            <div className="empty-memory">

              <div className="empty-icon">
                ?
              </div>

              <p>
                No incidents stored yet.
              </p>

            </div>

          ) : (

            <div className="incident-list">

              {incidents
                .slice()
                .reverse()
                .map((incident) => (

                  <div
                    className="history-card"
                    key={incident.id}
                  >

                    <div className="history-top">

                      <span>
                        {incident.id}
                      </span>

                      <span
                        className={
                          incident.success
                            ? "success-status"
                            : "failed-status"
                        }
                      >
                        {incident.success
                          ? "✓ SUCCESS"
                          : "✕ FAILED"}
                      </span>

                    </div>


                    <p className="history-error">
                      {incident.error}
                    </p>


                    <div className="history-cause">

                      <span>
                        ROOT CAUSE
                      </span>

                      <p>
                        {incident.root_cause}
                      </p>

                    </div>


                    <div className="history-fix">

                      <span>
                        FIX
                      </span>

                      <p>
                        {incident.fix}
                      </p>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </aside>

      )}


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="container">

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="hero">

          <div className="hero-label">
            AI-POWERED EDA DEBUGGING
          </div>


          <h2>

            Debug once.

            <span>
              Remember forever.
            </span>

          </h2>


          <p>
            EDA Copilot analyzes VLSI errors,
            retrieves previous engineering
            solutions, and learns from
            engineer feedback.
          </p>

        </section>


        {/* ====================================================
            ERROR INPUT
        ==================================================== */}

        <section className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-number">
                01
              </span>

              <span className="panel-title">
                ERROR INPUT
              </span>

            </div>


            <span className="terminal-label">
              EDA_TERMINAL
            </span>

          </div>


          {/* ==================================================
              QUICK EDA TEST BUTTONS
          ================================================== */}

          <div className="quick-errors">

            <span className="quick-label">
              QUICK EDA TEST:
            </span>


            <button
              onClick={() =>
                setError(quickErrors.liberty)
              }
            >
              LIBERTY
            </button>


            <button
              onClick={() =>
                setError(quickErrors.clock)
              }
            >
              CLOCK
            </button>


            <button
              onClick={() =>
                setError(quickErrors.setup)
              }
            >
              SETUP
            </button>

          </div>


          {/* ==================================================
              ERROR TEXTAREA
          ================================================== */}

          <textarea
            value={error}
            onChange={(e) =>
              setError(e.target.value)
            }
            placeholder={`Paste your EDA error here...

Example:
OpenSTA: Cannot find liberty file`}
          />


          <div className="input-footer">

            <span>
              {error.length} characters
            </span>


            <button
              className="analyze-button"
              onClick={analyzeError}
              disabled={
                loading ||
                !error.trim()
              }
            >

              {loading ? (

                <>
                  <span className="spinner"></span>
                  ANALYZING...
                </>

              ) : (

                <>
                  ▶ ANALYZE ERROR
                </>

              )}

            </button>

          </div>

        </section>


        {/* ====================================================
            RESULTS
        ==================================================== */}

        {result && result.success && (

          <section className="results">


            {/* ==================================================
                AI DIAGNOSIS
            ================================================== */}

            <div className="panel">

              <div className="panel-header">

                <div>

                  <span className="panel-number">
                    02
                  </span>

                  <span className="panel-title">
                    AI DIAGNOSIS
                  </span>

                </div>


                <span className="ai-badge">
                  AI ANALYZED
                </span>

              </div>


              <div className="diagnosis-content">

                <div className="diagnosis-icon">
                  !
                </div>


                <div>

                  <div className="small-label">
                    PROBABLE ROOT CAUSE
                  </div>


                  <h3>
                    {result.diagnosis.root_cause}
                  </h3>


                  <div className="confidence">

                    CONFIDENCE

                    <strong>
                      {Math.round(
                        result.diagnosis.confidence * 100
                      )}
                      %
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* ==================================================
                ENGINEERING MEMORY
            ================================================== */}

            <div className="panel">

              <div className="panel-header">

                <div>

                  <span className="panel-number">
                    03
                  </span>

                  <span className="panel-title">
                    ENGINEERING MEMORY
                  </span>

                </div>


                {result.memory.found && (

                  <span className="memory-badge">
                    MEMORY FOUND
                  </span>

                )}

              </div>


              {result.memory.found ? (

                <div>

                  <div className="match-score">

                    <div>

                      <span>
                        SIMILARITY MATCH
                      </span>


                      <strong>
                        {Math.round(
                          result.memory.similarity * 100
                        )}
                        %
                      </strong>

                    </div>


                    <div className="progress">

                      <div
                        style={{
                          width: `${
                            result.memory.similarity * 100
                          }%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  <div className="incident-box">

                    <div className="incident-id">

                      {
                        result.memory.previous_incident
                      }

                    </div>


                    <div className="small-label">
                      PREVIOUS INCIDENT
                    </div>


                    <p className="old-error">

                      {
                        result.memory.previous_error
                      }

                    </p>


                    <div className="fix-section">

                      <span className="small-label">
                        SUCCESSFUL FIX
                      </span>


                      <p>

                        ✓{" "}

                        {
                          result.memory.previous_fix
                        }

                      </p>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="no-memory">

                  <div className="no-memory-icon">
                    ?
                  </div>


                  <div>

                    <strong>
                      NO PREVIOUS INCIDENT FOUND
                    </strong>


                    <p>
                      This error can become part
                      of the engineering memory
                      after feedback.
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* ==================================================
                RECOMMENDATION
            ================================================== */}

            <div className="panel">

              <div className="panel-header">

                <div>

                  <span className="panel-number">
                    04
                  </span>

                  <span className="panel-title">
                    RECOMMENDATION
                  </span>

                </div>

              </div>


              <div className="recommendation">

                <span className="recommendation-icon">
                  💡
                </span>


                <p>
                  {result.recommendation}
                </p>

              </div>


              <div className="feedback-area">

                <span>
                  DID THE SOLUTION WORK?
                </span>


                <div className="feedback-buttons">

                  <button
                    className="success-button"
                    onClick={() =>
                      sendFeedback(true)
                    }
                  >
                    ✓ FIX WORKED
                  </button>


                  <button
                    className="failure-button"
                    onClick={() =>
                      sendFeedback(false)
                    }
                  >
                    ✕ FAILED
                  </button>

                </div>

              </div>


              {feedback && (

                <div className="feedback-result">

                  {feedback === "SUCCESS_RECORDED"

                    ? "✓ INCIDENT STORED IN ENGINEERING MEMORY"

                    : feedback === "FAILURE_RECORDED"

                    ? "✕ FAILURE STORED FOR FUTURE LEARNING"

                    : "⚠ UNABLE TO STORE FEEDBACK"}

                </div>

              )}

            </div>


            {/* ==================================================
                RESET
            ================================================== */}

            <button
              className="reset-button"
              onClick={reset}
            >
              ↻ ANALYZE ANOTHER ERROR
            </button>

          </section>

        )}


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {result && !result.success && (

          <div className="error-message">

            ⚠ {result.message}

          </div>

        )}

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>

        <span>
          EDA COPILOT v1.0
        </span>


        <span>
          AI + EDA + PERSISTENT MEMORY
        </span>


        <span>
          ● READY
        </span>

      </footer>

    </div>
  );
}

export default App;
