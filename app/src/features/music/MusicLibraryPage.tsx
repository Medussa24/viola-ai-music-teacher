import {
  BookOpenCheck,
  Clock3,
  FileMusic,
  Mic,
  Pause,
  Play,
  Search,
  SlidersHorizontal,
  Square,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ScoreNote, ScoreSheet, ScoreSheetStatus } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { Button } from "../../shared/ui/Button";
import { Metric } from "../../shared/ui/Metric";
import { PageHeader } from "../../shared/ui/PageHeader";

type MusicLibraryPageProps = {
  musicTeacherService: MusicTeacherService;
};

const statusLabels: Record<ScoreSheetStatus, string> = {
  new: "New",
  learning: "Learning",
  polishing: "Polishing",
  "performance-ready": "Performance ready",
  draft: "Draft",
  needs_review: "Needs review",
};

type ImportKind = "structured" | "visual" | "midi";

type PendingImport = {
  file: File;
  kind: ImportKind;
  message: string;
};

const durationBeats: Record<ScoreNote["duration"], number> = {
  eighth: 0.5,
  quarter: 1,
  half: 2,
  "dotted-half": 3,
  whole: 4,
};

const bowingLabels: Record<NonNullable<ScoreNote["bowing"]>, string> = {
  "down-bow": "Down bow",
  "up-bow": "Up bow",
  slur: "Slur",
  pizzicato: "Pizzicato",
};

export function MusicLibraryPage({ musicTeacherService }: MusicLibraryPageProps) {
  const [scoreSheets, setScoreSheets] = useState<ScoreSheet[]>([]);
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScoreSheetStatus | "all">("all");
  const [isScoreViewerOpen, setIsScoreViewerOpen] = useState(false);
  const [playbackState, setPlaybackState] = useState<"stopped" | "playing" | "paused">("stopped");
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importStatus, setImportStatus] = useState("Waiting for file");

  useEffect(() => {
    void musicTeacherService.getScoreSheets().then((nextScoreSheets) => {
      setScoreSheets(nextScoreSheets);
      setSelectedScoreId((currentScoreId) => currentScoreId ?? nextScoreSheets[0]?.id ?? null);
    });
  }, [musicTeacherService]);

  const filteredScores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scoreSheets.filter((score) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        score.title.toLowerCase().includes(normalizedQuery) ||
        score.composer.toLowerCase().includes(normalizedQuery) ||
        score.keySignature.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || score.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, scoreSheets, statusFilter]);

  const selectedScore =
    filteredScores.find((score) => score.id === selectedScoreId) ??
    scoreSheets.find((score) => score.id === selectedScoreId) ??
    filteredScores[0] ??
    scoreSheets[0];

  useEffect(() => {
    setPlaybackState("stopped");
    setCurrentNoteIndex(0);
  }, [selectedScore?.id]);

  useEffect(() => {
    if (!selectedScore || playbackState !== "playing") {
      return;
    }

    const currentNote = selectedScore.notes[currentNoteIndex];
    const millisecondsPerBeat = 60000 / selectedScore.tempoBpm;
    const timeout = window.setTimeout(() => {
      if (currentNoteIndex >= selectedScore.notes.length - 1) {
        setPlaybackState("stopped");
        return;
      }

      setCurrentNoteIndex((nextIndex) => nextIndex + 1);
    }, millisecondsPerBeat * durationBeats[currentNote.duration]);

    return () => window.clearTimeout(timeout);
  }, [currentNoteIndex, playbackState, selectedScore]);

  if (!selectedScore) {
    return <div className="loading">Loading music library...</div>;
  }

  const totalPracticeMinutes = scoreSheets.reduce((total, score) => total + score.practiceMinutes, 0);
  const readyCount = scoreSheets.filter((score) => score.status === "performance-ready").length;
  const currentNote = selectedScore.notes[currentNoteIndex];
  const currentMeasure = currentNote?.measure ?? selectedScore.notes[0]?.measure ?? 1;
  const notesByMeasure = selectedScore.notes.reduce<Record<number, ScoreNote[]>>((measures, note) => {
    measures[note.measure] = [...(measures[note.measure] ?? []), note];
    return measures;
  }, {});

  function handlePlayAlong() {
    if (currentNoteIndex >= selectedScore.notes.length - 1 && playbackState === "stopped") {
      setCurrentNoteIndex(0);
    }

    setIsScoreViewerOpen(true);
    setPlaybackState("playing");
  }

  function handlePause() {
    setPlaybackState("paused");
  }

  function handleStop() {
    setPlaybackState("stopped");
    setCurrentNoteIndex(0);
  }

  function getImportKind(fileName: string): ImportKind {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension === "musicxml" || extension === "xml" || extension === "mxl") {
      return "structured";
    }

    if (extension === "mid" || extension === "midi") {
      return "midi";
    }

    return "visual";
  }

  function getImportMessage(kind: ImportKind) {
    if (kind === "structured") {
      return "Structured score format detected. Real parsing will be added later.";
    }

    if (kind === "midi") {
      return "MIDI import detected. Note extraction will be added later.";
    }

    return "Visual score detected. Optical music recognition will be added later.";
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    const kind = getImportKind(file.name);
    setPendingImport({
      file,
      kind,
      message: getImportMessage(kind),
    });
    setImportStatus("Ready to import");
  }

  function handleImportScore() {
    if (!pendingImport) {
      return;
    }

    const importedTitle = pendingImport.file.name.replace(/\.[^.]+$/, "");
    const importedScore: ScoreSheet = {
      id: `imported-${Date.now()}`,
      title: importedTitle || "Imported score",
      composer: "Imported file",
      level: "beginner",
      keySignature: "Unknown",
      timeSignature: "4/4",
      tempoMarking: "Quarter = 72",
      tempoBpm: 72,
      source: "imported",
      status: pendingImport.kind === "visual" ? "needs_review" : "draft",
      assignedFocus: ["Review imported notation", "Confirm rhythm values", "Check bowing markings"],
      lastPracticedLabel: "Imported today",
      practiceMinutes: 0,
      measuresToReview: "Imported draft",
      teacherNote: pendingImport.message,
      notes: [
        { id: "import-1-1", measure: 1, pitch: "D", duration: "quarter", octave: 4, stringName: "D" },
        { id: "import-1-2", measure: 1, pitch: "Rest", duration: "quarter" },
        { id: "import-1-3", measure: 1, pitch: "F#", duration: "quarter", octave: 4, stringName: "D" },
        { id: "import-1-4", measure: 1, pitch: "A", duration: "quarter", octave: 4, bowing: "up-bow", stringName: "A" },
      ],
    };

    setScoreSheets((currentScores) => [importedScore, ...currentScores]);
    setSelectedScoreId(importedScore.id);
    setIsScoreViewerOpen(true);
    setImportStatus("Imported as editable draft");
    setPendingImport(null);
    setIsImportPanelOpen(false);
  }

  function handleCancelImport() {
    setPendingImport(null);
    setImportStatus("Waiting for file");
    setIsImportPanelOpen(false);
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="My Music" title="Score-sheet library">
        <div className="header-actions">
          <Button onClick={() => setIsImportPanelOpen(true)}>
            <Upload size={18} />
            Upload Score Sheet
          </Button>
          <div className="header-badge">
            <FileMusic size={18} />
            {scoreSheets.length} scores
          </div>
        </div>
      </PageHeader>

      {isImportPanelOpen ? (
        <section className="import-panel">
          <div className="section-heading">
            <div>
              <h2>Upload Score Sheet</h2>
              <p>Import a file into My Music as a local frontend demo draft.</p>
            </div>
            <button className="icon-text-button" type="button" onClick={handleCancelImport}>
              <X size={16} />
              Cancel
            </button>
          </div>
          <label className="upload-dropzone">
            <Upload size={22} />
            <span>Choose MusicXML, MIDI, PDF, or image score</span>
            <input
              accept=".musicxml,.xml,.mxl,.mid,.midi,.pdf,.png,.jpg,.jpeg"
              type="file"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
          </label>
          <div className="import-metadata">
            <div>
              <span>File name</span>
              <strong>{pendingImport?.file.name ?? "No file selected"}</strong>
            </div>
            <div>
              <span>File type</span>
              <strong>{pendingImport?.file.type || pendingImport?.file.name.split(".").pop() || "None"}</strong>
            </div>
            <div>
              <span>File size</span>
              <strong>{pendingImport ? formatFileSize(pendingImport.file.size) : "None"}</strong>
            </div>
            <div>
              <span>Import status</span>
              <strong>{importStatus}</strong>
            </div>
          </div>
          {pendingImport ? <p className="import-message">{pendingImport.message}</p> : null}
          <div className="import-actions">
            <Button disabled={!pendingImport} onClick={handleImportScore}>
              Import Score
            </Button>
            <Button variant="secondary" onClick={handleCancelImport}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      <section className="metric-grid">
        <Metric label="Library" value={`${scoreSheets.length}`} detail="Assigned scores" />
        <Metric label="Practice" value={`${totalPracticeMinutes} min`} detail="Logged by score" />
        <Metric label="Ready" value={`${readyCount}`} detail="Performance set" />
        <Metric label="Focus" value={selectedScore.measuresToReview} detail="Selected score" />
      </section>

      <section className="music-workspace">
        <div className="music-library-panel">
          <div className="library-toolbar">
            <label className="search-field">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, composer, or key"
                aria-label="Search score sheets"
              />
            </label>
            <label className="filter-field">
              <SlidersHorizontal size={18} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ScoreSheetStatus | "all")}
                aria-label="Filter score status"
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="learning">Learning</option>
                <option value="polishing">Polishing</option>
                <option value="performance-ready">Performance ready</option>
                <option value="draft">Draft</option>
                <option value="needs_review">Needs review</option>
              </select>
            </label>
          </div>

          <div className="score-table" role="table" aria-label="Score sheet library">
            <div className="score-table-header" role="row">
              <span>Score</span>
              <span>Key</span>
              <span>Status</span>
              <span>Practice</span>
            </div>
            {filteredScores.map((score) => {
              const isSelected = selectedScore.id === score.id;

              return (
                <button
                  className={isSelected ? "score-row active" : "score-row"}
                  key={score.id}
                  type="button"
                  onClick={() => setSelectedScoreId(score.id)}
                  role="row"
                >
                  <span>
                    <strong>{score.title}</strong>
                    <small>{score.composer}</small>
                  </span>
                  <span>{score.keySignature}</span>
                  <span className={`score-status ${score.status}`}>{statusLabels[score.status]}</span>
                  <span>
                    {score.practiceMinutes}m
                    <small>{score.source === "imported" ? "Imported" : "Assigned"}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="score-detail-panel" aria-label="Selected score details">
          <div className="score-detail-header">
            <span className={`score-status ${selectedScore.status}`}>{statusLabels[selectedScore.status]}</span>
            <h2>{selectedScore.title}</h2>
            <p>{selectedScore.composer}</p>
            <small className="score-source">{selectedScore.source.replace("_", " ")}</small>
          </div>

          <div className="score-meta-grid">
            <div>
              <span>Level</span>
              <strong>{selectedScore.level}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{selectedScore.timeSignature}</strong>
            </div>
            <div>
              <span>Tempo</span>
              <strong>{selectedScore.tempoMarking}</strong>
            </div>
            <div>
              <span>Last practiced</span>
              <strong>{selectedScore.lastPracticedLabel}</strong>
            </div>
          </div>

          <div className="score-review-block">
            <div>
              <Clock3 size={18} />
              <span>Measures to review</span>
            </div>
            <strong>{selectedScore.measuresToReview}</strong>
          </div>

          <div className="score-focus-list">
            <div className="section-heading">
              <h3>Assigned Focus</h3>
              <BookOpenCheck size={18} />
            </div>
            {selectedScore.assignedFocus.map((focus) => (
              <p key={focus}>{focus}</p>
            ))}
          </div>

          <div className="score-teacher-note">
            <span>Teacher note</span>
            <p>{selectedScore.teacherNote}</p>
          </div>

          <div className="score-actions">
            <Button onClick={() => setIsScoreViewerOpen(true)}>Open Score</Button>
            <Button variant="secondary">Add to Practice</Button>
          </div>
        </aside>
      </section>

      {isScoreViewerOpen ? (
        <section className="score-viewer-panel">
          <div className="score-viewer-header">
            <div>
              <p className="eyebrow">Score viewer</p>
              <h2>{selectedScore.title}</h2>
              <p>
                Measure {currentMeasure} - Note {Math.min(currentNoteIndex + 1, selectedScore.notes.length)} of{" "}
                {selectedScore.notes.length}
              </p>
            </div>
            <div className="playback-controls" aria-label="Play along controls">
              <Button onClick={handlePlayAlong}>
                <Play size={18} />
                Play Along
              </Button>
              <Button variant="secondary" onClick={handlePause} disabled={playbackState !== "playing"}>
                <Pause size={18} />
                Pause
              </Button>
              <Button variant="ghost" onClick={handleStop}>
                <Square size={18} />
                Stop
              </Button>
            </div>
          </div>

          <div className="score-now-playing">
            <span>{playbackState === "playing" ? "Playing" : playbackState === "paused" ? "Paused" : "Stopped"}</span>
            <strong>{currentNote ? `${currentNote.pitch}${currentNote.octave ?? ""}` : "Ready"}</strong>
            <small>{selectedScore.tempoBpm} BPM</small>
          </div>

          <div className="mock-score-grid" aria-label="Mock score note grid">
            {Object.entries(notesByMeasure).map(([measure, notes]) => (
              <article className="measure-group" key={measure}>
                <h3>Measure {measure}</h3>
                <div className="measure-notes">
                  {notes.map((note) => {
                    const absoluteIndex = selectedScore.notes.findIndex((scoreNote) => scoreNote.id === note.id);
                    const isActive = absoluteIndex === currentNoteIndex;

                    return (
                      <div className={isActive ? "score-note active" : "score-note"} key={note.id}>
                        <strong>{note.pitch}</strong>
                        <span>{note.duration}</span>
                        <small>{note.octave ? `Octave ${note.octave}` : "Rest"}</small>
                        <small>{note.articulation ?? "No articulation"}</small>
                        <small>{note.bowing ? bowingLabels[note.bowing] : "Separate bow"}</small>
                        <small>{note.stringName ? `${note.stringName} string` : "No string"}</small>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="record-to-score-panel">
            <div>
              <Mic size={20} />
              <h3>Record to Score</h3>
            </div>
            <p>
              Record to Score will later listen to your playing and draft editable sheet music with notes, rests,
              rhythm, octave, bowing, slurs, pizzicato, vibrato, and other markings.
            </p>
          </div>
        </section>
      ) : null}
    </section>
  );
}
