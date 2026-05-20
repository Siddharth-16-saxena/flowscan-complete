# FocusFlow Deployment

## GitHub

This folder is intended to be pushed as its own repository, separate from the older FlowScan workspace.

```powershell
git init
git add .
git commit -m "Initial FocusFlow app"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

## Firebase Hosting

Firebase Hosting can serve the current web prototype from `apps/api/public`.

```powershell
firebase login
firebase init hosting
firebase deploy
```

The current Hosting config points to:

```text
apps/api/public
```

Important: the static hosted build will not run the Express API by itself. For a full production deployment, deploy the API to a Node host such as Cloud Run, Render, Railway, or Firebase Functions, then point the frontend API client at that URL.

## Local Run

```powershell
cd apps/api
npm install
$env:PORT=5052
npm start
```

Open:

```text
http://localhost:5052
```
