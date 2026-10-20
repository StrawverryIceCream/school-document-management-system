# Implementation Plan: PRD Milestone Execution

## Batch 1: Schema, Auth Sync & Documentation Modernization
- [x] Task 1: Database Schema Update (Add `student_status` enum/column to `users` and `release_pdf_url` to `document_requests`).
- [x] Task 2: Auth Controller & Registration Form Sync (Persist `studentStatus`, allow personal emails for alumni, update client API and types).
- [x] Task 3: Modernize & Clean `README.md` (Rewrite outdated entry point, scripts, tech stack, and `.env` template).

## Batch 2: Hybrid Release & Notification Automation
- [x] Task 4: Hybrid PDF Release Workflow (Allow staff to attach completed PDF URL when marking ready; render download in `MyRequest`).
- [x] Task 5: Status Change Email Notifications (Wire `email.service.ts` into request status transitions).
