# LearnRec - Course Recommender System

A hybrid course recommender system built with Next.js that provides personalized course recommendations using content-based filtering and mastery-gap analysis.

---

## Prerequisites

- **Node.js** 18.17 or later
- **pnpm** (recommended) or npm / yarn

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd learnrec
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
pnpm build
pnpm start
```

---

## Demo Accounts

No signup is required. Select any learner from the login screen:

| Learner ID | Name          | Department           | Level     |
| ---------- | ------------- | -------------------- | --------- |
| L001       | Alice Chen    | Computer Science     | Sophomore |
| L002       | Bob Martinez  | Data Science         | Junior    |
| L003       | Carol Wang    | Information Systems  | Senior    |
| L004       | David Kim     | Computer Science     | Freshman  |
| L005       | Eva Johnson   | Data Science         | Sophomore |
| L006       | Frank Liu     | Computer Science     | Junior    |
| L007       | Grace Park    | Information Systems  | Senior    |
| L008       | Henry Adams   | Data Science         | Sophomore |

---

## Project Structure

```
learnrec/
├── app/
│   ├── api/                        # API route handlers
│   │   ├── courses/                # GET /api/courses, GET /api/courses/:id
│   │   ├── health/                 # GET /api/health
│   │   ├── interactions/           # POST enroll, complete, rate, quiz
│   │   │   ├── [learnerId]/        # GET /api/interactions/:learnerId
│   │   │   ├── complete/
│   │   │   ├── enroll/
│   │   │   ├── quiz/
│   │   │   └── rate/
│   │   ├── learners/[id]/          # GET /api/learners/:id
│   │   ├── login/                  # POST /api/login
│   │   └── recommendations/[learnerId]/  # GET /api/recommendations/:id
│   ├── courses/                    # Course catalog + detail pages
│   │   └── [courseId]/
│   ├── dashboard/                  # Learner dashboard with mastery charts
│   ├── login/                      # Login page
│   ├── recommendations/            # Personalized recommendations page
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                    # Root redirect
│   └── template.tsx                # Auth provider wrapper
├── components/
│   ├── app-shell.tsx               # Main layout shell with navbar
│   ├── auth-provider.tsx           # Client-side auth context
│   ├── course-card.tsx             # Reusable course card component
│   ├── navbar.tsx                  # Top navigation bar
│   └── ui/                         # shadcn/ui component library
├── data/                           # CSV data files (flat-file storage)
│   ├── courses.csv                 # Course catalog
│   ├── interactions.csv            # Learner-course interactions
│   └── learners.csv                # Learner profiles
├── lib/
│   ├── data.ts                     # CSV read/write utilities
│   ├── recommender.ts              # Hybrid recommendation engine
│   ├── types.ts                    # TypeScript type definitions
│   └── utils.ts                    # General utilities
└── package.json
```

---

## How the Recommendation Engine Works

The system uses a **hybrid approach** combining two strategies:

### 1. Content-Based Filtering (60% weight)

- Builds a **TF-IDF** (Term Frequency-Inverse Document Frequency) vector for each course based on its topic, description, and difficulty level
- Computes **cosine similarity** between courses the learner has already taken and candidate courses
- Higher similarity to previously enjoyed courses results in a higher content score

### 2. Mastery-Gap Analysis (40% weight)

- Analyzes the learner's **quiz scores** per topic to determine current mastery levels
- Identifies **knowledge gaps** where the learner scores below the mastery threshold (70%)
- Prioritizes courses that address weak topics and matches them to the learner's appropriate difficulty level

### Final Score

```
final_score = (0.6 x content_similarity) + (0.4 x mastery_fit)
```

The top 5 courses are returned with human-readable explanations of why each was recommended.

---

## API Reference

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| GET    | `/api/health`                     | Health check                      |
| POST   | `/api/login`                      | Login with learner_id             |
| GET    | `/api/learners/:id`               | Get learner profile + mastery     |
| GET    | `/api/courses`                    | List all courses (with filters)   |
| GET    | `/api/courses/:courseId`          | Get single course details         |
| GET    | `/api/interactions/:learnerId`    | Get learner's interaction history |
| POST   | `/api/interactions/enroll`        | Enroll in a course                |
| POST   | `/api/interactions/complete`      | Mark a course as completed        |
| POST   | `/api/interactions/rate`          | Rate a completed course           |
| POST   | `/api/interactions/quiz`          | Submit a quiz score               |
| GET    | `/api/recommendations/:learnerId` | Get personalized recommendations |

### Query Parameters

**GET /api/courses**

| Param      | Type   | Description                               |
| ---------- | ------ | ----------------------------------------- |
| topic      | string | Filter by topic (e.g., "Machine Learning")|
| difficulty | string | Filter by difficulty (Beginner/Intermediate/Advanced) |
| search     | string | Search course name or description         |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Charts**: Recharts
- **Data Storage**: CSV flat files (no database required)
- **Notifications**: Sonner toast library

---

## Notes

- Data is stored in CSV files in the `data/` directory. In production, you would replace this with a proper database.
- The recommendation engine runs server-side in API routes -- no external ML service is needed.
- All interactions (enrollments, completions, ratings, quiz scores) are persisted to `data/interactions.csv`.
