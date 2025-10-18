# Event Management System (EMS)

A comprehensive event proposal management platform that leverages AI and machine learning to streamline the evaluation process for student event proposals. The system features role-based access control, automated AI-powered analysis, and ML-based feasibility scoring.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication System**: Students, Category Reviewers, and Budget Reviewers
- **Event Proposal Submission**: Students can submit detailed event proposals with budget and attendance estimates
- **AI-Powered Analysis**: Automated proposal summarization and suggestions using Google Gemini AI
- **ML-Based Feasibility Scoring**: Machine learning model predicts event success probability
- **Two-Stage Review Process**: Category and budget reviewers with specialized interfaces
- **Real-time Status Tracking**: Live updates on proposal status and decisions

### Technical Highlights
- **Modern Tech Stack**: React + TypeScript frontend, Node.js + Express backend
- **Database**: PostgreSQL with Supabase integration
- **AI Integration**: Google Gemini for natural language processing
- **Machine Learning**: Scikit-learn Random Forest classifier for success prediction
- **Security**: JWT authentication, password hashing, OTP verification
- **Responsive Design**: Tailwind CSS with mobile-first approach

## 🏗️ Architecture

```
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/           # Route components
│   │   ├── components/      # Reusable UI components
│   │   ├── state/          # Context providers
│   │   └── lib/            # API utilities
│   └── package.json
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Authentication & validation
│   │   └── config/         # Environment configuration
│   ├── scripts/
│   │   └── ml/             # Machine learning models
│   └── db/
│       └── schema.sql      # Database schema
└── event_data.csv          # Training data for ML model
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL database
- Supabase account

### Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment configuration**:
   Create `.env` file in `backend/` directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   EMAIL_HOST=your_smtp_host
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   CORS_ORIGIN=http://localhost:5174
   ```

3. **Database setup**:
   ```bash
   # Run the schema
   psql -d your_database -f db/schema.sql
   
   # Seed initial data
   npm run seed
   ```

4. **Train ML model**:
   ```bash
   npm run train-ml
   ```

5. **Start backend server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment configuration**:
   Create `.env` file in `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 📊 Machine Learning Model

The system uses a **Random Forest Classifier** with **CalibratedClassifierCV** to predict event success probability:

### Features Used
- Event type (Sports, Cultural, Seminars)
- Expected attendees
- Budget allocation
- Derived features:
  - Budget per attendee
  - Log-transformed values for better distribution

### Model Training
```bash
# Train the model
cd backend
npm run train-ml

# Test prediction
npm run predict-ml
```

### Model Performance
- **Algorithm**: Random Forest (300 estimators)
- **Calibration**: Isotonic regression for probability calibration
- **Cross-validation**: 3-fold CV for robust performance
- **Training Data**: 5000+ historical event records

## 🔐 User Roles & Permissions

### Student
- Submit event proposals
- View proposal status and feedback
- Access AI-generated suggestions

### Category Reviewer
- Review proposals for category appropriateness
- Provide category-specific feedback
- Approve/reject based on event type

### Budget Reviewer
- Evaluate budget feasibility
- Review ML-generated success scores
- Make final approval decisions

## 🤖 AI Integration

### Google Gemini AI
- **Proposal Summarization**: Automatically generates concise summaries
- **Smart Suggestions**: Provides improvement recommendations
- **Context-Aware Analysis**: Considers event type and requirements

### Machine Learning Pipeline
- **Feature Engineering**: Automated feature creation and transformation
- **Success Prediction**: Probability score for event success
- **Real-time Scoring**: Instant feasibility assessment

## 📱 User Interface

### Design Principles
- **Mobile-First**: Responsive design for all devices
- **Accessibility**: WCAG compliant components
- **User Experience**: Intuitive navigation and clear feedback
- **Modern UI**: Clean, professional interface with Tailwind CSS

### Key Components
- **Dashboard**: Role-specific overview and quick actions
- **Proposal Forms**: Guided submission with validation
- **Review Queues**: Efficient review workflows
- **Status Tracking**: Real-time updates and notifications

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connections
- API keys and secrets
- CORS origins
- Email service credentials

## 📈 Performance & Scalability

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Strategic caching for frequently accessed data
- **Error Handling**: Comprehensive error management

### Frontend Optimizations
- **Code Splitting**: Lazy loading for better performance
- **Bundle Optimization**: Minimized JavaScript bundles
- **Caching**: Browser caching for static assets

## 🔧 Development

### Available Scripts

**Backend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run seed` - Seed database with sample data
- `npm run train-ml` - Train machine learning model
- `npm run predict-ml` - Test ML prediction

**Frontend**:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- **TypeScript**: Full type safety across the stack
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **Zod**: Runtime type validation

## 📝 API Documentation

### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification

### Proposal Endpoints
- `POST /proposals` - Submit new proposal
- `GET /proposals` - List proposals (role-based)
- `PUT /proposals/:id` - Update proposal status
- `GET /proposals/:id` - Get proposal details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for natural language processing
- **Supabase** for database and authentication services
- **Scikit-learn** for machine learning capabilities
- **React** and **Express** communities for excellent documentation

---

**Built with ❤️ for efficient event management and AI-powered decision making.**
