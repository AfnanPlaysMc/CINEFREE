# CineFree — Movie & TV Discovery, Trailers & Authorized Streaming Guide

**CineFree** is a high-performance, cinematic web application inspired by leading streaming platforms. It connects to The Movie Database (TMDB) API to discover movies, explore television series, preview official trailers, and find legal, authorized streaming providers (such as Netflix, Amazon Prime, Disney+, Max, Apple TV, Tubi, and Pluto TV).

---

## 1. Features

- **Cinematic Discovery Home:**
  - Dynamic Trending Hero banner featuring large backdrops, synopsis, ratings, and instant trailer playback.
  - 11 live TMDB horizontal rows: Trending Movies This Week, Popular Movies, Top Rated Movies, Now Playing in Theaters, Action, Comedy, Horror, Sci-Fi, Trending TV, Popular TV, and Top Rated TV.
- **Deep Metadata Pages (`/movie/:id` & `/tv/:id`):**
  - Full movie and television details, ratings, runtimes, release dates, and director credits.
  - Interactive top-billed cast carousel.
  - Full TV Show season selector and episode guides with episode thumbnails, air dates, and synopses.
  - Similar and recommended title carousels.
- **Real & Authorized Playback (`VideoPlayer`):**
  - Embeds official YouTube trailers and studio teasers with strict origin validation and sandbox allowlists.
  - Integrates verified public domain / open archive full features (e.g. *Night of the Living Dead*, *Metropolis*, *Charade*, *Nosferatu*) from the Internet Archive.
  - Live source switcher, reload/retry options, and buffering timeout notifications.
  - **Zero False Promises:** Never falsely claims a title can be streamed in full without a verified authorized source.
- **Authorized Watch Providers:**
  - Real-time TMDB / JustWatch availability widget identifying where users can legally Stream, Watch for Free with Ads, Rent, or Buy across multiple territories.
- **Instant Search:**
  - 350ms debounced multi-search across movies and television series.
  - Type-filtering tabs (All, Movies, TV), query retention in URL, and friendly empty states.
- **Dual-Mode Persistence (Local + Firebase Cloud):**
  - **Guest Mode:** Fully functional using browser `localStorage` without requiring an account.
  - **Firebase Auth & Firestore:** One-click Google Sign-in to sync watchlists in real-time across devices.
- **Settings & Privacy:**
  - Storage management (clear local browsing history and watchlist).
  - Optional custom TMDB API key input for developers and power users.
  - Transparent legal, privacy, and TMDB trademark compliance disclosures.

---

## 2. Technology Stack

- **Framework:** React 19, TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4, Lucide React icons
- **Backend:** Express API proxy with in-memory caching and request deduplication
- **Authentication & Database:** Firebase Auth (Google Sign-In) + Cloud Firestore
- **External Data:** TMDB v3 API & TMDB Image CDN
- **Build & Dev:** Vite 8, tsx, Node.js built-in test runner (`node:test`)
- **Deployment:** Cloudflare Pages / Workers or Docker / Node container

---

## 3. Prerequisites

- Node.js 20+ installed locally
- (Optional) A free TMDB API key from [themoviedb.org](https://www.themoviedb.org/)

---

## 4. How to Obtain a TMDB API Key

1. Register for a free account at [themoviedb.org](https://www.themoviedb.org/signup).
2. Go to **Settings > API** in your TMDB user profile.
3. Request an API key (select Developer / Personal use).
4. Copy your **API Key (v3 auth)**.

> **Note:** CineFree includes an authentic built-in seed cache for all 11 required catalog categories, trailers, and detail pages. If no TMDB key is provided, the application continues to run seamlessly without broken links or blank screens.

---

## 5. Configuration & Environment Variables

Create a `.env.local` or `.env` file in the project root:

```bash
# Required for live external TMDB v3 queries (Server-side only)
TMDB_API_KEY="your_tmdb_api_key_here"

# Port (Defaults to 3000)
PORT=3000
```

---

## 6. Installation & Development

```bash
# Install dependencies
npm install

# Run unit tests
npx tsx --test src/lib/utils.test.ts

# Start full-stack development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 7. Production Build & Deployment

### Standard Node / Container Build
```bash
npm run build
npm start
```

### Cloudflare Pages / Workers Deployment (Free Tier)
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```
2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```
3. Deploy build output:
   ```bash
   npm run build
   wrangler pages deploy dist --project-name cinefree
   ```
4. Set your TMDB API Key secret in Cloudflare Pages:
   ```bash
   wrangler pages secret put TMDB_API_KEY --project-name cinefree
   ```

---

## 8. Free-Tier Limits & Usage

- **TMDB API:** TMDB rate-limits requests to approximately 40 requests per 10 seconds. CineFree's server-side proxy handles this with:
  - 1-hour in-memory catalog response caching
  - Request deduplication for simultaneous calls
  - 350ms debounced search to minimize API query volume
- **Firebase Free Tier (Spark Plan):**
  - Up to 50,000 reads and 20,000 writes per day on Cloud Firestore at no cost.
  - Unlimited Google Authentication accounts on Firebase Auth.

---

## 9. Legal & Trademark Attribution

- **TMDB Attribution:** This product uses the TMDB API but is not endorsed or certified by TMDB.
- **Content Rights:** TMDB metadata does not automatically provide rights to stream full movies or TV episodes. CineFree embeds authorized official trailers, verified open archive public domain works, and links users to verified streaming services.
