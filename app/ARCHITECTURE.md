# Viola AI Music Teacher Architecture

## Product Shape

The app starts as a frontend-first skeleton with mock services. Real APIs can replace mocks through service interfaces without changing feature screens.

## Layers

- `src/core`: domain models, constants, and mock seed data. No React imports.
- `src/services`: boundaries for AI, curriculum, audio analysis, recordings, and progress. Mock implementations live here until APIs exist.
- `src/features`: vertical UI modules for dashboard, practice, coach, progress, and settings.
- `src/app`: app shell, navigation, route state, and high-level composition.
- `src/shared`: reusable UI primitives and small utilities.

## API Transition Plan

1. Keep UI connected to service contracts, not direct fetch calls.
2. Add real clients in `src/services/api` when the backend exists.
3. Swap `createMockMusicTeacherService` with `createApiMusicTeacherService`.
4. Keep recording/audio processing behind `AudioAnalysisService`.
5. Add auth and persistence as providers around the app shell.

## First Backend Boundaries

- `GET /profile`
- `GET /practice-plan/today`
- `POST /sessions`
- `POST /recordings/analyze`
- `POST /teacher/chat`
- `GET /progress/summary`

## Current Local-Only Features

- Practice recordings use the browser `MediaRecorder` API.
- Recording playback uses local object URLs and does not upload audio.
- Future pitch/rhythm analysis should attach through `AudioAnalysisService`.

## Scaling Principles

- Feature modules own their screens and components.
- Shared components stay generic and design-system focused.
- Domain models stay stable and framework-independent.
- External APIs enter through services only.
- Audio, AI, and curriculum can evolve separately.
