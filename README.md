# Viola AI Music Teacher

Viola is a frontend-first skeleton for an AI-powered music teacher app. The first product direction is a viola-focused practice coach that can later expand into broader instrument support.

## Current App

- React + TypeScript + Vite.
- Mock service layer for practice plans, progress, teacher chat, and session recaps.
- Feature modules for dashboard, practice room, coach chat, progress, and settings.
- Local generated hero image asset.
- API-ready architecture with clean service contracts.

## Architecture

The app is organized so real APIs can replace mocks without rewiring feature screens.

- `app/src/core`: domain models and mock seed data.
- `app/src/services`: service contracts and mock implementations.
- `app/src/features`: product areas and screens.
- `app/src/app`: shell, navigation, route state, and composition.
- `app/src/shared`: reusable UI components.

See [app/ARCHITECTURE.md](app/ARCHITECTURE.md) for backend boundaries and scaling notes.

## Local Development

```bash
cd app
npm install
npm run build
npm run preview
```

Open http://127.0.0.1:4173.

`npm run dev` is kept for normal Vite development, but this Windows/OneDrive sandbox currently previews more reliably through the production build.

## Validation

```bash
cd app
npm run build
```

## Product Notes

The restored idea board lives in [AI_MUSIC_TEACHER_IDEAS.md](AI_MUSIC_TEACHER_IDEAS.md).

Changes are tracked in [CHANGELOG.md](CHANGELOG.md). Known issues are tracked in [BUGS.md](BUGS.md).
