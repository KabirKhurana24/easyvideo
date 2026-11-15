# EasyVideo Change Studio — Demo Prototype

A self-contained, interactive product concept for keeping workplace training videos accurate as source documents change.

## Run it

No build step or dependencies are required. Open `index.html` in a modern browser.

For a local server (optional):

```bash
python -m http.server 4173
```

Then open http://localhost:4173.

## Demo scenario

Workspace: **Northstar People**  
Training video: **Remote Work Essentials** (12 scenes, 4 languages)  
Current version: **1.0**  
New source: `Remote_Work_Policy_v2_demo.txt`  

The seeded comparison detects three changes:

1. Office attendance increases from two to three days per week (scene 03).
2. Planned leave notice changes from five days to ten business days (scene 07).
3. Extended leave approval moves to the People Partner in partnership with the manager (scene 09).

Nine unaffected scenes are preserved. Accept or reject each change, inspect/edit the suggested copy, regenerate a visual preview, review the four language variants, and publish a local version 1.1 history entry.

## Prototype boundaries

- All project, scene and localization data is demo data held in browser memory.
- Uploading a source file updates the displayed file metadata only. The comparison results are pre-seeded; no real document parsing or AI inference runs.
- Scene regeneration is represented by an interactive preview state, not generated video.
- Localization QA is illustrative and is not a substitute for fluent-speaker review.
- Publishing only adds a version history entry in this prototype. It does not publish a real video or send notifications.
- Reset demo restores the original seeded state.

## Product hypothesis

**Change Studio helps L&D teams maintain existing training content, not only create it.** The prototype explores source-aware scene mapping, selective regeneration, human approval, localization QA and version history.
