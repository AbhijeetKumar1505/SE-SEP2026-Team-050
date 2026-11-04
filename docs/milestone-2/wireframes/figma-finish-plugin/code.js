// Finishes the Team 050 M2 wireframe file:
//   1. wires the click-through prototype (buttons, links, dialogs, navbar)
//   2. adds the prototype flows (Login, Student, Mentor, IIC, Leadership)
//   3. adds the "00 · Cover — start here" frame
//   4. groups the screens into one Figma section per role
// Safe to run more than once: reactions are overwritten, the cover and sections are only created once.

const PAGE = 'Wireframes + prototype';
const COVER = '00 · Cover — start here';
const NAV = {
  S: { 'Dashboard': 'S3', 'My problem': 'S2', 'Mentorship': 'S5', 'Profile': 'S1' },
  M: { 'Dashboard': 'M1', 'Mentorships': 'M4', 'Availability & contact': 'M3' },
  I: { 'Problem queue': 'I1', 'Mentor pool': 'I3', 'Students': 'I4', 'Monitoring': 'I5', 'Cases': 'I6', 'Settings': 'I7' },
  L: { 'Programme insights': 'L1' }
};
const HOME = { S: 'S3', M: 'M1', I: 'I1', L: 'L1' };
const DIALOGS = ['S6', 'S7', 'M2', 'M5', 'M6'];
const FLOWS = [['A1', 'Login (all roles)'], ['A2', 'Student journey'], ['A4', 'Mentor journey'], ['I1', 'IIC coordinator'], ['L1', 'Programme leadership']];
const GROUPS = [['A', '1 · Sign-in & onboarding'], ['S', '2 · Student'], ['M', '3 · Mentor'], ['I', '4 · IIC coordinator'], ['L', '5 · Programme leadership']];
const FADE = { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 };
const BADGE_SET_ID = '3:154';
const ARROW_ICON_ID = '3:15';

const W = { r: 'Regular', m: 'Medium', s: 'Semi Bold', b: 'Bold' };
let V = {};
const fill = c => [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[c])];

function go(dest, navigation) {
  return [{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: dest.id, navigation: navigation || 'NAVIGATE', transition: FADE }] }];
}

async function wirePrototype(page, screens) {
  let links = 0;
  const skipped = [];
  const named = page.findAll(n => /^(link|overlay):[ASMIL]\d$/.test(n.name) || n.name === 'close');
  for (const n of named) {
    try {
      if (n.name === 'close') {
        await n.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'CLOSE' }] }]);
      } else {
        const [kind, code] = n.name.split(':');
        if (!screens[code]) { skipped.push(n.name); continue; }
        await n.setReactionsAsync(go(screens[code], kind === 'overlay' ? 'OVERLAY' : 'NAVIGATE'));
      }
      links++;
    } catch (e) { skipped.push(n.name + ' (' + e.message + ')'); }
  }
  for (const code of Object.keys(screens)) {
    const role = code[0];
    if (!NAV[role]) continue;
    const frame = screens[code];
    const bar = frame.findOne(n => n.type === 'INSTANCE' && n.name.startsWith('Role='));
    if (!bar) continue;
    const targets = bar.findAll(n => n.name.startsWith('nav/')).map(n => [n, screens[NAV[role][n.name.slice(4)]]]);
    targets.push([bar.findOne(n => n.name === 'Brand'), screens[HOME[role]]]);
    targets.push([bar.findOne(n => n.name === 'User'), screens.A1]);
    for (const [node, dest] of targets) {
      if (!node || !dest || dest === frame) continue;
      try { await node.setReactionsAsync(go(dest)); links++; } catch (e) { skipped.push(code + ' ' + node.name); }
    }
  }
  for (const code of DIALOGS) {
    const d = screens[code];
    if (!d) continue;
    try {
      d.overlayPositionType = 'CENTER';
      d.overlayBackground = { type: 'SOLID_COLOR', color: { r: 0.07, g: 0.09, b: 0.15, a: 0.45 } };
      d.overlayBackgroundInteraction = 'CLOSE_ON_CLICK_OUTSIDE';
    } catch (e) { /* overlay settings are read-only in some API versions; defaults still work */ }
  }
  page.flowStartingPoints = FLOWS.filter(([c]) => screens[c]).map(([c, name]) => ({ nodeId: screens[c].id, name }));
  return { links, skipped };
}

// ---------- cover helpers ----------
function size(n, o) {
  const isAL = 'layoutMode' in n && n.layoutMode !== 'NONE';
  const nw = typeof o.w === 'number', nh = typeof o.h === 'number';
  if (nw || nh) {
    n.resize(nw ? o.w : n.width, nh ? o.h : n.height);
    if (n.type === 'TEXT') n.textAutoResize = nh ? 'NONE' : 'HEIGHT';
    if (isAL && n.parent && n.parent.type !== 'PAGE') { n.layoutSizingHorizontal = nw ? 'FIXED' : 'HUG'; n.layoutSizingVertical = nh ? 'FIXED' : 'HUG'; }
  }
  if (o.w === 'fill') { if (n.type === 'TEXT') n.textAutoResize = 'HEIGHT'; n.layoutSizingHorizontal = 'FILL'; }
}
function box(parent, dir, o) {
  o = o || {};
  const f = figma.createFrame();
  f.layoutMode = dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.clipsContent = false;
  f.name = o.name || (dir === 'h' ? 'Row' : 'Stack');
  f.fills = o.bg ? fill(o.bg) : [];
  f.itemSpacing = o.gap || 0;
  const p = o.p || 0;
  const [pt, pr, pb, pl] = Array.isArray(p) ? (p.length === 2 ? [p[0], p[1], p[0], p[1]] : p) : [p, p, p, p];
  f.paddingTop = pt; f.paddingRight = pr; f.paddingBottom = pb; f.paddingLeft = pl;
  if (o.r) f.cornerRadius = o.r;
  if (o.stroke) {
    f.strokes = fill(o.stroke); f.strokeAlign = 'INSIDE'; f.strokeWeight = 1;
    if (o.bottomOnly) { f.strokeTopWeight = 0; f.strokeLeftWeight = 0; f.strokeRightWeight = 0; f.strokeBottomWeight = 1; }
  }
  if (o.align) f.counterAxisAlignItems = o.align;
  if (o.wrap) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = o.wrap; }
  if (parent) parent.appendChild(f);
  size(f, o);
  return f;
}
function txt(parent, s, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: W[o.wt || 'r'] };
  t.fontSize = o.sz || 14;
  t.characters = String(s);
  t.fills = fill(o.c || 'ink');
  t.lineHeight = { unit: 'PIXELS', value: o.lh || Math.round((o.sz || 14) * 1.45) };
  t.name = String(s).slice(0, 40);
  if (parent) parent.appendChild(t);
  size(t, o);
  return t;
}

async function buildCover(page) {
  const existing = page.findOne(n => n.name === COVER);
  if (existing) return existing;
  const badgeSet = await figma.getNodeByIdAsync(BADGE_SET_ID);
  const arrowIcon = await figma.getNodeByIdAsync(ARROW_ICON_ID);
  const badge = (p, label, tone) => {
    const i = badgeSet.children.find(c => c.name === 'Tone=' + tone).createInstance();
    p.appendChild(i);
    i.setProperties({ [Object.keys(i.componentProperties).find(k => k.startsWith('Label'))]: label });
  };
  const arrow = p => {
    const i = arrowIcon.createInstance(); i.rescale(20 / 24);
    for (const n of i.findAll(n => n.type !== 'FRAME' && 'strokes' in n)) n.strokes = fill('subtle');
    p.appendChild(i);
  };

  const cv = figma.createFrame();
  page.appendChild(cv);
  cv.name = COVER; cv.layoutMode = 'VERTICAL'; cv.fills = fill('surface');
  cv.resize(2400, 100); cv.primaryAxisSizingMode = 'AUTO'; cv.counterAxisSizingMode = 'FIXED';
  cv.paddingTop = cv.paddingBottom = 96; cv.paddingLeft = cv.paddingRight = 120; cv.itemSpacing = 56;

  const hd = box(cv, 'v', { w: 'fill', gap: 16 });
  const lg = box(hd, 'h', { gap: 12, align: 'CENTER' });
  const mk = box(lg, 'h', { w: 44, h: 44, r: 10, bg: 'accent', align: 'CENTER' }); mk.primaryAxisAlignItems = 'CENTER';
  txt(mk, 'M', { sz: 22, wt: 'b', c: 'surface', lh: 26 });
  txt(lg, 'IITM BS Mentoring', { sz: 20, wt: 'b' });
  txt(hd, 'Student Mentoring & Career Support Platform', { sz: 56, wt: 'b', lh: 66, w: 'fill' });
  txt(hd, 'Milestone 2 · Wireframes and clickable prototype · Team 050 · IITM BS Software Engineering, September 2026', { sz: 22, c: 'muted', w: 'fill', lh: 32 });
  const mt = box(hd, 'h', { gap: 8, wrap: 8, w: 'fill' });
  badge(mt, '25 screens · 4 roles', 'Info');
  badge(mt, 'Covers all 21 user stories (US-01 – US-21)', 'Success');
  badge(mt, 'Maps to components C1–C14 · pages F1–F5', 'Purple');
  badge(mt, 'React + React-Bootstrap target', 'Neutral');
  txt(hd, 'Prepared by Khushi Dhankhar (frontend) from the M1 report, client clarifications and the M2 component design · 1 Nov 2026', { sz: 14, c: 'subtle', w: 'fill' });

  const r1 = box(cv, 'h', { w: 'fill', gap: 32 });
  const hw = box(r1, 'v', { w: 'fill', gap: 16, p: 32, r: 14, bg: 'accentSoft' });
  txt(hw, 'How to use this file', { sz: 22, wt: 'b' });
  ['Press Present (▶) at the top right and pick a flow: Login, Student journey, Mentor journey, IIC coordinator or Programme leadership.',
    'Click buttons, nav items and links. Hotspots flash blue when you click outside them. Dialogs open as overlays; ✕ and Cancel close them. Click your name in the navbar to log out.',
    'The yellow “Spec notes” card under each screen lists the rules, validation messages and user stories the frontend must implement.',
    'Every screen is built from the “Wireframe kit” page and the “Wireframe tokens” colour variables, so a change there updates all screens.'
  ].forEach((t, i) => {
    const r = box(hw, 'h', { w: 'fill', gap: 14 });
    const c = box(r, 'h', { w: 28, h: 28, r: 14, bg: 'accent', align: 'CENTER' }); c.primaryAxisAlignItems = 'CENTER';
    txt(c, String(i + 1), { sz: 13, wt: 'b', c: 'surface', lh: 16 });
    txt(r, t, { sz: 16, w: 'fill', lh: 24 });
  });
  const rl = box(r1, 'v', { w: 'fill', gap: 16 });
  txt(rl, 'Roles and where they start', { sz: 22, wt: 'b' });
  [['Student', 'IITM BS student (BSc/BS) on IIC’s roster. Signs up, submits a problem, reaches out to the assigned mentor, tracks goal, sessions and feedback.', 'A2 → S1 … S7'],
    ['Mentor', 'Verified IITM BS graduate added by IIC. Accepts or declines assignments within 72 h, sets availability, logs sessions, sends progress feedback.', 'A4 → M1 … M6'],
    ['IIC coordinator', 'Runs the programme. Keeps the roster, verifies mentors, assigns from recommendations, monitors mentorships, decides cases, changes settings.', 'I1 … I7'],
    ['Programme leadership', 'Sees aggregate demand, supply and outcomes to plan mentor recruitment. Never sees names.', 'L1']
  ].forEach(([a, b, c]) => {
    const r = box(rl, 'h', { w: 'fill', gap: 16, p: [16, 20], r: 10, stroke: 'line', align: 'CENTER' });
    const v = box(r, 'v', { w: 'fill', gap: 4 });
    txt(v, a, { sz: 16, wt: 's' }); txt(v, b, { sz: 14, c: 'muted', w: 'fill' });
    txt(r, c, { sz: 14, wt: 's', c: 'accent' });
  });

  const fl = box(cv, 'v', { w: 'fill', gap: 20 });
  txt(fl, 'Core flow: getting a mentor and keeping it going', { sz: 22, wt: 'b' });
  txt(fl, 'Conversations always happen outside the platform (Google Meet, email or phone). The platform handles matching, tracking and escalation.', { sz: 15, c: 'muted', w: 'fill' });
  const ch = box(fl, 'h', { w: 'fill', gap: 10, align: 'CENTER' });
  const steps = [['Student', 'Signs up & completes profile', 'A2 · A3 · S1', 'accent'], ['Student', 'Submits problem with 1–5 tags', 'S2', 'accent'],
    ['IIC', 'Reviews & assigns from 4 recommendations', 'I1 · I2', 'purple'], ['Mentor', 'Accepts within 72 h (or declines)', 'M1 · M2', 'ok'],
    ['Student', 'Gets contact details, reaches out first', 'S3 · S4', 'accent'], ['Both', 'Goal, next steps, sessions, feedback', 'S5 · M4 · M5', 'ok'],
    ['IIC', 'Monitors flags, resolves cases', 'I5 · I6', 'purple'], ['Leadership', 'Demand vs supply & outcomes', 'L1', 'warn']];
  steps.forEach(([who, what, codes, c], i) => {
    const b = box(ch, 'v', { w: 'fill', gap: 6, p: 16, r: 10, stroke: 'line', bg: 'canvas' });
    const t = box(b, 'h', { gap: 6, align: 'CENTER' });
    const d = figma.createEllipse(); d.resize(8, 8); d.fills = fill(c); t.appendChild(d);
    txt(t, who.toUpperCase(), { sz: 11, wt: 's', c: 'muted' });
    txt(b, what, { sz: 14, wt: 's', w: 'fill', lh: 20 });
    txt(b, codes, { sz: 12, c: 'accent', wt: 'm' });
    if (i < steps.length - 1) arrow(ch);
  });
  const esc = box(fl, 'h', { w: 'fill', gap: 12, p: [14, 18], r: 10, bg: 'warnSoft', align: 'CENTER' });
  txt(esc, 'Escalations (daily checks):', { sz: 14, wt: 's', c: 'warn' });
  txt(esc, 'no response 48 h → reminder · 72 h → assignment expires, back to top of IIC’s queue · no first session 7 d → reminders, 10 d → flag · 14 d without a held session → Inactive, +7 d → Reassignment needed · feedback 7 d late → Feedback overdue', { sz: 14, w: 'fill' });

  const ix = box(cv, 'v', { w: 'fill', gap: 16 });
  txt(ix, 'Screen index', { sz: 22, wt: 'b' });
  const rows = [['A1', 'Log in (all roles)', 'US-01, US-14', 'F1'], ['A2', 'Student sign-up', 'US-01', 'F2'], ['A3', 'Verify your email', 'US-01', 'F2'], ['A4', 'Mentor account activation', 'US-14', 'F3'],
    ['S1', 'Complete your profile', 'US-02', 'F2'], ['S2', 'Submit your problem', 'US-03, US-20', 'F2'], ['S3', 'Dashboard – request in progress', 'US-05, US-21', 'F2'], ['S4', 'Dashboard – mentor assigned', 'US-05', 'F2'],
    ['S5', 'Mentorship workspace (student)', 'US-06, US-07, US-08, US-11', 'F2'], ['S6', 'Feedback dialog', 'US-08', 'F2'], ['S7', 'Change or end request dialog', 'US-07', 'F2'],
    ['M1', 'Mentor dashboard', 'US-09, US-10', 'F3'], ['M2', 'Decline assignment dialog', 'US-09', 'F3'], ['M3', 'Availability & contact', 'US-10', 'F3'],
    ['M4', 'Mentorship workspace (mentor)', 'US-06, US-11, US-12, US-13', 'F3'], ['M5', 'Schedule / log session dialog', 'US-11', 'F2, F3'], ['M6', 'End mentorship dialog', 'US-13', 'F3'],
    ['I1', 'Problem queue', 'US-16, US-21', 'F4'], ['I2', 'Review & assign (recommendations)', 'US-04, US-16, US-20', 'F4'], ['I3', 'Mentor pool (add, import, verify)', 'US-14', 'F4'],
    ['I4', 'Registered students (roster CSV)', 'US-15', 'F4'], ['I5', 'Monitoring – active mentorships', 'US-17, US-21', 'F4'], ['I6', 'Case – decision page', 'US-18, US-07', 'F4'],
    ['I7', 'Settings & topic tags', 'US-21, US-01, US-03', 'F4'], ['L1', 'Programme insights', 'US-19', 'F5']];
  const tb = box(ix, 'h', { w: 'fill', gap: 32 });
  for (const part of [rows.slice(0, 13), rows.slice(13)]) {
    const t = box(tb, 'v', { w: 'fill', r: 10, stroke: 'line' }); t.clipsContent = true;
    const h = box(t, 'h', { w: 'fill', gap: 16, p: [10, 16], bg: 'canvas', stroke: 'line', bottomOnly: true });
    [['Code', 60], ['Screen', 'fill'], ['User stories', 220], ['Page group', 90]].forEach(([l, w]) => txt(h, l, { sz: 12, wt: 's', c: 'muted', w }));
    part.forEach(r => {
      const row = box(t, 'h', { w: 'fill', gap: 16, p: [10, 16], align: 'CENTER', stroke: 'line2', bottomOnly: true });
      txt(row, r[0], { sz: 14, wt: 'b', c: 'accent', w: 60 }); txt(row, r[1], { sz: 14, w: 'fill' });
      txt(row, r[2], { sz: 13, c: 'muted', w: 220 }); txt(row, r[3], { sz: 13, c: 'muted', w: 90 });
    });
  }

  const r3 = box(cv, 'h', { w: 'fill', gap: 32 });
  const km = box(r3, 'v', { w: 'fill', gap: 12, p: 28, r: 14, stroke: 'line' });
  txt(km, 'Wireframe kit → React-Bootstrap', { sz: 20, wt: 'b' });
  [['Button (Primary / Secondary / Ghost / Danger)', '<Button variant="primary | outline-secondary | link | outline-danger">'],
    ['Badge (status)', '<Badge pill bg="…"> — one shared StatusBadge component'],
    ['Input · Select · Textarea', '<Form.Control> · <Form.Select> · <Form.Control as="textarea"> + <Form.Text>'],
    ['Choice · Toggle', '<Form.Check type="checkbox | radio"> · <Form.Check type="switch">'],
    ['Tag / topic-tag picker', 'Custom TagPicker (1–5 tags, grouped, searchable)'],
    ['Navbar (per role)', '<Navbar> + <Nav> inside the app shell (F1) with role guards'],
    ['Dialog · Banner · Table', '<Modal> · <Alert> · <Table hover> (DataTable with filters)']
  ].forEach(([a, b]) => {
    const r = box(km, 'h', { w: 'fill', gap: 16, p: [8, 0], stroke: 'line2', bottomOnly: true });
    txt(r, a, { sz: 14, wt: 'm', w: 360 }); txt(r, b, { sz: 13, c: 'muted', w: 'fill' });
  });
  const lgd = box(r3, 'v', { w: 'fill', gap: 12, p: 28, r: 14, stroke: 'line' });
  txt(lgd, 'Status colours', { sz: 20, wt: 'b' });
  [['Info', 'In progress: Under review, Planned, Some progress'], ['Warning', 'Needs attention soon: Awaiting response, Pending verification, overdue flags'],
    ['Danger', 'Needs action now: Reassignment needed, Removed, rejected rows'], ['Success', 'Done / healthy: Active, Held, Verified, Goal met'],
    ['Purple', 'IIC-only or special: guidance preferences, Inactive, IIC requests'], ['Neutral', 'Default / no state: Submitted, Not signed up']
  ].forEach(([t, d]) => {
    const r = box(lgd, 'h', { w: 'fill', gap: 16, align: 'CENTER' });
    const b = box(r, 'h', { w: 110 }); badge(b, t, t);
    txt(r, d, { sz: 14, w: 'fill' });
  });
  const nb = box(lgd, 'h', { w: 'fill', p: 14, r: 8, bg: 'note' });
  txt(nb, 'Yellow cards = spec notes for developers (not part of the UI).', { sz: 14, w: 'fill' });
  return cv;
}

function groupIntoSections(page) {
  const made = [];
  for (const [letter, title] of GROUPS) {
    if (page.children.some(n => n.type === 'SECTION' && n.name === title)) continue;
    const re = new RegExp('^(' + letter + '\\d · |Notes · ' + letter + '\\d$)');
    const members = page.children.filter(n => n.type === 'FRAME' && re.test(n.name));
    if (!members.length) continue;
    const minX = Math.min(...members.map(n => n.x)), minY = Math.min(...members.map(n => n.y));
    const maxX = Math.max(...members.map(n => n.x + n.width)), maxY = Math.max(...members.map(n => n.y + n.height));
    const sec = figma.createSection();
    page.appendChild(sec);
    sec.name = title;
    sec.x = minX - 120; sec.y = minY - 160;
    sec.resizeWithoutConstraints(maxX - minX + 240, maxY - minY + 280);
    for (const n of members) {
      const ax = n.x, ay = n.y;
      sec.appendChild(n);
      n.x = ax - sec.x; n.y = ay - sec.y;
    }
    made.push(title);
  }
  return made;
}

async function main() {
  const page = figma.root.children.find(p => p.name === PAGE);
  if (!page) return 'Page "' + PAGE + '" not found';
  await figma.setCurrentPageAsync(page);
  await Promise.all(Object.values(W).map(style => figma.loadFontAsync({ family: 'Inter', style })));
  for (const v of await figma.variables.getLocalVariablesAsync('COLOR')) V[v.name.split('/').pop()] = v;

  const screens = {};
  for (const n of page.findAll(n => n.type === 'FRAME' && /^[ASMIL]\d · /.test(n.name))) screens[n.name.slice(0, 2)] = n;

  const { links, skipped } = await wirePrototype(page, screens);
  const sections = groupIntoSections(page);
  const cover = await buildCover(page);
  const top = Math.min(...page.children.filter(n => n !== cover).map(n => n.y));
  cover.x = -120; cover.y = top - cover.height - 400;
  await figma.setFileThumbnailNodeAsync(cover);
  figma.viewport.scrollAndZoomIntoView([cover]);

  return `Done: ${Object.keys(screens).length} screens, ${links} links, ${sections.length} new sections` + (skipped.length ? ` · skipped: ${skipped.join(', ')}` : '');
}

main()
  .then(msg => figma.closePlugin(msg))
  .catch(e => figma.closePlugin('Error: ' + e.message));
