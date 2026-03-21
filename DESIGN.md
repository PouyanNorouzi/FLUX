# Design System: FLUX - The Brutalist Recipe Vault
**Project ID:** 11194656032120127225  
**Source Screens:** Terminal Entry, Vault Index, Recipe Schematic, Ingest Form, PRD panel

## 1. Visual Theme & Atmosphere

FLUX is a **brutalist operator console for recipe data**, not a lifestyle cooking app. The product mood is intentionally industrial: hard contrast, exposed structure, strict geometry, and command-line language that makes users feel like they are interfacing directly with a C database over TCP.

The atmosphere is:
- **Raw and utilitarian**: no decorative softness, minimal ornament, highly explicit labels.
- **Technical and dense**: visible system states, table/grid structures, indexed records, procedural flow.
- **Monochrome with hazard accent**: mostly black, white, and gray with one high-energy orange for action and alerts.
- **Mechanical and immediate**: quick state transitions, hard hover shifts, and tactile offset shadows.

Design philosophy in one line: **interface as instrument panel**.

## 2. Product Intent Alignment (From PRD)

The design directly supports the PRD narrative:
- Showcase backend credibility for portfolio reviewers and engineers.
- Emphasize handshake/query/commit workflows as first-class interactions.
- Preserve a "zero-fluff" reading of data operations.

Primary flows reflected in UI language:
- **Database Handshake**: terminal framing, auth token vocabulary, connection status chips.
- **Query Execution**: command-style search, high-density data table, latency and port telemetry.
- **Data Commit**: ingest form sections, array-indexed rows, explicit write actions, system acknowledgements.

## 3. Color Palette & Semantic Roles

### Core Foundation
- **Signal Black** (#000000): Primary structural ink for borders, headers, body text, table lines, and hard shadows.
- **Cold Console White** (#FFFFFF): Main background and high-contrast content base.
- **Machine Surface Gray** (#F4F4F4): Secondary plane for sidebars, toolbars, and field backgrounds.
- **Quiet Telemetry Gray** (#808080): Muted metadata, passive labels, and low-priority status text.
- **Gridline Mist** (#F0F0F0): Background graph-paper texture and low-visibility structural guides.
- **Divider Gray** (#E0E0E0): Skeleton striping and subtle separation patterns.

### Accent and Feedback
- **Molten Commit Orange** (#F24A0D): Primary action emphasis, active indicators, warning rails, interactive focus moments.
- **Daemon Green Pulse** (#00FF00): Live connection indicator and system-alive signal.

### Usage Rules
- Keep accent ratio low: orange should feel urgent, not ambient.
- Use black and white for 80-90% of visible UI mass.
- Restrict green to binary online health states.

## 4. Typography Rules

### Font Stack
- **Display/UI Headline Family:** Space Grotesk
- **Operational/Data Family:** IBM Plex Mono

### Hierarchy
- **H1/H2 and command headlines:** Space Grotesk bold, uppercase, tighter tracking for compressed energy.
- **Body data, metadata, and system strings:** IBM Plex Mono regular to medium.
- **Micro labels and telemetry strips:** IBM Plex Mono at very small sizes with widened tracking and uppercase transformation.

### Tone Rules
- Prefer **operator vocabulary** over human-friendly copy (example pattern: AUTH_TOKEN, WRITE MODE, SYS_READ_ONLY).
- Keep labels short, declarative, and machine-adjacent.

## 5. Geometry, Shape, and Edge Language

### Corner Philosophy
- Predominantly **sharp, squared-off edges** (0px radius) across forms and containers.
- Rare tiny rounding appears in some chips or badges; treat as exception, not default.

### Border System
- **Heavy frame:** 4px black border for primary modules and critical controls.
- **Secondary frame:** 2px black border for inputs, chips, and inner controls.
- **Hairline separators:** 1px rules for row dividers and minor segmentation.

### Shape Translation for Prompting
- Use phrasing such as:
  - "hard-edged rectangular modules"
  - "square industrial control buttons"
  - "zero-radius input fields with thick black outlines"

## 6. Depth, Elevation, and Motion

### Elevation Model
- FLUX uses **hard-offset shadow depth**, not soft blur depth.
- Standard elevation: 4px by 4px black offset.
- Hover elevation: 6px by 6px black offset with small opposing translation.
- Active/pressed state often collapses toward zero offset to simulate mechanical depression.

### Motion Character
- Motion is fast and purposeful, never ornamental.
- Common patterns:
- slight lift or offset on hover for buttons,
- directional icon nudge,
- pulse on status dots,
- occasional alert bounce for error toasts,
- terminal cursor blink.

Animation should communicate **system state**, not delight.

## 7. Component Stylings

### Buttons
- **Primary commit/write:** Molten Commit Orange background with black text or black background with white text depending on context hierarchy.
- **Shape:** square corners; thick black border; hard shadow.
- **Interaction:** lift on hover; compressed offset on active; optional icon leading the label.
- **Copy style:** bracketed or command-like actions (for example, WRITE TO POUDB).

### Inputs and Textareas
- Surface is light gray or white with black border.
- Focus state can switch border/shadow toward orange to indicate active write-target.
- Placeholder text stays muted and technical.

### Data Tables and Rows
- Dense horizontal records with strong separators.
- Header row uses uppercase mono labels and explicit column naming.
- Row hover inverts aggressively (black background with white text) to communicate active probe/selection.

### Tags, Chips, and Badges
- Thin bordered capsules or squared chips, uppercase mono text.
- Active tag states invert to black or orange emphasis.

### Cards and Panels
- Large modules boxed by 4px borders.
- Interior sections segmented by heavy dividers and strict title bars.
- Content blocks favor list and procedural formats over prose styling.

### Toasts and Alerts
- Alert panels use orange as high-priority background with thick black frame and bold system labels.
- Message copy should mimic machine logs and daemon output.

## 8. Layout Principles

### Structural Grids
- Frequent split-pane compositions (for example, approximately 20/80 and 50/50 layouts).
- Desktop-first density with mobile collapse into vertical stacks.
- Strong perimeter framing around each major zone.

### Spacing Rhythm
- Tight-to-medium spacing, prioritizing information density over breathing-room minimalism.
- Repeated modular intervals in paddings and gaps create predictable scan patterns.

### Alignment Strategy
- Left alignment dominates for data readability.
- System strips and status bars use distributed alignment for telemetry at a glance.

### Responsive Behavior
- Core brutalist language remains intact across breakpoints.
- On smaller screens, hierarchy is preserved by stacking regions, not by softening the design.

## 9. Iconography and Micro-Visuals

- Material Symbols are used as utilitarian indicators, not decorative illustrations.
- Icons are paired with text labels to reduce ambiguity.
- Grid and hatch backgrounds reinforce "engine room" texture.

## 10. Voice and Content Style

Write UI text in a terse, technical voice:
- Use uppercase labels for system controls and state strips.
- Favor nouns and command verbs (INGEST, EXECUTION, METADATA, WRITE, QUERY).
- Error/success copy should resemble protocol responses.

## 11. Accessibility and Legibility Guardrails

- Maintain high contrast as a default behavior, especially for data rows and action controls.
- Ensure interactive controls meet minimum touch target size, even with dense layouts.
- Preserve visible focus treatments in keyboard flows (black or orange offset emphasis).
- Keep micro-text readable through spacing and contrast, not just font size reduction.

## 12. Prompting Appendix for Stitch Consistency

When generating new FLUX screens, describe style with semantic language like:
- "Brutalist industrial operator console for a recipe database."
- "Monochrome architecture with a single hazard orange action accent (#F24A0D)."
- "Hard-edged modules with 4px black borders and offset mechanical shadows."
- "Dense, telemetry-first layout with mono metadata strips and command-line microcopy."
- "Interaction feedback should feel mechanical: lift, press, invert, and pulse."

Component prompt examples:
- "Create a two-pane recipe inspection screen with heavy black dividers, procedural numbering, and mono data tags."
- "Design a commit workflow panel using square inputs, indexed array rows, and a high-contrast write button in Molten Commit Orange (#F24A0D)."
- "Build a query dashboard with a command-style search field, dense data table, and top telemetry ticker showing latency and port."

## 13. System Summary

FLUX's design system is best understood as **Brutalist Data Ops for culinary records**: hard geometry, machine language, and decisive visual hierarchy. Every stylistic decision should reinforce one idea: users are operating a serious data instrument, not browsing a lifestyle feed.
