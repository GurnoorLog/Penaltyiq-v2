# PenaltyIQ

PenaltyIQ is a penalty-kick trainer for soccer players. You record a kick from your phone or webcam, and it tracks your body with MediaPipe pose estimation, scores your technique from 0–100, and gives you coaching feedback. No motion-capture lab, no GPU, no cloud uploads. The analysis runs on your own device, so your footage stays yours.

## Features

- **Live skeleton overlay** — MediaPipe tracks 33 body landmarks and draws them over the athlete in real time.
- **Technique Fingerprint** — a 0–100 score built from weighted, per-metric measurements rather than a black box.
- **AI coaching** — the measurements get explained in plain language: one main correction, one thing you did well, one next step.
- **Record & upload** — a webcam recording studio for self-drills, video import, and a persistent local gallery.
- **Session history** — every analysis is saved locally so you can look back and compare.
- **Local-first processing** — biomechanics are computed on-device; athlete footage is never sent to a cloud service.

## Gallery

<div align="center">
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (7).jpg" />
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (8).jpg" />
</div>
<div align="center">
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (9).jpg" />
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (10).jpg" />
</div>
<div align="center">
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (11).jpg" />
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (12).jpg" />
</div>
<div align="center">
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (13).jpg" />
  <img width="400" alt="PenaltyIQ screenshot" src="assets/gallery (14).jpg" />
</div>

---

## What it does

You load a video of a kick, or record one. PenaltyIQ plays it, tracks 33 body landmarks with MediaPipe, and draws a live skeleton over the athlete. While the kick plays it measures balance, plant-leg mechanics, hip drive, strike-leg positioning, and follow-through, then folds those into a 0–100 **Technique Fingerprint** with per-metric sub-scores. An AI coaching layer explains the numbers in plain language — a main correction, a positive observation, and a next step. The whole pipeline runs locally, so your footage is never uploaded to a cloud service.

The fingerprint is a weighted sum of normalized measurements:

$$
S = \sum_{i=1}^{n} w_i m_i
$$

where \(m_i\) is one technique metric and \(w_i\) is its weight, with:

$$
\sum_{i=1}^{n} w_i = 1
$$

I made the score a weighted sum rather than a model's guess so athletes can see exactly what went into it.

## How I built it

PenaltyIQ is a pipeline of four parts: pose tracking, a biomechanics engine, an AI coach, and the interface.

**Pose tracking.** MediaPipe runs over the video and outputs 33 body landmarks with normalized x, y, and depth coordinates for the shoulders, hips, knees, ankles, feet, and the rest. The landmarks get drawn back over the footage so you can see what the system is watching.

**Biomechanics engine.** I deliberately didn't ask a language model to invent a score from raw coordinates. The technique measurements come from deterministic geometry:

* Trunk lean
* Shoulder alignment
* Plant-knee flexion
* Hip and shoulder separation
* Strike-leg extension
* Ankle movement
* Balance and follow-through

Those get normalized and combined into the fingerprint and its sub-scores. This part is math, not a guess.

**Local AI coaching.** The measurements are passed to the coaching layer as structured data. It doesn't touch the geometry; its job is to translate the numbers into feedback an athlete can act on. If your plant-leg score is low, it says your plant knee may need more flexion for a stable contact, instead of just dumping a number at you.

**Interface.** The dashboard keeps the video, the skeleton, live metrics, the fingerprint, coaching, and history in one place. I went with a bold, high-contrast look so results are readable at a glance — which mattered during the hackathon demo, when people had maybe ten seconds.

## Challenges I ran into

**Tracking a fast kick.** Penalties are quick: rapid leg swing, motion blur, changing body angles, landmarks disappearing. Pose estimation wobbles when an athlete moves fast or steps out of frame. I got more reliable results by testing with clear side-angle footage, keeping the full body in view, and treating tracking confidence as part of the analysis.

**Turning landmarks into feedback.** Raw coordinates mean nothing to a player. The hard part was collapsing dozens of joint values into a handful of technique measurements — deciding which relationships actually matter, normalizing them across body sizes and camera distances, and resisting the urge to report fake precision.

**Keeping the score stable.** The metrics change every frame while the video plays. I separated the live movement estimates from the final fingerprint so it's always clear whether the score is still updating or finished.

**Local AI integration.** Wiring up the coaching layer took more than generating text: structured prompts, response formatting, processing time, fallback behavior. It was worth it — the core analysis runs locally, and no athlete footage ever goes to a server.

**Design vs. depth.** The app is technically dense, but judges and athletes had to get it in seconds. I kept raw coordinates, terminal output, and jargon out of the UI while still showing the processing was real.

**Hackathon scope.** There was a long list of tempting extras — automatic contact detection, comparison mode, fancier reports, multi-sport support. I cut most of them so the core workflow actually worked end to end.

## Accomplishments I'm proud of

The prototype isn't a static dashboard. It analyzes a kick while the video plays, renders the skeleton over the athlete, updates metrics live, produces the full fingerprint with sub-scores, writes coaching feedback and a structured report, saves sessions for review, and runs the core pipeline locally.

The thing I'm most proud of is separating the biomechanics from the AI explanation. The geometry engine measures the movement; the AI coach explains the result. That split keeps the whole thing transparent and defensible.

## What I learned

You don't need a language model for every part of an AI product. Computer vision finds the landmarks. Deterministic math computes the angles. A language model is useful at exactly one point: turning measurements into feedback an athlete can act on.

Explainability matters in sports analysis. A score alone is worthless — athletes want to know why they got it, which movement dragged it down, what they did well, and what to change.

Analyzing fast athletic movement from a single camera is genuinely hard. Camera position, lighting, video quality, frame rate, and landmark visibility all change the result.

And presentation is part of engineering. A technically impressive pipeline is wasted if users can't understand what it's doing or trust the output.

## What's next for PenaltyIQ

The near-term focus is making the core analysis more accurate and reliable.

- **Automatic contact-frame detection** — use ankle-velocity changes to guess the ball-contact frame automatically, with manual correction available.
- **Before-and-after comparison** — put two kicks side by side and see exactly which technique metrics improved or dropped.
- **Better reports** — clearer contact-frame visuals, coaching summaries, and shareable progress reports.
- **Smarter history** — progress charts, filters, and local before-and-after comparisons.
- **Confidence-aware feedback** — flag poor camera angles, missing landmarks, and motion blur before generating a final score.
- **Coach mode** — a faster way to review athletes, compare attempts, and spot repeated technique problems.
- **Mobile capture** — record, analyze, and review a kick directly from the field.
- **Other movements** — the architecture is built around configurable technique profiles, so free kicks, football shooting, golf swings, tennis serves, and sprint starts could plug in later.

Long term, I want private, explainable athletic analysis to work anywhere there's a camera and a computer.