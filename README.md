# What it does

PenaltyIQ analyzes a football penalty kick from an uploaded video or webcam feed.

The application:
- Plays the athlete's kick inside the analysis workspace.
- Uses MediaPipe to track 33 body landmarks throughout the movement.
- Renders a live skeleton overlay on top of the athlete.
- Measures movement factors such as balance, plant-leg mechanics, hip drive, strike-leg positioning, and follow-through.
- Converts those measurements into a 0 to 100 Technique Fingerprint.
- Displays individual sub-scores so the athlete can understand what helped or hurt the final result.
- Uses a locally running AI coaching engine to explain the measurements in plain language.
- Provides a main correction, a positive observation, and a practical next step.
- Displays system information such as local-engine status and processing performance.
- Keeps the core analysis on the user's device instead of sending athlete footage to a cloud service.

The scoring model is based on a weighted combination of normalized technique measurements:

```text
Technique Fingerprint = Σ(w_i × m_i)
```

where (m_i) represents an individual technique metric, (w_i) represents its weight, and:
```text
Σ w_i = 1
```

The goal is to make the final score understandable rather than presenting an unexplained black-box number.

# How we built it

We designed PenaltyIQ as a local sports-analysis pipeline with several connected layers.

## Pose tracking

MediaPipe processes the uploaded video and detects 33 body landmarks. These landmarks provide normalized (x), (y), and depth-related coordinates for important joints such as the shoulders, hips, knees, ankles, and feet.

The landmarks are drawn over the original footage so the athlete can see what the system is tracking.

## Biomechanics engine

Instead of asking a language model to invent a score from raw coordinates, we calculate technique measurements using deterministic geometry.

The system uses landmark relationships to estimate factors such as:
- Trunk lean
- Shoulder alignment
- Plant-knee flexion
- Hip and shoulder separation
- Strike-leg extension
- Ankle movement
- Balance and follow-through

These values are normalized and combined into the Technique Fingerprint and its sub-metrics.

## Local AI coaching

The calculated measurements are sent as structured data to a locally running AI model through a localhost connection.

The AI does not calculate the body geometry. Its role is to interpret the measurements and turn them into coaching feedback that is easier for an athlete to understand.

For example, rather than only displaying a low plant-leg score, PenaltyIQ can explain that the athlete may need more knee flexion to improve stability at contact.

## Interface

We created a sports-focused dashboard that combines:
- Video playback
- Pose visualization
- Dynamic technique metrics
- Technique Fingerprint scoring
- Coaching recommendations
- Analysis history
- Local processing indicators

We used a bold, high-contrast visual system so the important results can be understood quickly during both normal use and a live hackathon demonstration.

# Challenges we ran into

## Tracking fast movement

Penalty kicks involve rapid leg movement, motion blur, changing body angles, and partial landmark obstruction. Pose estimation can become less stable when the athlete moves quickly or leaves the camera frame.

We improved reliability by testing with clearer side-angle footage, ensuring the full body remained visible, and treating tracking confidence as an important part of the analysis.

## Turning landmarks into meaningful feedback

Raw pose coordinates are not useful to most athletes. One of our largest challenges was converting dozens of landmark values into a small set of understandable technique measurements.

We had to determine which relationships mattered most, how to normalize them across different body sizes and camera distances, and how to avoid presenting misleading precision.

## Keeping the score stable

The metrics can change while the video is playing because the athlete's body is moving frame by frame. We had to separate live movement estimates from the final Technique Fingerprint so users would understand when a score was still updating and when the final result had been generated.

## Local AI integration

Running the coaching model locally was more difficult than calling a hosted API. We had to manage model setup, localhost communication, structured prompts, response formatting, processing time, and fallback behavior.

However, solving this challenge became one of the project's most important differentiators because it allows the system to work without sending private athlete footage to an external service.

## Balancing design and technical depth

PenaltyIQ contains several technically complex components, but judges and athletes still need to understand the product in seconds.

We had to avoid overwhelming the interface with raw coordinates, terminal output, and technical terminology while still proving that the underlying processing was real.

## Building within hackathon time limits

We had many possible features, including automatic contact detection, comparison mode, reports, history, and multi-sport support. The challenge was deciding which features strengthened the main story and which ones would distract us from delivering a reliable core workflow.

# Accomplishments that we're proud of

We are proud that PenaltyIQ became more than a static sports dashboard.

Our working prototype can:
- Play an uploaded kick inside the application
- Track the athlete while the video is moving
- Render a pose skeleton over the player
- Update movement metrics during playback
- Generate a complete Technique Fingerprint
- Break the result into understandable sub-metrics
- Produce detailed coaching feedback
- Present the results through a cohesive sports-analysis interface
- Run the analysis pipeline locally instead of depending entirely on cloud infrastructure

We are especially proud of separating the biomechanics calculations from the AI explanation layer. This makes the system more transparent and technically defensible.

The geometry engine measures the movement. The AI coach explains the result.
