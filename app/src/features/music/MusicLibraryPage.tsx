import {
  AudioLines,
  BookOpenCheck,
  Clock3,
  FilePlus2,
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
import type { MusicClef, MusicMaterialType, MusicSheet, MusicSheetStatus, ScoreNote } from "../../core/domain";
import { useAudioRecorder } from "../../services/audio/useAudioRecorder";
import type { MusicTeacherService } from "../../services/contracts";
import { Button } from "../../shared/ui/Button";
import { Metric } from "../../shared/ui/Metric";
import { PageHeader } from "../../shared/ui/PageHeader";

type MusicLibraryPageProps = {
  musicTeacherService: MusicTeacherService;
};

const statusLabels: Record<MusicSheetStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  needs_review: "Needs review",
  reviewed: "Reviewed",
};

const materialTypeLabels: Record<MusicMaterialType, string> = {
  score_sheet: "Score sheet",
  tuning_exercise: "Tuning exercise",
  warmup: "Warmup",
  key_change_drill: "Key-change drill",
  rhythm_drill: "Rhythm drill",
  bowing_exercise: "Bowing exercise",
  original_composition: "Original composition",
};

type ImportKind = "structured" | "visual" | "midi";

type PendingImport = {
  file: File;
  kind: ImportKind;
  message: string;
};

type SheetDraftForm = {
  title: string;
  composer: string;
  instrument: MusicSheet["instrument"];
  clef: MusicClef;
  keySignature: string;
  timeSignature: string;
  tempoBpm: number;
};

const defaultSheetDraftForm: SheetDraftForm = {
  title: "Untitled Viola Sheet",
  composer: "",
  instrument: "viola",
  clef: "alto",
  keySignature: "C major",
  timeSignature: "4/4",
  tempoBpm: 72,
};

const durationBeats: Record<ScoreNote["duration"], number> = {
  sixteenth: 0.25,
  eighth: 0.5,
  quarter: 1,
  half: 2,
  whole: 4,
};

const bowingLabels: Record<NonNullable<ScoreNote["bowing"]>, string> = {
  down_bow: "Down bow",
  up_bow: "Up bow",
  none: "No bowing",
};

export function MusicLibraryPage({ musicTeacherService }: MusicLibraryPageProps) {
  const [scoreSheets, setScoreSheets] = useState<MusicSheet[]>([]);
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MusicSheetStatus | "all">("all");
  const [practiceQueueAdditions, setPracticeQueueAdditions] = useState<MusicSheet[]>([]);
  const [practiceQueueMessage, setPracticeQueueMessage] = useState("");
  const [isScoreViewerOpen, setIsScoreViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sheetDraftForm, setSheetDraftForm] = useState<SheetDraftForm>(defaultSheetDraftForm);
  const [playbackState, setPlaybackState] = useState<"stopped" | "playing" | "paused">("stopped");
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);
  const [isRecordToScoreOpen, setIsRecordToScoreOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importStatus, setImportStatus] = useState("Waiting for file");
  const scoreRecorder = useAudioRecorder();

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
        (score.composer?.toLowerCase().includes(normalizedQuery) ?? false) ||
        score.keySignature.toLowerCase().includes(normalizedQuery) ||
        materialTypeLabels[score.materialType].toLowerCase().includes(normalizedQuery);
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

  const importedCount = scoreSheets.filter((score) => score.source === "imported").length;
  const readyCount = scoreSheets.filter((score) => score.status === "ready" || score.status === "reviewed").length;
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
    const today = new Date().toISOString().slice(0, 10);
    const importedScore: MusicSheet = {
      id: `imported-${Date.now()}`,
      title: importedTitle || "Imported score",
      composer: "Imported file",
      materialType: "score_sheet",
      instrument: "viola",
      clef: "alto",
      keySignature: "Unknown",
      timeSignature: "4/4",
      tempoBpm: 72,
      source: "imported",
      status: pendingImport.kind === "visual" ? "needs_review" : "draft",
      createdAt: today,
      updatedAt: today,
      notes: [
        { id: "import-1-1", measure: 1, beat: 1, pitch: "D", duration: "quarter", octave: 4, isRest: false, stringName: "D", articulation: "none", bowing: "none" },
        { id: "import-1-2", measure: 1, beat: 2, duration: "quarter", isRest: true, articulation: "none", bowing: "none" },
        { id: "import-1-3", measure: 1, beat: 3, pitch: "F#", duration: "quarter", octave: 4, isRest: false, stringName: "D", articulation: "tenuto", bowing: "down_bow" },
        { id: "import-1-4", measure: 1, beat: 4, pitch: "A", duration: "quarter", octave: 4, isRest: false, bowing: "up_bow", stringName: "A", articulation: "none" },
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

  function handleCreateNewSheet() {
    setSheetDraftForm(defaultSheetDraftForm);
    setIsEditorOpen(true);
  }

  function updateSheetDraftForm<Key extends keyof SheetDraftForm>(key: Key, value: SheetDraftForm[Key]) {
    setSheetDraftForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function handleSaveDraftSheet() {
    const today = new Date().toISOString().slice(0, 10);
    const manualSheet: MusicSheet = {
      id: `manual-${Date.now()}`,
      title: sheetDraftForm.title.trim() || "Untitled Viola Sheet",
      composer: sheetDraftForm.composer.trim() || undefined,
      materialType: "score_sheet",
      instrument: sheetDraftForm.instrument,
      clef: sheetDraftForm.clef,
      keySignature: sheetDraftForm.keySignature.trim() || "C major",
      timeSignature: sheetDraftForm.timeSignature.trim() || "4/4",
      tempoBpm: Math.max(30, Math.min(220, Number(sheetDraftForm.tempoBpm) || 72)),
      source: "manual",
      status: "draft",
      createdAt: today,
      updatedAt: today,
      notes: [
        { id: "manual-1-1", measure: 1, beat: 1, duration: "quarter", isRest: true, articulation: "none", bowing: "none" },
        { id: "manual-1-2", measure: 1, beat: 2, duration: "quarter", isRest: true, articulation: "none", bowing: "none" },
        { id: "manual-1-3", measure: 1, beat: 3, duration: "quarter", isRest: true, articulation: "none", bowing: "none" },
        { id: "manual-1-4", measure: 1, beat: 4, duration: "quarter", isRest: true, articulation: "none", bowing: "none" },
      ],
    };

    setScoreSheets((currentScores) => [manualSheet, ...currentScores]);
    setSelectedScoreId(manualSheet.id);
    setIsScoreViewerOpen(true);
    setIsEditorOpen(false);
  }

  function handleAddToPractice() {
    setPracticeQueueAdditions((currentItems) => {
      if (currentItems.some((item) => item.id === selectedScore.id)) {
        return currentItems;
      }

      return [...currentItems, selectedScore];
    });
    setPracticeQueueMessage(`${selectedScore.title} added to today's local practice queue.`);
  }

  function getStaffPosition(note: ScoreNote) {
    if (note.isRest) {
      return "rest";
    }

    const pitch = note.pitch?.replace(/[#b]/g, "") ?? "D";
    const order = ["C", "D", "E", "F", "G", "A", "B"];
    const pitchOffset = order.indexOf(pitch);
    const octaveOffset = (note.octave ?? 4) - 4;
    const position = 4 - pitchOffset - octaveOffset * 3;

    return `pos-${Math.max(0, Math.min(8, position))}`;
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Workspace" title="My Music">
        <div className="header-actions">
          <Button variant="secondary" onClick={handleCreateNewSheet}>
            <FilePlus2 size={18} />
            Create New Sheet
          </Button>
          <Button onClick={() => setIsImportPanelOpen(true)}>
            <Upload size={18} />
            Upload Score Sheet
          </Button>
          <Button variant="secondary" onClick={() => setIsRecordToScoreOpen(true)}>
            <Mic size={18} />
            Record to Score
          </Button>
          <div className="header-badge">
            <FileMusic size={18} />
            {scoreSheets.length} items
          </div>
        </div>
      </PageHeader>

      <p className="page-description">
        Open score sheets, play along with highlighted notes, record practice takes, or create new music.
      </p>

      {isEditorOpen ? (
        <section className="sheet-editor-panel">
          <div className="section-heading">
            <div>
              <h2>Create New Sheet</h2>
              <p>Set up a local draft score. Full notation editing and export will come later.</p>
            </div>
            <button className="icon-text-button" type="button" onClick={() => setIsEditorOpen(false)}>
              <X size={16} />
              Close
            </button>
          </div>

          <div className="sheet-editor-grid">
            <label>
              <span>Title</span>
              <input
                value={sheetDraftForm.title}
                onChange={(event) => updateSheetDraftForm("title", event.target.value)}
              />
            </label>
            <label>
              <span>Composer</span>
              <input
                placeholder="Optional"
                value={sheetDraftForm.composer}
                onChange={(event) => updateSheetDraftForm("composer", event.target.value)}
              />
            </label>
            <label>
              <span>Instrument</span>
              <select
                value={sheetDraftForm.instrument}
                onChange={(event) => updateSheetDraftForm("instrument", event.target.value as MusicSheet["instrument"])}
              >
                <option value="viola">Viola</option>
                <option value="violin">Violin</option>
                <option value="cello">Cello</option>
                <option value="voice">Voice</option>
                <option value="piano">Piano</option>
              </select>
            </label>
            <label>
              <span>Clef</span>
              <select
                value={sheetDraftForm.clef}
                onChange={(event) => updateSheetDraftForm("clef", event.target.value as MusicClef)}
              >
                <option value="alto">Alto</option>
                <option value="treble">Treble</option>
                <option value="bass">Bass</option>
                <option value="tenor">Tenor</option>
              </select>
            </label>
            <label>
              <span>Key signature</span>
              <input
                value={sheetDraftForm.keySignature}
                onChange={(event) => updateSheetDraftForm("keySignature", event.target.value)}
              />
            </label>
            <label>
              <span>Time signature</span>
              <input
                value={sheetDraftForm.timeSignature}
                onChange={(event) => updateSheetDraftForm("timeSignature", event.target.value)}
              />
            </label>
            <label>
              <span>Tempo BPM</span>
              <input
                min={30}
                max={220}
                type="number"
                value={sheetDraftForm.tempoBpm}
                onChange={(event) => updateSheetDraftForm("tempoBpm", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="starting-notes-shell">
            <div>
              <FileMusic size={20} />
              <h3>Starting Notes</h3>
            </div>
            <p>
              Placeholder notes are included for now. Later this area will support adding notes, rests, articulations,
              bowing, playback instrument, and editable notation.
            </p>
            <div className="starting-note-row">
              <span>D4 quarter</span>
              <span>E4 quarter</span>
              <span>Rest quarter</span>
              <span>A4 quarter</span>
            </div>
          </div>

          <div className="import-actions">
            <Button onClick={handleSaveDraftSheet}>Save Draft</Button>
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

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

      {isRecordToScoreOpen ? (
        <section className="record-to-score-panel">
          <div>
            <Mic size={20} />
            <h3>Record to Score</h3>
          </div>
          <p>
            Record to Score will later listen to your playing and draft editable sheet music with notes, rests, rhythm,
            octave, bowing, slurs, pizzicato, vibrato, and other markings.
          </p>
          <div className="import-actions">
            <Button variant="secondary" onClick={() => setIsRecordToScoreOpen(false)}>
              Close
            </Button>
          </div>
        </section>
      ) : null}

      <section className="metric-grid">
        <Metric label="Library" value={`${scoreSheets.length}`} detail="Sheets and drills" />
        <Metric label="Imported" value={`${importedCount}`} detail="Local demo imports" />
        <Metric label="Ready" value={`${readyCount}`} detail="Ready or reviewed" />
        <Metric label="Practice Queue" value={`${practiceQueueAdditions.length}`} detail="Local additions" />
      </section>

      {practiceQueueAdditions.length > 0 || practiceQueueMessage ? (
        <section className="practice-additions-panel">
          <div className="section-heading">
            <div>
              <h2>Practice Queue Additions</h2>
              <p>Local demo items added from My Music. These will connect to guided Practice later.</p>
            </div>
            {practiceQueueMessage ? <span className="saved-confirmation">{practiceQueueMessage}</span> : null}
          </div>
          {practiceQueueAdditions.length > 0 ? (
            <div className="practice-addition-list">
              {practiceQueueAdditions.map((item) => (
                <article className="practice-addition-item" key={item.id}>
                  <span>{materialTypeLabels[item.materialType]}</span>
                  <strong>{item.title}</strong>
                  <small>{item.tempoBpm} BPM - {statusLabels[item.status]}</small>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

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
                onChange={(event) => setStatusFilter(event.target.value as MusicSheetStatus | "all")}
                aria-label="Filter score status"
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="needs_review">Needs review</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </label>
          </div>

          <div className="score-table" role="table" aria-label="My Music library">
            <div className="score-table-header" role="row">
              <span>Music</span>
              <span>Instrument</span>
              <span>Key / Time</span>
              <span>Tempo</span>
              <span>Material</span>
              <span>Status</span>
              <span>Updated</span>
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
                    <small>{score.composer ?? "No composer"}</small>
                  </span>
                  <span>{score.instrument}</span>
                  <span>
                    {score.keySignature}
                    <small>{score.timeSignature}</small>
                  </span>
                  <span>{score.tempoBpm} BPM</span>
                  <span>{materialTypeLabels[score.materialType]}</span>
                  <span className={`score-status ${score.status}`}>{statusLabels[score.status]}</span>
                  <span>
                    {score.updatedAt}
                    <small>{score.lastPracticedAt ? `Practiced ${score.lastPracticedAt}` : "Not practiced"}</small>
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
            <p>{selectedScore.composer ?? "No composer listed"}</p>
            <small className="score-source">{materialTypeLabels[selectedScore.materialType]}</small>
          </div>

          <div className="score-meta-grid">
            <div>
              <span>Instrument</span>
              <strong>{selectedScore.instrument}</strong>
            </div>
            <div>
              <span>Clef</span>
              <strong>{selectedScore.clef}</strong>
            </div>
            <div>
              <span>Key</span>
              <strong>{selectedScore.keySignature}</strong>
            </div>
            <div>
              <span>Time / Tempo</span>
              <strong>{selectedScore.timeSignature} / {selectedScore.tempoBpm} BPM</strong>
            </div>
          </div>

          <div className="score-review-block">
            <div>
              <Clock3 size={18} />
              <span>Current sheet</span>
            </div>
            <strong>{selectedScore.lastPracticedAt ? `Last practiced ${selectedScore.lastPracticedAt}` : "Ready for first practice take"}</strong>
          </div>

          <div className="score-focus-list">
            <div className="section-heading">
              <h3>Sheet Details</h3>
              <BookOpenCheck size={18} />
            </div>
            <p>Source: {selectedScore.source}</p>
            <p>Material: {materialTypeLabels[selectedScore.materialType]}</p>
            <p>Status: {statusLabels[selectedScore.status]}</p>
            <p>Created: {selectedScore.createdAt}</p>
          </div>

          <div className="score-teacher-note">
            <span>Workspace note</span>
            <p>Use Open Score to review notation, play along with the cursor, or create a practice take from this sheet.</p>
          </div>

          <div className="score-actions">
            <Button onClick={() => setIsScoreViewerOpen(true)}>Open Score</Button>
            <Button variant="secondary" onClick={handleAddToPractice}>Add to Practice</Button>
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
                {selectedScore.composer ?? "No composer listed"} - {selectedScore.instrument} - {selectedScore.clef} clef
              </p>
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
            <strong>
              {currentNote ? (currentNote.isRest ? "Rest" : `${currentNote.pitch}${currentNote.octave ?? ""}`) : "Ready"}
            </strong>
            <small>{selectedScore.tempoBpm} BPM</small>
          </div>

          <div className="mock-music-sheet" aria-label="Mock music sheet">
            <div className="sheet-title-block">
              <span>
                {selectedScore.instrument} - {selectedScore.clef} clef - {selectedScore.keySignature} -{" "}
                {selectedScore.timeSignature} - {selectedScore.tempoBpm} BPM
              </span>
              <strong>{materialTypeLabels[selectedScore.materialType]}</strong>
              <small className={`score-status ${selectedScore.status}`}>{statusLabels[selectedScore.status]}</small>
            </div>
            {Object.entries(notesByMeasure).map(([measure, notes]) => (
              <article className="measure-group" key={measure}>
                <div className="measure-number">Measure {measure}</div>
                <div className="staff-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="measure-notes">
                  {notes.map((note) => {
                    const absoluteIndex = selectedScore.notes.findIndex((scoreNote) => scoreNote.id === note.id);
                    const isActive = absoluteIndex === currentNoteIndex;

                    return (
                      <div
                        className={`score-note-on-staff ${getStaffPosition(note)} ${isActive ? "active" : ""}`}
                        key={note.id}
                      >
                        <strong>{note.isRest ? "Rest" : `${note.pitch}${note.octave ?? ""}`}</strong>
                        <span>{note.duration}</span>
                        <small>{note.articulation && note.articulation !== "none" ? note.articulation : "No articulation"}</small>
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
              <AudioLines size={20} />
              <h3>Record Take</h3>
            </div>
            <p>
              Record Take will capture your performance for this selected score or exercise.
            </p>
            <div className="import-actions">
              <Button
                disabled={scoreRecorder.status === "requesting"}
                onClick={scoreRecorder.status === "recording" ? scoreRecorder.stop : scoreRecorder.start}
                variant={scoreRecorder.status === "recording" ? "secondary" : "primary"}
              >
                {scoreRecorder.status === "recording" ? <Square size={18} /> : <Mic size={18} />}
                {scoreRecorder.status === "recording" ? "Stop Take" : scoreRecorder.status === "requesting" ? "Allow Mic" : "Record Take"}
              </Button>
              <span className="soft-count">{scoreRecorder.recordings.length} takes saved locally</span>
            </div>
            {scoreRecorder.error ? <p className="inline-error">{scoreRecorder.error}</p> : null}
          </div>
        </section>
      ) : null}
    </section>
  );
}
