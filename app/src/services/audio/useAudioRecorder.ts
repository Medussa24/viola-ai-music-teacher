import { useCallback, useEffect, useRef, useState } from "react";

export type PracticeRecording = {
  id: string;
  createdAt: Date;
  durationSeconds: number;
  blob: Blob;
  url: string;
};

export type RecorderStatus = "idle" | "requesting" | "recording" | "stopped" | "error";

export function useAudioRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const recordingsRef = useRef<PracticeRecording[]>([]);
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<PracticeRecording[]>([]);

  useEffect(() => {
    recordingsRef.current = recordings;
  }, [recordings]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const start = useCallback(async () => {
    if (status === "requesting" || status === "recording") {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("This browser does not support microphone recording.");
      return;
    }

    if (!window.MediaRecorder) {
      setStatus("error");
      setError("This browser does not support the MediaRecorder API.");
      return;
    }

    try {
      setStatus("requesting");
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        const durationSeconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

        setRecordings((current) => [
          {
            id: crypto.randomUUID(),
            createdAt: new Date(),
            durationSeconds,
            blob,
            url,
          },
          ...current,
        ]);
        setStatus("stopped");
        mediaRecorderRef.current = null;
        stopStream();
      });

      recorder.start();
      setStatus("recording");
    } catch (recordingError) {
      setStatus("error");
      setError(recordingError instanceof Error ? recordingError.message : "Microphone permission was not granted.");
      mediaRecorderRef.current = null;
      stopStream();
    }
  }, [status, stopStream]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }

      stopStream();
      recordingsRef.current.forEach((recording) => URL.revokeObjectURL(recording.url));
    };
  }, [stopStream]);

  return {
    error,
    recordings,
    start,
    status,
    stop,
  };
}
