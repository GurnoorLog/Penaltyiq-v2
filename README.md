## Inspiration
Penalty kicks look simple from the outside, but a successful strike depends on balance, plant-leg stability, hip rotation, body positioning, contact mechanics, and follow-through.

Professional athletes can access motion-capture laboratories, performance analysts, and experienced coaches. Most amateur and youth players cannot. They often record themselves on a phone, replay the same clip, and still cannot identify exactly what went wrong.

That gap inspired **PenaltyIQ**.

We wanted to build a system that could turn an ordinary football video into structured, understandable technique feedback without requiring expensive equipment, a GPU, or a constant internet connection. Our goal was not to replace coaches or claim laboratory-level precision. It was to give more athletes access to consistent, explainable feedback using hardware they may already own.

## What it does
PenaltyIQ analyzes a football penalty kick from an uploaded video or webcam feed.

The application:

1. Plays the athlete's kick inside the analysis workspace.
2. Uses MediaPipe to track 33 body landmarks throughout the movement.
3. Renders a live skeleton overlay on top of the athlete.
4. Measures movement factors such as balance, plant-leg mechanics, hip drive, strike-leg positioning, and follow-through.
5. Converts those measurements into a 0–100 **Technique Fingerprint**.
6. Displays individual sub-scores so the athlete can understand what helped or hurt the final result.
7. Uses an AI coaching layer to explain the measurements in plain language, including a main correction, a positive observation, and a practical next step.
8. Displays local-engine status and processing performance information.
9. Keeps the core analysis on the user's device instead of sending athlete footage to a cloud service.

The Technique Fingerprint is calculated from a weighted combination of normalized movement measurements:

$$
S = \sum_{i=1}^{n} w_i m_i
$$

where \(m_i\) is an individual technique metric and \(w_i\) is its assigned weight, with:

$$
\sum_{i=1}^{n} w_i = 1
$$

This approach makes the final score more transparent than an unexplained black-box prediction.

## How we built it
We designed PenaltyIQ as a local sports-analysis pipeline with several connected layers.

### Pose tracking
MediaPipe processes the uploaded video and detects 33 body landmarks. These landmarks provide normalized \(x\), \(y\), and depth-related coordinates for important joints such as the shoulders, hips, knees, ankles, and feet.

The landmarks are drawn over the original footage so the athlete can see what the system is tracking.

### Biomechanics engine
Instead of asking a language model to invent a score from raw coordinates, we calculate technique measurements using deterministic geometry.

The system uses landmark relationships to estimate factors such as:

* Trunk lean
* Shoulder alignment
* Plant-knee flexion
* Hip and shoulder separation
* Strike-leg extension
* Ankle movement
* Balance and follow-through

These values are normalized and combined into the Technique Fingerprint and its sub-metrics.

### Local AI coaching
The calculated measurements are formatted as structured data and passed to the coaching layer, which interprets the results and produces clear feedback.

The AI does not calculate the body geometry. Its role is to interpret the measurements and turn them into coaching feedback that is easier for an athlete to understand.

For example, rather than only displaying a low plant-leg score, PenaltyIQ can explain that the athlete may need more knee flexion to improve stability at contact.

### Interface

We created a sports-focused dashboard that combines:

* Video playback
* Pose visualization
* Dynamic technique metrics
* Technique Fingerprint scoring
* Coaching recommendations
* Analysis history
* Local processing indicators

We used a bold, high-contrast visual system so the important results can be understood quickly during both normal use and a live hackathon demonstration.

## Challenges we ran into

### Tracking fast movement
Penalty kicks involve rapid leg movement, motion blur, changing body angles, and partial landmark obstruction. Pose estimation can become less stable when the athlete moves quickly or leaves the camera frame.

We improved reliability by testing with clearer side-angle footage, ensuring the full body remained visible, and treating tracking confidence as an important part of the analysis.

### Turning landmarks into meaningful feedback
Raw pose coordinates are not useful to most athletes. One of our largest challenges was converting dozens of landmark values into a small set of understandable technique measurements.

We had to determine which relationships mattered most, how to normalize them across different body sizes and camera distances, and how to avoid presenting misleading precision.

### Keeping the score stable
The metrics can change while the video is playing because the athlete's body is moving frame by frame. We had to separate live movement estimates from the final Technique Fingerprint so users would understand when a score was still updating and when the final result had been generated.

### Local AI integration
Integrating the coaching layer was more difficult than generating static feedback. We had to manage structured prompts, response formatting, processing time, and fallback behavior.

Solving this challenge became one of the project's most important differentiators because the core analysis can run locally without sending private athlete footage to an external service.

### Balancing design and technical depth
PenaltyIQ contains several technically complex components, but judges and athletes still need to understand the product in seconds.

We had to avoid overwhelming the interface with raw coordinates, terminal output, and technical terminology while still proving that the underlying processing was real.

### Building within hackathon time limits
We had many possible directions, including automatic contact detection, comparison mode, more advanced reports, richer session-history tools, and multi-sport support. The challenge was deciding which features strengthened the core experience and which ones would distract us from delivering a reliable workflow.

## Accomplishments that we're proud of
We are proud that PenaltyIQ became more than a static sports dashboard.

Our working prototype can:

* Analyze an athlete while the uploaded kick is actively playing
* Render a pose skeleton over the player
* Update movement metrics during playback
* Generate a complete Technique Fingerprint
* Break the result into understandable sub-metrics
* Produce detailed coaching feedback
* Generate a structured technique-analysis report
* Preserve previous analysis sessions for progress review
* Present the results through a cohesive sports-analysis interface
* Run the core analysis pipeline locally instead of depending entirely on cloud infrastructure

We are especially proud of separating the biomechanics calculations from the AI explanation layer. This makes the system more transparent and technically defensible.

The geometry engine measures the movement. The AI coach explains the result.

## What we learned
We learned that a strong AI product does not need to use a language model for every part of the system.

Computer vision is better for detecting body landmarks. Deterministic mathematics is better for calculating angles and movement relationships. A language model is most useful when it converts those measurements into clear and actionable feedback.

We also learned that explainability is essential in sports analysis. A score alone is not enough. Athletes need to know:

* Why they received the score
* Which movement affected it
* What they did well
* What they should change next

We learned how difficult it is to analyze fast athletic movement from a single camera angle. Camera position, lighting, video quality, frame rate, and landmark visibility all influence the result.

Finally, we learned that presentation is part of engineering. A technically impressive pipeline has less impact if users cannot understand what is happening or trust the output.

## What's next for PenaltyIQ
Our next priority is improving the accuracy, reliability, and usefulness of the core penalty-kick analysis.

Planned improvements include:

### Automatic contact-frame detection
Use ankle-velocity changes and movement patterns to suggest the most likely ball-contact frame automatically, while still allowing manual correction.

### Before-and-after comparison
Allow athletes to compare two kicks side by side and see exactly which technique metrics improved or declined.

### Technique reports
Expand the current report system with clearer contact-frame visuals, coaching summaries, and shareable athlete progress reports.

### Session history
Improve the current session-history system with stronger progress charts, filters, and local before-and-after comparisons.

### Confidence-aware feedback
Detect poor camera angles, missing landmarks, motion blur, and partial body visibility before generating a final score.

### Coach mode
Give coaches a faster way to review multiple athletes, compare attempts, and identify repeated technique problems.

### Mobile capture
Create a mobile-friendly workflow that allows an athlete to record, analyze, and review a kick directly from the field.

### Additional movement profiles
Penalty kicks are our starting point. The underlying architecture could later support free kicks, football shooting, golf swings, tennis serves, sprint starts, and other movements through configurable technique profiles.

Our long-term vision is to make private, explainable athletic analysis available anywhere an athlete has access to a camera and a standard computer.
