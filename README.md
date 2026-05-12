# AutoService Frontend

**AutoService Frontend** is a production‑grade Angular application that provides a full‑featured UI for managing automotive service operations. It implements a modular, component‑driven architecture that isolates each business domain (authentication, customer management, fleet management, staff coordination, and workshop operations) under `src/app/domains/`. The codebase follows Angular best practices, leverages TypeScript strict mode, and uses Angular Material for a consistent, responsive design.

---

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Development Server](#development-server)
- [Project Structure](#project-structure)
- [Build & Deployment](#build--deployment)
- [Testing Strategy](#testing-strategy)
  - [Unit Tests](#unit-tests)
  - [End‑to‑End Tests](#end-to-end-tests)
- [Linting & Formatting](#linting--formatting)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [License](#license)
- [Contact](#contact)

---

## Overview

The frontend is built with **Angular 21** and **TypeScript** (strict mode enabled). It communicates with the backend through a RESTful API (or uses the bundled `db.json` mock data for local development). The UI is fully responsive and styled with SCSS and Angular Material components.

---

## Technology Stack

| Layer | Technology |
|-------|--------------|
| Framework | Angular 21 (CLI) |
| Language | TypeScript (strict) |
| Styling | SCSS + Angular Material |
| Testing | Vitest (unit), Cypress/Playwright (e2e) |
| Linting | ESLint + Prettier |
| Build | Angular CLI (`ng build`) |
| Package Manager | npm |

---

## Key Features

- **Authentication** – Secure login flow with session handling.
- **Customer Management** – CRUD UI for customers, searchable list.
- **Fleet Management** – Vehicle detail view, list with advanced filters, card UI.
- **Staff Coordination** – Mechanic directory, filterable view, assignment dialogs.
- **Workshop Operations** – Work‑order creation, dashboard, task board, and filter components.
- **Modular Design** – Each domain lives under `src/app/domains/` enabling independent development and testing.
- **Responsive UI** – Mobile‑first layout with Material Design components.
- **Mock Backend** – `db.json` provides sample data for rapid prototyping.

---

## Architecture Overview

```
src/
 └─ app/
     ├─ app.html            # Root template
     ├─ app.css             # Global styles
     ├─ domains/            # Feature modules (auth, fleet‑management, …)
     │   ├─ auth/                     # Login flow
     │   ├─ customer-management/       # Customer UI
     │   ├─ fleet-management/         # Vehicle list & detail
     │   ├─ staff-coordination/       # Mechanic view & dialogs
     │   └─ workshop-operations/      # Work orders, tasks, dashboard
     ├─ shared/            # Reusable UI components (admin layout, etc.)
     └─ services/          # API wrappers, utilities
```

The application uses **Angular’s lazy‑loading** for each domain module, reducing the initial bundle size. State management is handled locally within each component; a global store is not required at this stage.

---

## Prerequisites

- **Node.js** (>= 20.x) and **npm** (>= 10.x)
- **Angular CLI** (`npm i -g @angular/cli@21`)
- **Git** for version control
- Optional: **Docker** (for containerised development) – see the *Docker* section in the CI configuration.

---

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/InnovaTechStudio/AutoService-729-OS-Frontend.git
cd AutoService-729-OS-Frontend

# Install exact dependencies
npm ci
```

> **Tip:** `npm ci` guarantees a reproducible install based on `package-lock.json`.

---

## Development Server

Launch the development server with hot‑module replacement:

```bash
ng serve
```

Visit `http://localhost:4200/`. The application reloads automatically on source changes.

---

## Project Structure

```
src/
 ├─ app/
 │   ├─ app.html                # Root component template
 │   ├─ app.css                 # Global CSS
 │   ├─ domains/                # Feature modules (see Architecture Overview)
 │   ├─ shared/                 # Shared components, pipes, directives
 │   ├─ services/               # HTTP client wrappers, auth guards
 │   └─ assets/                 # Images, fonts, icons
 ├─ assets/                    # Static assets served as‑is
 ├─ index.html                 # Entry HTML file
 ├─ material-theme.scss       # Angular Material theme definition
 └─ styles.css                 # Global stylesheet (reset, utilities)
```

---

## Build & Deployment

- **Production Build**
  ```bash
  ng build --configuration production
  ```
  The output is placed in `dist/` and is ready for any static‑host (Netlify, Vercel, AWS S3, Azure Blob).

- **Docker Image (optional)**
  ```Dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build -- --configuration production
  FROM nginx:alpine
  COPY --from=builder /app/dist/auto-service-frontend /usr/share/nginx/html
  ```
  Build with `docker build -t autoservice-frontend .` and run `docker run -p 80:80 autoservice-frontend`.

---

## Testing Strategy

### Unit Tests
The project uses **Vitest** with the Angular testing utilities.
```bash
ng test
```
Run in watch mode with `ng test --watch`.

### End‑to‑End Tests
End‑to‑end tests are framework‑agnostic. We recommend **Cypress** or **Playwright**. After adding your chosen framework under `e2e/`:
```bash
ng e2e
```

---

## Linting & Formatting

- **ESLint** for static analysis (`npm run lint`).
- **Prettier** for code formatting (`npm run format`).
- A pre‑commit hook (via `husky`) runs lint and format checks automatically.

---

## Continuous Integration

The repository includes a minimal **GitHub Actions** workflow (`.github/workflows/ci.yml`) that:
1. Installs dependencies (`npm ci`).
2. Lints the codebase.
3. Executes unit tests.
4. Builds the production bundle.
5. Optionally runs e2e tests if a `CYPRESS_*` secret is provided.

---

## Contributing

1. Fork the project.
2. Create a feature branch (`git checkout -b feat/your-feature`).
3. Follow the linting and formatting rules (`npm run lint && npm run format`).
4. Add unit/e2e tests for new code.
5. Commit with a clear message following the conventional commit style.
6. Open a Pull Request describing the problem and solution.

---

## Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) to understand the expected behavior in this community.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## Contact

- **Maintainer:** InnovaTech Studio – <opensource@innovatetech.com>
- **Issues:** Open a GitHub Issue for bugs or feature requests.
- **Discussion:** Join our Discord channel (link in the repository README) for real‑time conversations.