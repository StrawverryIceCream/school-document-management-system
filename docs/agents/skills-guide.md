# Agent Skills Playbook & Optimization Guide

A practical reference for maximizing agent skills, eliminating redundant prompting, and adopting high-leverage skills based on specific engineering use cases in the School Document Management System.

---

## 1. How to Maximize Your Most Used Skills

### A. Ponytail (`/ponytail`)
> **Goal:** The cleanest, smallest change that fully solves the problem.

* **It is Session-Persistent:** You do **not** need to type `/ponytail` every message. Once invoked, the agent remains in lazy senior-dev mode until you say `normal mode` or `stop ponytail`.
* **Use Level Modifiers:**
  * `/ponytail full` (Default): Minimal working diff, strictly addresses requirements, skips unasked-for extras.
  * `/ponytail ultra`: Pushes back and questions scope *before* writing code. Use this when you have rough ideas that might bloat the codebase.
  * `/ponytail lite`: Builds what you ask, but names the smaller alternative in one line for you to decide.
* **Underutilized Sister Skills:**
  * `/ponytail-audit`: Runs a read-only audit identifying dead code, unneeded wrappers, and risky un-tested logic.
  * `/ponytail-debt`: Lists all deferred shortcuts marked with `shortcut:` in comments.

---

### B. Spec Workflow (`/to-spec` $\rightarrow$ `/implement-spec`) vs. Plan Workflow (`/writing-plans` $\rightarrow$ `/subagent-driven-development`)
> **Goal:** Avoid mixing planning strategies. Pick the one suited to your scope.

| Workflow | When to Use | Output | Lifecycle |
|---|---|---|---|
| **`/to-spec` $\rightarrow$ `/implement-spec`** | User-facing features, multi-page flows, GitHub issue tracking. | Publishes an issue on GitHub with user stories and test seams. | Closes issue via git commit with PR/branch integration. |
| **`/writing-plans` $\rightarrow$ `/subagent-driven-development`** | Internal refactors, controller/service overhauls, tightly-scoped multi-step tasks. | Creates `docs/plans/YYYY-MM-DD-<feature>.md` with 2-5 min TDD steps. | Executes step-by-step with fresh subagent review per task. |

* **Pro Tip for `/to-spec`:** Always run `/to-spec` **after** a brief conversation or `/grill-with-docs`. `/to-spec` does *not* interview you; it synthesizes what has already been discussed into formal user stories and acceptance criteria.
* **Pro Tip for `/subagent-driven-development`:** If you want all commits kept directly on `main` without creating throwaway worktree branches, state: `/subagent-driven-development stay on main`.

---

### C. Grilling & Architecture (`/grill-with-docs` & `/grill-me`)
> **Goal:** Stress-test ambiguous decisions before committing them to code or database schema.

* **What it does:** Runs a rigorous interview to uncover edge cases (permissions, offline handling, concurrency) while generating architectural decision records in `docs/adr/`.
* **When to use:** State machine changes (e.g. document request statuses: `PENDING` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `REJECTED`), authentication changes, or DB schema alterations.
* **When to skip:** Simple UI tweaks, styling adjustments, or minor bug fixes.

---

### D. Root Cause Tracing (`/root-cause-tracing`)
> **Goal:** Track errors backward through the call chain to eliminate the root trigger, not just suppress the symptom.

* **Maximize Efficiency:**
  * Provide the exact error message and input parameter upfront (e.g., `/root-cause-tracing: /api/requests?search=REQ-2026-000018 failed with 500`).
  * Explicitly request **defense-in-depth**: Have the agent fix both the source bug and add boundary validation so bad data cannot enter again.

---

### E. Caveman (`/caveman` & `/caveman-explore`)
> **Goal:** Minimize token consumption and keep context windows compact.

* **Sticky Mode:** `/caveman` stays active across turns until you say `stop caveman`.
* **Use `/caveman-explore` for Discovery:** When searching for where components or routes live across the project, use `/caveman-explore <query>`. It returns concise `path:line` pointers without dumping full files into memory.

---

## 2. High-Leverage Skills to Adopt (By Use Case)

Based on common full-stack challenges in this school document management repository:

### 1. Hard-to-Reproduce / Race-Condition Bugs
* **Skill:** `/systematic-debugging`
  * **Why:** Replaces guessing with a 4-phase framework: (1) Root Cause Investigation, (2) Pattern Analysis, (3) Hypothesis Testing with Minimal Reproduction, (4) Targeted Implementation.
  * **When:** Use when request state updates intermittently fail or sector queues desync.
* **Skill:** `/condition-based-waiting`
  * **Why:** Replaces arbitrary `setTimeout` or sleep delays in frontend/backend tests with state polling, eliminating flaky test suites.

### 2. Backend, DB & API Expansions
* **Skill:** `/api-design`
  * **Why:** Standardizes REST response envelopes, cursor pagination (`next_cursor`), idempotency keys for write operations, and error contract parity.
  * **When:** Adding new routes for student document uploads, registrar sector dispatching, or bulk review actions.
* **Skill:** `/data-storage`
  * **Why:** Enforces indexing strategies, foreign key cascade behaviors, and query optimization before schema migrations.

### 3. Structural Refactoring Without Regressions
* **Skill:** `/safe-refactor`
  * **Why:** Enforces behavioral equivalence brackets (tests run $\rightarrow$ surgical move $\rightarrow$ tests verify) when consolidating duplicate components or refactoring large controllers.
* **Skill:** `/defense-in-depth`
  * **Why:** Eliminates silent runtime failures by placing validations at three tiers: Zod schema at route boundary, domain entity type checks in service layer, and constraints in the database.

### 4. Code Quality & Pre-Merge Confidence
* **Skill:** `/verification-before-completion`
  * **Why:** Strictly forbids claiming a task or bug fix is done until exact test and build commands run and return exit code 0 with positive evidence.
* **Skill:** `/code-review`
  * **Why:** Dispatches two parallel review sub-agents: one verifying repo standards and one verifying the feature spec.

---

## 3. Recommended Everyday Workflow Chains

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. New Feature / UI Flow                                               │
│    /grill-with-docs ──► /to-spec ──► /implement-spec                    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Deep Backend Bug / Crash                                            │
│    /root-cause-tracing ──► /defense-in-depth ──► /verification-before-completion │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Refactoring Duplicated Code                                         │
│    /caveman-explore ──► /safe-refactor ──► /ponytail-audit                 │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Complex Multi-Step Task                                             │
│    /writing-plans ──► /subagent-driven-development stay on main           │
└────────────────────────────────────────────────────────────────────────┘
```
