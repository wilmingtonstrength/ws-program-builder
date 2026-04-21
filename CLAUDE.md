# WS Program Builder - Claude Code Context

## IMPORTANT: This is its own standalone project

This repo has **NOTHING TO DO** with Kaimetric or the Wilmington Strength performance tracker app (`~/Projects/wilmington-strength`). Do not confuse the two. Do not apply rules, conventions, or context from the Kaimetric CLAUDE.md to this project.

- Different repo
- Different Supabase project
- Different Netlify deploy
- Different stack (Vite + React with `.jsx`, NOT create-react-app with `.js`)
- Different product (this is a weightlifting program builder for coaches; Kaimetric is a testing/metrics platform)

If a user message or earlier context mentions "Kaimetric", "Wilmington Strength app", "performance tracker", "gyms table", "athletes table", "test results", `src/App.js`, or the Kaimetric Supabase project (`jfyexedcjgerahuumyqu`), that is a DIFFERENT project. This repo is `ws-program-builder`.

## What this project is

A web app for strength coaches (primarily Olympic weightlifting) to build training programs. Coaches create templates that auto-generate multi-week training blocks with percentage-based loading, set/rep schemes, and exercise variations.

## Tech Stack

- **Frontend**: Vite + React, `src/App.jsx` (single-file app, ~155KB)
- **Supabase project**: `xxtomnbvinxuvnrrqnqb` (separate from Kaimetric)
- **Hosting**: Netlify (auto-deploys on push to `main`)
- **Repo**: `wilmingtonstrength/ws-program-builder`
- **Branch**: `main` (only branch, push straight to main — no PR flow)

## File Conventions

- Components and app code use `.jsx` extension (standard Vite convention)
- Do NOT rename to `.js` — that's a Kaimetric rule and does not apply here
- Main app lives entirely in `src/App.jsx`

## Program / Template Concepts

- **Template**: a blueprint that generates a multi-week training block (sets, reps, percentages, exercise variations)
- **Block**: typically 3-4 weeks of programming produced by a template
- **Series**: warmup (WU), strength (STR), Olympic (OLY), pulls (PULL), power (PWR), accessory
- **Percentage categories** (`detectPctCategory`): STR, OLY, PULL, PWR — drive which % range is used
- **Exercise library** (`LIBRARY` constant): canonical list of exercises grouped by movement family

## Custom Templates (Create Template tab)

- Users can build their own templates in the Create Template tab; saved to Supabase `custom_templates` (row = `{ id, template_json }`)
- Days: A-E (1 to 5 days per week)
- Blocks: 1-3 (user picks how many blocks to author via "Blocks to use" selector)
- Per-exercise per-week authoring: each exercise row has a `W1-4` toggle. When on, the user can author `{sets, reps, pctLo, pctHi}` per week independently. Stored on the exercise as `ex.perWeek = { 1: {...}, 2: {...}, ... }`
- % Cat "None (sets x reps)": renders the exercise as sets × reps only, no percentage
- `ex.perWeek` values are merged into runtime `pctOverrides` / `setsRepsOverrides` in `getExs` — coach runtime edits (`program_edits`) override template perWeek values
- Delete: each custom template row in the list has a red Delete button (confirms via `window.confirm`)

## Display Rules (apply to ALL templates)

Per exercise box, per week:
- Rep scheme (e.g. "4x2") — **visible at top of box**
- Weight (computed from athlete's PR × percentage) — **visible**
- Percentage range (e.g. "75-80%") — **hidden from athlete view**

The percentage range stays in the data model (coaches can still edit it) but should not render in the athlete-facing exercise box.

## Deploy

- Push to `main` → Netlify auto-deploys in ~30 seconds
- No PR workflow needed for template additions or display tweaks

## Critical Rules

- Don't break existing templates when adding new ones
- Generators should feel like a real coach wrote the program — use controlled randomness within rule constraints, not rigid math
- Always output complete files when editing `src/App.jsx`, no partial snippets
