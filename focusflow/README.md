# FocusFlow

FocusFlow is a productivity and distraction-control app scaffold built alongside the existing FlowScan project so the two products stay isolated.

## Workspace

```text
focusflow/
  apps/
    api/       Express backend scaffold for usage, sessions, analytics, insights, and nudges
    mobile/    Flutter-ready mobile shell with feature-first folders
```

## Current State

- `apps/api` is runnable once dependencies are installed.
- `apps/mobile` is a Flutter-first code skeleton written by hand because the Flutter SDK is not installed in this environment.
- Storage currently uses an in-memory developer store behind service boundaries so the Firestore adapter can be introduced without rewriting route logic.

## Next Suggested Steps

1. Install Flutter locally and run `flutter create .` inside `apps/mobile` after backing up the hand-written scaffold.
2. Add a Firestore repository adapter in `apps/api/src/infrastructure`.
3. Replace the developer store with Firebase Auth and Firestore-backed persistence.
4. Connect the mobile shell to the backend contracts starting with dashboard, focus timer, and settings.

## Deployment

See `DEPLOYMENT.md` for GitHub and Firebase Hosting steps. The current executable prototype runs locally through the Express API and serves the rich web UI from `apps/api/public`.
