import type { AudioAnalysisResult, AudioAnalysisService } from "../contracts";

export function createBrowserAudioAnalysisService(): AudioAnalysisService {
  return {
    async analyzeRecording(_recording: Blob): Promise<AudioAnalysisResult> {
      return {
        pitchAccuracy: 0,
        rhythmAccuracy: 0,
        notes: ["Audio analysis is mocked until the recording pipeline is connected."],
      };
    },
  };
}
