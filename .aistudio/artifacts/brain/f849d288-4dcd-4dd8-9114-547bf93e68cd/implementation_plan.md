# CineFree Overhaul Plan

This plan outlines a comprehensive upgrade to the CineFree platform, focusing on performance, a complete UI/UX overhaul, and the introduction of advanced emotion-based search.

## 1. Overview & Core Concept
*   **What It Does**: A complete redesign and enhancement of the CineFree movie & TV discovery and streaming application.
*   **Key Value**: Provides a premium, high-speed, and intuitive user experience with industry-leading mood/emotion-based search capabilities.

## 2. User Experience & Visual Design
*   **Aesthetic Direction**: Minimalist, cinematic, and professional, adhering strictly to the "Zero-Pill" and "Human Editorial" design principles.
*   **UI Overhaul**:
    *   **Typography**: Using a geometric sans-serif (e.g., *Inter* or *DM Sans*) for body text, combined with a striking display face for hero headers.
    *   **Spacing**: Generous use of whitespace and hairline dividers instead of bordered cards.
    *   **Navigation**: Redesigned 3-zone top bar contract for cleaner interaction.
*   **Advanced Mood/Emotion Search**: A natural-language interface where users can type moods like "I want something suspenseful for a rainy night" or "happy nostalgic comedy." The app will use Gemini to analyze the input and suggest relevant TMDB search parameters.

## 3. Key Product Decisions & Trade-Offs
*   **Decision 1: Native Streaming Reliability**: We will keep the pop-out player (requested by the user) but improve the UI/UX around selecting mirrors and enhancing connection stability to address streaming complaints.
*   **Decision 2: Mood Analysis Implementation**:
    *   *Approach*: Integrate Gemini API on the backend to parse user mood inputs and map them to TMDB genres, keywords, and release years.
    *   *Why*: Directly solves the request for "Advanced mood/emotion search" which goes beyond standard genre filtering.
*   **Decision 3: Performance & Stability**:
    *   *Approach*: Heavy refactoring of `tmdbFetch` to be more resilient, including automatic retries, deduplication, and smarter fallback handling.

## 4. Technical Architecture
```text
┌──────────────────────┐      ┌──────────────────────────┐
│   Frontend (React)   │ <──> │  Backend Proxy (Vercel)  │
│ [UI, Components, Auth]      │ [Mood Search via Gemini] │
└──────────┬───────────┘      └────────────┬─────────────┘
           │                               │
           ▼                               ▼
  ┌──────────────────┐           ┌───────────────────┐
  │ Firebase (Auth)  │           │ TMDB API & Fallback│
  └──────────────────┘           └───────────────────┘
```
*   **Search**: `SearchView.tsx` will be upgraded with a "Mood/Emotion Search" toggle that sends input to a new `/api/mood-search` endpoint.
*   **Data Strategy**: TMDB data is fetched via the optimized proxy. Emotion analysis is handled by Gemini API on the backend.
*   **Stability**: All network requests will have robust error boundaries and UI status feedback to eliminate blank screens.

## User Review & Critical Decisions
> [!IMPORTANT]
> - The new "Advanced Mood Search" will require a quick initial interaction to categorize the user's mood.
> - Streaming stability depends on the mirror provider's reliability; our focus is on robustly offering alternatives when one fails.
> - Do you approve this architectural direction?
