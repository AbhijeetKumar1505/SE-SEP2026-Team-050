# Milestone 2 wireframes

Figma file: [Team 050 · Mentoring Platform · M2 Wireframes](https://www.figma.com/design/uMCQOPPplKpOaj7ErhVysd)

The file sits in Abhijeet Kumar's Figma drafts. Use **Share** in Figma to give the rest of the team access.

## What is in the file

| Page | Contents |
|---|---|
| Wireframes + prototype | 25 desktop screens (1440 px) for the four roles, each with a yellow spec-notes card underneath |
| Wireframe kit | The components every screen uses: icons, button, badge, tag, input, textarea, checkbox/radio, toggle, avatar and the role navbar. Colours come from the "Wireframe tokens" variables |

| Code | Screen | User stories |
|---|---|---|
| A1–A4 | Log in, student sign-up, verify email, mentor activation | US-01, US-14 |
| S1–S7 | Profile, submit problem, dashboard (in progress / mentor assigned), mentorship workspace, feedback dialog, change or end request | US-02, US-03, US-05–US-08, US-11, US-20, US-21 |
| M1–M6 | Mentor dashboard, decline dialog, availability and contact, mentorship workspace, log session dialog, end mentorship dialog | US-06, US-09–US-13 |
| I1–I7 | Problem queue, review and assign, mentor pool, registered students, monitoring, case page, settings and topic tags | US-04, US-07, US-14–US-18, US-20, US-21 |
| L1 | Programme insights | US-19 |

All 21 user stories are covered. Screen content follows the M1 report (Section 3 stories and Section 4 client clarifications) and the M2 component design (C1–C14, F1–F5).

## Finishing the prototype

The screens were built through the Figma MCP connector, which stopped at the Starter plan's tool-call limit before the last step. The `figma-finish-plugin` folder holds a local plugin that does that step:

- wires every button, link, dialog and navbar item for click-through
- adds the prototype flows: Login, Student journey, Mentor journey, IIC coordinator and Programme leadership
- adds the "00 · Cover — start here" frame (how to use the file, core flow, screen index, kit-to-React-Bootstrap mapping) and makes it the file thumbnail
- groups the screens into one section per role

To run it (Figma desktop app only, takes a few seconds):

1. Open the Figma file in the desktop app.
2. Go to **Plugins → Development → Import plugin from manifest…** and choose `figma-finish-plugin/manifest.json`.
3. Run **Plugins → Development → Team 050 - finish wireframe prototype**.
4. A message at the bottom reports how many links were made. Then press **Present** and pick a flow.

You can run it more than once: it overwrites the links and creates the cover and sections only once.
