# Fieldcraft

Fieldcraft helps farmers build sustainable farming habits through four stages of practical farm tasks, short knowledge checks, points, and badges. Farmers confirm their own completed tasks; the app cannot verify farm work.

## Run it locally

This is a static site: it has no server backend, build step, external service,or package installation. Serve the project folder with any static file server;the JavaScript modules need an HTTP origin in browsers.

For example, with Python installed:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

Farm notes, visit plans, task progress, points, and badges are saved in the current browser on this device. They are not synced to another device or shared
with GitHub.

## Publish with GitHub Pages

The repository includes a GitHub Actions workflow at
`.github/workflows/deploy-pages.yml`. Push the project to a GitHub repository using the `main` branch, then in the repository settings set **Pages → Build
and deployment → Source** to **GitHub Actions**. The workflow publishes the static app on pushes to `main` and can also be run manually.The GitHub repository's code view does not execute an app. Once Pages
deployment is enabled, use the Pages URL shown in the repository's **Settings
→ Pages** to open the working app.

## Farm task stages

1. **Keep clear field notes** — record observations and plan field visits.
2. **Notice crop and soil connections** — compare example readings and explore
   ways farming practices can support healthy soil.
3. **Find patterns in field readings** — arrange readings and find a field.
4. **Plan careful water use** — try a clearly marked sample watering plan.

Every stage has farm tasks that farmers tick off themselves and three short questions. Answer at least two correctly and mark every task done to earn that
stage's points and badge. Later stages unlock in order. Sample readings and
watering amounts are for practice, not farming advice.

## Project layout

- `index.html`, `styles.css` — static app shell and responsive presentation
- `src/app/` — application state and interface
- `src/features/` — learning-phase algorithms and lesson content
- `src/shared/` — shared UI and browser-storage helpers
- `docs/` — phase definitions and architecture notes
- `tests/` — manual acceptance checks
- `.github/workflows/` — GitHub Pages deployment workflow
