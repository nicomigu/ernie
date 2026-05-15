---
description: Run the Explore → Plan → Execute pipeline for a feature. Use for anything > 30 min of work.
allowed-tools: Read, Task
---

# /feature — Explore-Plan-Execute pipeline

For implementing a new feature or non-trivial change.

## Steps

1. Confirm the feature description with the user in one sentence.
2. Invoke the `planner` subagent with the feature description.
3. Show the user the plan. Ask: "Approve this plan? (y/n/edit)"
4. If approved, invoke the `builder` subagent with the plan.
5. After builder reports done, decide if tests are needed:
   - YES if scheduler code, repository code, or critical business logic changed
   - NO if trivial UI tweaks, copy changes, or styling-only
6. If tests are needed, invoke the `tester` subagent.
7. Invoke the `reviewer` subagent.
8. Show the reviewer's verdict to the user.
9. If approved, suggest running `/ship` to commit.

## Notes

- If the user says "edit" after the plan, iterate on the plan with them before invoking the builder.
- If the reviewer says CHANGES REQUIRED, send the issues back to the builder and re-run reviewer after.
- The tester step is optional but skipping it for FSRS or repository code is a bad idea.
- Don't skip steps. The pipeline is the point.
