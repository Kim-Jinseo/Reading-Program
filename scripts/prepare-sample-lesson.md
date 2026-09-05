# Classroom sample preview

The application imports `server/sampleLesson.js`. Its `sampleAssets` export comes from the generated `server/sampleLessonMedia.js` module, so production needs no PowerPoint or image conversion dependency.

The starter collection is Summer 2026, Level 2. Those are editable application labels, not dates claimed by the original deck. The sample contains four vocabulary items, three Who/What/Where questions, one speaking sentence, and a short writing prompt.

## Source and selection

Source: `HCR L2.1 Our classroom.pptx`, 27 slides, 17,981,127 bytes.

SHA-256: `E99539C52E653B98FED365D029155DD250563C04DCA2BA95A4A3A7DBF2267AF4`

| Student page | Source slide | Purpose | WebP bytes |
| --- | --- | --- | ---: |
| 1 | 8 | Our classroom title and photo | 44,476 |
| 2 | 6 | Where are you now? | 74,912 |
| 3 | 12 | Furniture words with pictures | 48,858 |
| 4 | 14 | Is there a blackboard? | 48,228 |
| 5 | 17 | Are there any pictures? | 45,296 |
| 6 | 18 | Desks and chairs | 82,152 |
| 7 | 20 | Describe the classroom picture | 63,264 |
| 8 | 24 | Picture-only vocabulary recall | 37,252 |

All images are 1440 × 810 WebP, quality 86. Total image payload: **444,438 bytes**. Largest image: **82,152 bytes**. The generated JavaScript module, including base64 overhead, is **593,583 bytes**. Assets are generated independently so the server can deliver one image at a time.

Teacher setup, greetings, attendance, repeated reward pages, and the closing page are omitted. The exporter removes exact teacher-note and timing/title-label text shapes only from a temporary in-memory render view. It preserves the source lesson text, diagrams, photos, and Stepping Stones copyright mark. Static renders show the completed animation state, including the source deck's model answers. The original PowerPoint is opened read-only, never saved, and hashed before and after export. Macros are disabled during opening.

## Rebuild on this workstation

Requirements: the installed Microsoft PowerPoint, PowerShell, and the bundled Codex Node runtime with `sharp`. No LibreOffice, Python drawing, network access, or media download is needed. Run the following from the project root in a desktop-session terminal:

```powershell
$sampleSource = 'C:/path/to/HCR L2.1 Our classroom.pptx'
$sampleNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
./scripts/prepare-sample-lesson.ps1 -Source $sampleSource -Mode StudentPreview
& $sampleNode ./scripts/prepare-sample-lesson.mjs prepare
& $sampleNode ./scripts/prepare-sample-lesson.mjs verify
```

Supply the local source with `-Source`; private attachment paths are not stored in the repository. The student export checks its fingerprint before using the reviewed slide selection. A new or revised deck needs a new content review rather than silently reusing these page numbers.

If the sandbox cannot create PowerPoint's automation session and reports `0x80070520`, rerun the same export with approved desktop-session access. Do not modify Windows configuration or install another office package. The script opens no presentation window, preserves an already-running PowerPoint instance, restores its automation settings, and closes only its own presentation.

To reproduce source inspection and contact sheets, run:

```powershell
./scripts/prepare-sample-lesson.ps1 -Source $sampleSource -Mode Inspect
./scripts/prepare-sample-lesson.ps1 -Source $sampleSource -Mode Export
& $sampleNode ./scripts/prepare-sample-lesson.mjs contact
```

`contact` creates three QA sheets in source order, slides 1–9, 10–18, and 19–27. Rendered and optimized files, plus a size manifest, live under `artifacts/class-lessons/`; they are private build artifacts and are not needed at runtime. To use another bundled dependency location, set `RUNTIME_NODE_MODULES` to its absolute `node_modules` directory before invoking the JavaScript script.

## Verification

All 27 source slides were inspected in contact sheets. All eight final compressed images were opened and inspected individually. Teacher-only text is absent from selected pages and the source copyright mark remains visible. The questions refer explicitly to student pages 2 and 7; the deck does not establish a time, so no unsupported When question was added.

The `verify` command imports the real application module, checks the agreed collection/lesson shape, confirms unique choice identifiers and exactly one keyed answer per question, decodes all eight base64 images, and verifies dimensions, formats, individual sizes, and the total payload budget.
