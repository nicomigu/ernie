---
description: Design + build a screen end-to-end. Invokes designer, planner, builder, reviewer in sequence.
allowed-tools: Read, Task
---

# /screen — Design then build a screen

For building a new screen from scratch.

## Steps

1. Confirm the screen description with the user in one sentence.
2. Invoke the `designer` subagent with the screen description.
3. Show the user the design spec. Ask: "Approve this design? (y/n/edit)"
4. If approved, invoke the `planner` subagent with both the design spec and the implementation context.
5. Show the user the plan. Ask: "Approve this plan? (y/n/edit)"
6. If approved, invoke the `builder` subagent with the plan.
7. After builder reports done, invoke the `reviewer` subagent.
8. Show the reviewer's verdict.
9. If approved, suggest `/ship`.

## Notes

- If the user says "edit" on the design, iterate with the designer before moving to planner.
- The design spec becomes part of the planner's input — they must produce a plan that implements that specific design.
- Don't skip steps. The full pipeline is the point.
- After step 9, encourage testing on real device before committing if the screen has substantial UX (review session, note editor, etc.).
