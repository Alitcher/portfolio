## Overview

[**CosOverHere**](https://www.cosoverhere.com/) (formerly CosoraAtlas) is my first solo full-stack web project. It is made for gathering cosplay events, cosplay-friendly places, and performance practice spots across the Nordic and Baltic countries on one map and calendar, with localization support. The backend imports events from open data sources. Visitors can also submit through the form, selectively approved by admins. It launched on 27 June 2026 and is live and growing.

I design the frontend, backend, database, data imports, hosting, and admin tools with the help of Claude Opus 5.5. As a game developer as my first career path, I learned a lot from this.

## Back Story

When I moved to Europe, I didn't know anyone into cosplay at work or school. Neither did I know where to look for events or communities. Back home, I had used a site called [Props&Ops](https://propsops.com/event/) to follow cosplay events for years, but nothing like it existed. The event lists I found either covered a single country, or pulled in events from all over the world with no local knowledge.

Over the years I found a group of local cosplay acquaintances and travelled with them to events around the Nordics and Baltics. CosOverHere is the project I wished I had on day one: find your event, find your people.

## Screenshots

![Local community page: recurring meetups with filters, transit info, price and age tags](./assets/screenshots/cosoverhere-community.jpg)

## The Tech Stack

- **Frontend** - Next.js 16 (App Router), React 19, TypeScript, plain CSS with a light and dark theme
- **Maps** - MapLibre GL vector maps with 3D buildings, GeoJSON sources and custom markers
- **Languages** - next-intl, the whole site in English, Finnish, Estonian and Thai, also open to more languages if requested
- **Backend** - Hono on Cloudflare Workers, split into controllers, services and repositories
- **Database** - Cloudflare D1 (SQLite) with 15 versioned SQL migrations
- **Shared types** - one Zod schema package used by both server and client
- **Auth** - passkey (WebAuthn) login for the admin
- **Hosting** - Vercel for the frontend, Cloudflare for the API, daily Cron Trigger for imports

## How It Works

1. **Import** - A daily cron job pulls events from Linked Events APIs, e.e. Kompassi API, Helsinki API, and turns them into one shared Event format.
2. **Enrich** - Each venue gets its nearest public transport stops, from Digitransit in Finland and Estonia, Transitous for the rest of Europe, and OpenStreetMap as a last fallback.
3. **Moderate** - Visitors can submit events and spots. Submissions are rate-limited, and I review, edit, or reject them, with a full edit history.
4. **Serve** - The API returns JSON and GeoJSON. A separate GIS proxy Worker fetches venue geometry, works around CORS and caches it at the edge.
5. **Map** - The map, calendar, events list, spots and community pages all use the same data. Click an event in the list and the map flies to it.

## Highlights

- **Recurring meetups** - weekly and monthly library clubs and workshops, each shown at its next date with its full yearly schedule
- **Filters** - by country, city, age group and price, shared across the home page, events and map
- **Location-aware** - lists start on the visitor's own country, read from the request at the edge, with no location prompt and no personal data stored
- **Share images** - every event and spot gets its own generated preview image for social media
- ** Multi-platform support ** - phone and Tablet layouts
- **Low cost** - runs on free tiers as much as possible, so the site stays free for the community

## Lessons Learned

- Be specific with your choice; designing a clean API contract first would have saved me from many client and server bugs.
- Open data from multiple sources is messy: think first about how you would normalize dates, prices, and addresses.
- Edge platforms (Workers, D1, Vercel) let one person run a real product with almost no ops work.
- Localization is easiest when it is built in early, not added at the end.
- Small UX details, like transportation and "today" highlighted badges, are what users notice most.

## What's Next

- Deeper touch for each local cosplay community
- More countries, events, and spots
- Self-visit conventions and write a vlog and activities on site.
- A better experience for Nordic and Baltic cosplayers
