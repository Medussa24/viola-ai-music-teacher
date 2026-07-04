import { CheckCircle2, ClipboardList, MessageSquareText, Save, Target, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import type { TeacherDashboardStudent } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { Button } from "../../shared/ui/Button";
import { Metric } from "../../shared/ui/Metric";
import { PageHeader } from "../../shared/ui/PageHeader";

type TeacherDashboardPageProps = {
  musicTeacherService: MusicTeacherService;
};

export function TeacherDashboardPage({ musicTeacherService }: TeacherDashboardPageProps) {
  const [students, setStudents] = useState<TeacherDashboardStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [savedFeedbackStudentId, setSavedFeedbackStudentId] = useState<string | null>(null);

  useEffect(() => {
    void musicTeacherService.getTeacherDashboardStudents().then((nextStudents) => {
      setStudents(nextStudents);
      setSelectedStudentId((currentStudentId) => currentStudentId ?? nextStudents[0]?.id ?? null);
    });
  }, [musicTeacherService]);

  const student = students.find((nextStudent) => nextStudent.id === selectedStudentId) ?? students[0];
  const reviewQueue = students.filter((nextStudent) => nextStudent.reviewStatus !== "reviewed");

  useEffect(() => {
    setFeedbackDraft(student?.teacherNotes.join("\n") ?? "");
    setSavedFeedbackStudentId(null);
  }, [student?.id, student?.teacherNotes]);

  if (!student) {
    return <div className="loading">Loading teacher dashboard...</div>;
  }

  const reviewLabel = {
    ready: "Ready",
    "needs-review": "Needs review",
    reviewed: "Reviewed",
  }[student.reviewStatus];

  function handleSaveFeedback() {
    setSavedFeedbackStudentId(student.id);
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Teacher demo" title="Review dashboard">
        <div className="header-badge">
          <ClipboardList size={18} />
          {students.length} students
        </div>
      </PageHeader>

      <section className="teacher-roster-panel">
        <div className="section-heading">
          <h2>Student Roster</h2>
          <span className="soft-count">Frontend demo data</span>
        </div>
        <div className="teacher-roster">
          {students.map((nextStudent) => {
            const isSelected = nextStudent.id === student.id;

            return (
              <button
                className={isSelected ? "student-roster-item active" : "student-roster-item"}
                key={nextStudent.id}
                type="button"
                onClick={() => setSelectedStudentId(nextStudent.id)}
              >
                <span>{nextStudent.studentName}</span>
                <small className={`review-pill ${nextStudent.reviewStatus}`}>
                  {{
                    ready: "Ready",
                    "needs-review": "Needs review",
                    reviewed: "Reviewed",
                  }[nextStudent.reviewStatus]}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="teacher-hero">
        <div>
          <p className="eyebrow">Student</p>
          <h2>{student.studentName}</h2>
          <p>{student.assignedPracticePlan}</p>
          <small className={`review-pill ${student.reviewStatus}`}>{reviewLabel}</small>
        </div>
        <div className="teacher-focus">
          <Target size={20} />
          <span>Next focus</span>
          <strong>{student.nextFocusArea}</strong>
        </div>
      </section>

      <section className="metric-grid">
        <Metric label="Weekly practice" value={`${student.weeklyPracticeMinutes} min`} detail="Logged this week" />
        <Metric label="Completed" value={`${student.completedExercises.length}`} detail="Assigned exercises" />
        <Metric label="Plan" value="Active" detail="Practice plan status" />
        <Metric label="Review" value={reviewLabel} detail="Current review status" />
      </section>

      <section className="teacher-grid">
        <div className="panel">
          <div className="section-heading">
            <h2>Review Queue</h2>
            <ClipboardList size={18} />
          </div>
          <div className="review-queue">
            {reviewQueue.map((queuedStudent) => (
              <button
                className={queuedStudent.id === student.id ? "review-queue-item active" : "review-queue-item"}
                key={queuedStudent.id}
                type="button"
                onClick={() => setSelectedStudentId(queuedStudent.id)}
              >
                <span>{queuedStudent.studentName}</span>
                <small className={`review-pill ${queuedStudent.reviewStatus}`}>
                  {queuedStudent.reviewStatus === "needs-review" ? "Needs review" : "Ready"}
                </small>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <h2>Completed Exercises</h2>
            <Timer size={18} />
          </div>
          <div className="teacher-list">
            {student.completedExercises.map((exercise) => (
              <p key={exercise}>{exercise}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="teacher-grid wide">
        <div className="panel">
          <div className="section-heading">
            <h2>Recent Session Summary</h2>
            <MessageSquareText size={18} />
          </div>
          <p className="teacher-summary">{student.recentSessionSummary}</p>
        </div>

        <div className="panel">
          <div className="section-heading">
            <h2>Feedback Draft</h2>
            <CheckCircle2 size={18} />
          </div>
          <textarea
            className="feedback-box"
            value={feedbackDraft}
            onChange={(event) => {
              setFeedbackDraft(event.target.value);
              setSavedFeedbackStudentId(null);
            }}
            aria-label={`Feedback draft for ${student.studentName}`}
          />
          <div className="feedback-actions">
            <Button onClick={handleSaveFeedback}>
              <Save size={18} />
              Save Feedback
            </Button>
            {savedFeedbackStudentId === student.id ? (
              <span className="saved-confirmation">Feedback saved for this demo session.</span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>Teacher Notes</h2>
        <div className="teacher-note-grid">
          {student.teacherNotes.map((note) => (
            <article className="teacher-note" key={note}>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
