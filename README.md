# 🏥 Health Intelligence System

A personalized **Health Scoring Platform** that evaluates a user’s lifestyle using daily activities and long-term habits — inspired by research-based health indices and modern “credit score” systems.

---

# 🚀 Overview

This project generates **two types of health scores**:

### 📊 Daily Health Score

* Reflects **today’s lifestyle**
* Based on:

  * Steps walked
  * Sleep duration
  * Calories consumed/burned

### 🧠 Lifetime Health Score (1–1000)

* Inspired by a **credit score system**
* Represents:

  * Long-term habits
  * Consistency
  * Medical history
  * Health trends

---

# 🎯 Key Features

## ✅ 1. Personalized Health Scoring

* Adjusts scoring based on:

  * Medical conditions (e.g., diabetes, obesity)
  * User profile (age, weight, etc.)

Example:

* Healthy user → ~9000 steps target
* Diabetes → ~7000 steps target
* Obesity → ~11000+ steps target

---

## 📈 2. Dual Score System

### Daily Score

* Range: **0–100 (internally) → scaled to 0–1000**
* Changes every day

### Lifetime Score

* Range: **1–1000**
* Stable and evolves slowly over time

---

## 🔁 3. Score Inertia (Credit Score Logic)

Lifetime score updates gradually:

```
New Score = 0.95 × Old Score + 0.05 × Daily Score
```

✔ Prevents sudden fluctuations
✔ Reflects long-term behavior

---

## ⚙️ 4. Weighted Composite Model (Research-Based)

Health score is calculated using a **weighted combination**:

```
Score = 
    (W1 × Activity Score)
  + (W2 × Sleep Score)
  + (W3 × Nutrition Score)
```

Weights vary based on user condition:

| Condition | Activity | Sleep | Nutrition |
| --------- | -------- | ----- | --------- |
| Healthy   | 30%      | 30%   | 40%       |
| Diabetes  | 25%      | 25%   | 50%       |
| Obesity   | 40%      | 20%   | 40%       |

---

## 🧩 5. Disease-Based Personalization

The system dynamically adjusts:

* Targets (e.g., step goals)
* Weights (importance of factors)
* Penalties (risk behaviors)

Example:

* Diabetes → high penalty for poor nutrition
* Obesity → higher emphasis on activity

---

## 📉 6. Trend & Consistency Tracking

* Tracks user performance over time
* Rewards improvement
* Penalizes decline

---

## 🔔 7. Smart Notifications

Users receive alerts when:

* Score improves significantly
* Score drops
* Milestones are reached

Example:

* “Great job! Your health score improved by +20 🎉”
* “Your score dropped this week. Try improving sleep.”

---

## 🧭 8. Separate Lifetime Dashboard

* Accessible via navigation bar
* Displays:

  * Lifetime score
  * Score history
  * Trends
  * Insights

---

# 🏗️ Tech Stack

### Frontend

* React
* Vite
* HTML, CSS, JavaScript

### Backend

* Node.js

### Database & Auth

* Firebase

### Mobile (Planned)

* Expo (for integrating device health data)

---

# 📊 Data Flow

```
User Input / Device Data
        ↓
Backend (Node.js)
        ↓
Score Calculation Engine
        ↓
Firebase Database
        ↓
Frontend Dashboard
```

---

# 🧠 Scoring Logic (Simplified)

### Activity Score

```
steps / target_steps × 100
```

### Sleep Score

```
100 - deviation_from_ideal_sleep × penalty_factor
```

### Nutrition Score

```
100 - calorie_deviation_percentage
```

---

# 🔄 Lifetime Score Update

```
Lifetime Score =
    0.95 × Previous Score
  + 0.05 × Current Daily Score
```

---

# 🔮 Future Enhancements

* 📱 Automatic data tracking via mobile sensors
* 📸 Food image → calorie estimation
* 🤖 AI-based health insights
* 📊 Weekly health reports
* 🧬 Health risk prediction
* 🏆 Gamification (streaks, badges)

---

# 💡 Project Vision

This project aims to go beyond simple fitness tracking and become a:

> 🧠 **Health Intelligence System**

By combining:

* Research-based scoring
* Personalized health adjustments
* Long-term behavioral tracking

---

# ⚠️ Disclaimer

This application is intended for **informational and lifestyle tracking purposes only** and should not be considered medical advice.

---

# 👨‍💻 Contributors

* Team name :- PulseCredit
  - SupratikDey
  - atrishmanm

---

# ⭐ Conclusion

This system transforms raw health data into a **meaningful, personalized score**, helping users:

* Understand their lifestyle
* Track long-term health
* Make better decisions
