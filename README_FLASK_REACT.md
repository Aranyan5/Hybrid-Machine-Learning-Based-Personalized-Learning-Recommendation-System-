# LearnRec: AI-Powered Course Recommender System

A production-grade hybrid course recommender system built with Flask, React, and Scikit-learn. This portfolio project demonstrates advanced ML engineering, full-stack development, and modern deployment practices.

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Run development server
FLASK_APP=app.py FLASK_ENV=development python -m flask run
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev
```

## Architecture

### Backend (Flask + Scikit-learn)

```
backend/
├── app.py                 # Application factory
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── routes/                # API endpoints
│   ├── auth.py           # Authentication routes
│   ├── learners.py       # Learner profile routes
│   ├── courses.py        # Course catalog routes
│   ├── interactions.py   # Learning interaction routes
│   └── recommendations.py # Recommendation routes
├── services/              # Business logic
│   ├── data_service.py   # CSV data layer with pandas
│   └── recommender_service.py  # ML recommendation engine
└── utils/                 # Utilities
    ├── response.py       # API response formatting
    └── errors.py         # Custom error classes
```

**Key Technologies:**
- **Flask**: Lightweight WSGI web framework
- **Pandas**: Data manipulation and CSV operations
- **Scikit-learn**: Machine learning algorithms
- **Gunicorn**: Production WSGI server

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Root component with routing
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── CourseDetailPage.tsx
│   │   └── RecommendationsPage.tsx
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── services/         # API client
│   │   └── api.ts
│   ├── hooks/            # Custom hooks
│   │   └── useApi.ts
│   └── types/            # TypeScript types
│       └── index.ts
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS config
```

**Key Technologies:**
- **React 18**: UI library
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety
- **Axios**: HTTP client
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework

## ML Recommendation Engine

The hybrid recommender system combines multiple techniques:

### 1. **Content-Based Filtering (60%)**
- **Algorithm**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Implementation**: Vectorizes course descriptions using `sklearn.feature_extraction.text.TfidfVectorizer`
- **Scoring**: Calculates cosine similarity between user's completed courses and candidates
- **Purpose**: Recommends courses similar to what users have already completed

### 2. **Collaborative Filtering (Integrated)**
- **Algorithm**: Truncated SVD (Singular Value Decomposition)
- **Implementation**: Uses `sklearn.decomposition.TruncatedSVD` on learner-course interaction matrix
- **Matrix**: User-item matrix built from interaction data
- **Purpose**: Learns latent factors from user-course interactions

### 3. **Mastery-Gap Analysis (40%)**
- **Calculation**: Identifies topics where mastery is lowest
- **Formula**: Gap Score = 1.0 - (Current Mastery / 100.0)
- **Normalization**: Scaled to prioritize courses in weak knowledge areas
- **Purpose**: Fills knowledge gaps for continuous improvement

### Hybrid Score

```
Final Score = (0.6 × Content Similarity) + (0.4 × Mastery Gap Score)
```

**Example:**
- User completed Python courses → TF-IDF recommends similar courses
- User has low mastery in Data Science → Mastery-gap recommends DS courses
- Both scores combined create personalized ranking

## API Routes

### Authentication
- `POST /api/auth/login` - Login with learner ID
- `GET /api/auth/learners` - Get all learners

### Learners
- `GET /api/learners/<id>` - Get learner profile with stats
- `GET /api/learners/<id>/interactions` - Get interaction history
- `GET /api/learners/<id>/mastery` - Get mastery by topic

### Courses
- `GET /api/courses` - List courses (with filters: topic, difficulty, search)
- `GET /api/courses/<id>` - Get course details
- `GET /api/courses/<id>/interactions` - Get course interactions
- `GET /api/courses/filters/topics` - Get available topics
- `GET /api/courses/filters/difficulties` - Get available difficulties

### Interactions
- `POST /api/interactions/enroll` - Enroll in course
- `POST /api/interactions/complete` - Mark course complete
- `POST /api/interactions/rate` - Rate course (1-5 stars)
- `POST /api/interactions/quiz` - Submit quiz score (0-100)

### Recommendations
- `GET /api/recommendations/<learner_id>` - Get top 5 recommendations

## Data Model

### CSV-Based Storage

**learners.csv**
```
learner_id,name,email
L001,Alice Chen,alice@example.com
```

**courses.csv**
```
course_id,title,description,topic,difficulty,duration
C001,Python Basics,Learn Python from scratch,Python,Beginner,10
```

**interactions.csv**
```
interaction_id,learner_id,course_id,interaction_type,score,timestamp
I001,L001,C001,enroll,,2024-01-15T10:00:00
I002,L001,C001,quiz,85.5,2024-01-20T14:30:00
```

## Features

### Dashboard
- Learner profile with statistics
- Mastery visualization by topic
- Recent activity timeline
- Completion rate tracking

### Course Catalog
- Browse all courses
- Filter by topic and difficulty
- Search functionality
- View course stats (enrollments, ratings)

### Course Details
- Course information and metadata
- Enrollment management
- Course completion tracking
- Star rating system
- Quiz submission with score tracking
- Activity history

### Recommendations
- Personalized course suggestions
- Match scores explaining rankings
- Human-readable reasoning for each recommendation
- Hybrid algorithm details

## Project Structure

```
learnerec/
├── backend/                   # Flask API
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── data/                  # CSV data files
│   └── .env.example
├── frontend/                  # React + Vite
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml         # Multi-container orchestration
├── README_FLASK_REACT.md     # This file
└── .gitignore
```

## Development Workflow

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
FLASK_APP=app.py FLASK_ENV=development python -m flask run
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Testing API

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"learner_id": "L001"}'

# Get recommendations
curl http://localhost:5000/api/recommendations/L001
```

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Run in production
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Environment Variables

**Backend (.env)**
```
FLASK_ENV=production
DEBUG=False
DATA_DIR=data
CORS_ORIGINS=http://yourdomain.com
```

**Frontend (.env)**
```
REACT_APP_API_URL=https://api.yourdomain.com
```

## Production Deployment

### Heroku / Cloud Run

```bash
# Backend only (Flask)
heroku create learnerec-api
heroku config:set FLASK_ENV=production
git push heroku main

# Frontend (Vercel)
npm install -g vercel
vercel
```

### AWS EC2

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run application
docker-compose up -d
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing authentication
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate enrollment attempt
- **500 Internal Error**: Server errors with logging

All errors follow standardized JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "details": {}
}
```

## Performance Considerations

- **Caching**: Implement Redis for frequently accessed data
- **ML Model Persistence**: Save trained TF-IDF and SVD models with joblib
- **Pagination**: Add pagination for large result sets
- **Database**: Migrate from CSV to PostgreSQL for production
- **Async**: Use Celery for background recommendation generation

## Future Enhancements

1. **Advanced ML**
   - Integrate neural collaborative filtering
   - Add content-based embeddings with word2vec
   - Implement reinforcement learning for long-term recommendations

2. **Backend**
   - Switch to PostgreSQL for scalability
   - Add caching with Redis
   - Implement API rate limiting
   - Add comprehensive logging

3. **Frontend**
   - Dark mode support
   - Advanced analytics dashboard
   - Real-time notifications
   - Mobile app (React Native)

4. **Infrastructure**
   - Kubernetes deployment
   - CI/CD pipeline (GitHub Actions)
   - Database migrations
   - Monitoring and alerting

## Troubleshooting

### Backend won't start
```bash
# Check port is free
lsof -i :5000

# Install missing dependencies
pip install -r requirements.txt

# Check Python version (3.8+)
python --version
```

### Frontend API errors
```bash
# Ensure backend is running on port 5000
curl http://localhost:5000/api/health

# Check CORS_ORIGINS in backend .env
# Verify frontend API_URL in vite.config.ts
```

### CSV data not loading
```bash
# Create data directory
mkdir -p backend/data

# Verify CSV files exist and have correct headers
head -1 backend/data/learners.csv
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Contact

For questions or suggestions, please open an issue or contact the development team.

---

**Built with:** Flask • React • Scikit-learn • Docker • TypeScript
**Portfolio Project:** Demonstrates full-stack development, ML engineering, and production deployment practices
