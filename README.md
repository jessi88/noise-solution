# Noise Solution Impact Story Dashboard

A narrative-first impact dashboard developed for **Noise Solution** in collaboration with **Data ChangeMakers**.

The dashboard combines participant voice, session-level wellbeing indicators, and custom data visualisation to explore how confidence, control, and connection develop through long-term music mentoring relationships.

**Live dashboard:**
[https://jessi88.github.io/noise-solution/](https://jessi88.github.io/noise-solution/)

---

## Overview

Traditional impact reporting often reduces complex experiences to static numbers and summary statistics.

This project explores a different approach.

The dashboard combines:

* Quantitative session-level indicators
* Participant reflections and quotations
* Custom visual storytelling inspired by Noise Solution's music identity
* Directional analysis rather than definitive outcome claims

The aim is to keep the human story visible while still providing meaningful evidence for learning and reflection.

---

## Dashboard Structure

### What changed?

A high-level overview of programme activity and outcome indicators.

Includes:

* Number of participants
* Number of sessions
* Average session rating
* Number of AI readings consolidated into session-level evidence
* Average confidence score
* Average control score
* Average connection score

---

### How change develops over time

Explores trajectories rather than single before-and-after measurements.

Includes:

#### Programme journey chart

Shows average confidence, control, and connection across participant session numbers.

#### Participant journey examples

Illustrates different journey types:

* Increasing journeys
* Broadly steady journeys
* More complex or declining journeys

Journey classification is based on the change between first and latest session using a combined wellbeing score:

```text
(confidence + control + connection) / 3
```

---

### What young people actually said

Places participant voice at the centre of interpretation.

Quotes can be filtered by:

* Most positive overall
* Feeling confident
* Feeling in control
* Feeling connected
* Overall challenges
* Confidence challenges
* Control challenges
* Connection challenges

This section supports qualitative interpretation alongside quantitative patterns.

---

### The sound of impact

A collection of music-inspired visualisations.

Includes:

#### Programme waveform

A stylised line chart showing confidence, control, and connection across sessions.

#### Impact equaliser

A visual representation of average confidence, control, and connection scores.

#### Constellation of voices

Plots session reflections by:

* Session number
* Overall wellbeing score
* Dominant dimension (confidence, control, or connection)

#### Participant mixtape

Miniature participant journey tracks visualising changes in combined wellbeing scores over time.

#### Orbital score distributions

Displays the distribution of confidence, control, and connection scores across the dataset.

---

### What patterns are emerging?

Exploratory analysis intended for organisational learning.

Includes:

#### Referral sector patterns

Compares average confidence, control, and connection across referral sectors.

#### Participant sessions by gender

Displays:

* Number of sessions
* Average overall wellbeing score

Average overall is calculated as:

```text
(confidence + control + connection) / 3
```

averaged across session records.

---

### How we measure impact

Provides methodological context and limitations.

Topics include:

* Why the dashboard uses directional language
* Appropriate use of the scores
* The importance of participant voice
* Technical methodology
* Potential score-scale changes in the source data

---

## Data Processing

The dashboard uses session-level data exported from Noise Solution's analysis pipeline.

Key metrics are mapped as:

| Source Field       | Dashboard Label |
| ------------------ | --------------- |
| Competence Avg     | Confidence      |
| Autonomy Avg       | Control         |
| Relatedness Avg    | Connection      |
| Session Rating Avg | Session Rating  |

Scores are treated as directional indicators rather than precise psychometric measurements.

---

## Technology

Built using:

* React
* TypeScript
* Vite
* D3.js
* Tailwind CSS
* Radix UI

---

## Design Principles

The dashboard was designed around several principles:

### Human-first

Participant voice remains central to interpretation.

### Directional, not definitive

The dashboard avoids over-precise claims and ranking participants.

### Mixed-method evidence

Strongest conclusions emerge when:

* quantitative trends,
* repeated reflections,
* and participant quotations

all point in the same direction.

### Music-inspired storytelling

Visuals borrow from Noise Solution's creative identity, representing change through rhythm, movement, and journeys rather than conventional reporting alone.

---

## Important Methodological Note

The project team identified a possible change in how scores may have been generated or exported over time.

Later records appear to contain fewer high-end scores.

Possible explanations include:

* score compression
* calibration drift
* prompt changes
* model updates
* export or post-processing changes

For this reason, the dashboard intentionally uses:

* rounded values
* plain-English labels
* directional language
* qualitative triangulation

rather than treating the scores as exact psychometric measures.

---

## Credits

**Noise Solution**
[https://www.noisesolution.org](https://www.noisesolution.org)

**Data ChangeMakers**
[https://www.datachangemakers.org](https://www.datachangemakers.org)

Dashboard concept, design, development, and analysis created as part of a Data ChangeMakers volunteer project.

---

## License

This repository contains a prototype dashboard created for demonstration, learning, and impact storytelling purposes. Data ownership remains with Noise Solution.
