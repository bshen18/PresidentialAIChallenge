This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# PresidentialAIChallenge
# Lumina

**An AI-powered Launch Assistant that turns raw data into accessible STEM experiences.**

Lumina is a web application designed to democratize the experience of watching a rocket launch. It removes the logistical barriers—cloud cover, trajectory guesswork, and travel constraints—that often prevent families and students from experiencing these inspiring STEM events.

Instead of relying on insider local knowledge, Lumina synthesizes public launch manifests, meteorological data, and geospatial constraints to provide a ranked, practical viewing plan.

---

## The Problem
Rocket launches are powerful STEM "sparks," but they are logistically difficult to attend. Unless a user lives on the Space Coast or pays for premium tours, they face:
* **Uncertainty:** "Will I actually see the plume from here?"
* **Weather risks:** "Is the cloud ceiling too low?"
* **Trajectory confusion:** "Which direction should I face?"
* **Travel friction:** "Will traffic make me late?"

## The Solution
Lumina acts as a knowledgeable local guide. Users select an upcoming launch and enter their location. The system creates a **ranked list of viewing points** containing:
* **Suitability Score:** An AI-generated ranking based on visibility and comfort.
* **Feasibility Checks:** Travel time vs. Countdown window.
* **Contextual Advice:** "Go here, look South-East, show up by X time."
* **Hard Guardrails:** Locations are flagged as **"Impossible"** if the travel time exceeds the time-to-launch.

---

## Architecture & Data Pipeline

Lumina is not just "AI for AI's sake." It is a hybrid system that bridges raw technical feeds with human decision-making.

### The Pipeline
1. **Launch Selection:** Ingests launch schedules via **Launch Library 2**.
2. **Candidate Discovery:** Queries **OpenStreetMap (Overpass API)** for public keypoints (parks, piers, beaches) near the launch pad.
3. **Weather Context:** Fetches forecasts from the **National Weather Service** (US) or **Open-Meteo** (Global).
4. **AI Synthesis:** Passes trajectory, weather, and geography data to **Google Generative AI**.
5. **Client-Side Logic:** Applies deterministic "guardrails" (e.g., if travel time > T-Minus, force status to "Impossible").

### Tech Stack
* **Frontend:** Next.js, React, TypeScript
* **Styling:** Tailwind CSS, `clsx`, `tailwind-merge`
* **Icons:** Lucide React
* **AI Layer:** `@google/generative-ai`
* **Utilities:** `dotenv`, `react-player`

---

## Hybrid AI Approach

Lumina demonstrates how to build responsible AI systems by combining generative reasoning with hard constraints.

* **Generative:** The AI explains *why* a spot is good (e.g., "The Atlas V trajectory will arc eastward, giving this beach a clear profile view").
* **Deterministic:** The app does not trust the LLM with math or safety-critical timing. It calculates travel times via code and strictly overrides the AI's recommendation if a user cannot physically make it to the location in time.
* **Transparency:** The UI explicitly communicates the logic (Geometry + Weather + Traffic) so users understand the recommendation is multi-factor.
