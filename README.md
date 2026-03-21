# BillInsight - AI-Powered Bill Prediction Engine

An elegant, full-stack web application for predicting electricity bill costs using machine learning algorithms. Built with Next.js, featuring a sleek dark UI, user authentication, and comprehensive prediction history tracking.



## ✨ Features

### Core Functionality
- **AI Bill Prediction**: Input monthly kWh consumption to get instant cost forecasts
- **User Authentication**: Register/login system with secure user management
- **Prediction History**: Track all predictions with detailed logs and analytics
- **Guest Mode**: Limited predictions without account (4 per day)
- **Real-time Analytics**: View total spent, average bills, and usage patterns

### Technical Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern, eye-friendly interface with gold accent colors
- **TypeScript**: Full type safety throughout the application
- **API-First Architecture**: RESTful API endpoints for all operations
- **In-Memory Database**: Fast, persistent data storage for development

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with hooks and modern features
- **TypeScript** - Type-safe JavaScript
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Secure user authentication and authorization
- **Row Level Security (RLS)** - Database-level access control
- **JWT Tokens** - Secure session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Git
- Supabase account ([supabase.com](https://supabase.com))

### 1. Clone and Install
```bash
git clone https://github.com/Swastik45/Bill_Prediction.git
cd BillPrediction
pnpm install
```

### 2. Set up Supabase Database

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be set up (usually 2-3 minutes)

#### Configure Database Schema
1. Go to your Supabase dashboard → SQL Editor
2. Copy and run the SQL from `supabase-schema.sql` in your project
3. This creates the `users` and `predictions` tables with proper security policies

#### Get API Keys
1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 3. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run Development Server
```bash
pnpm dev
```

### 5. Open Your App
Visit [http://localhost:3000](http://localhost:3000) and start using BillInsight!

---

## 🔧 Supabase Database Schema

The app uses two main tables:

### `users` table
- User profiles with authentication
- Row Level Security (RLS) enabled
- Users can only access their own data

### `predictions` table
- Stores bill prediction history
- Linked to users via `user_id`
- RLS ensures users see only their predictions

**Security Features:**
- Row Level Security (RLS) policies
- JWT-based authentication
- Secure password hashing via Supabase Auth
- Automatic timestamp management

### Build for Production

```bash
pnpm build
pnpm start
```

## 📖 Usage

### For Users
1. **Register/Login**: Create an account or sign in to access full features
2. **Make Predictions**: Enter your monthly kWh consumption in the prediction form
3. **View Results**: See AI-generated cost estimates with confidence scores
4. **Track History**: Monitor all predictions in your personal dashboard
5. **Manage Data**: Delete individual predictions or clear entire history

### For Developers
- **API Testing**: Use tools like Postman to test endpoints
- **Database**: Data persists in memory during runtime
- **Customization**: Easily modify prediction algorithms in `src/lib/fakeDB.ts`

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass",
    "full_name": "John Doe"
  }
  ```

- `POST /api/login` - User login
  ```json
  {
    "username": "johndoe",
    "password": "securepass"
  }
  ```

### Predictions
- `POST /api/predict` - Generate bill prediction
  ```json
  {
    "units": 450.5,
    "user_id": 1
  }
  ```

### History Management
- `GET /api/history?user_id=1` - Get user prediction history
- `DELETE /api/history?user_id=1` - Clear user history
- `DELETE /api/history/123` - Delete specific prediction

## 🏗 Project Structure

```
BillPrediction/
├── src/
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── history/
│   │   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── login/
│   │   │   ├── predict/
│   │   │   └── register/
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Main page
│   ├── components/              # React components
│   │   ├── HistoryList.tsx
│   │   ├── Login.tsx
│   │   ├── PredictionForm.tsx
│   │   ├── PredictionResult.tsx
│   │   └── UserDasboard.tsx
│   └── lib/
│       └── fakeDB.ts            # In-memory database
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🎨 Design System

### Colors
- **Primary**: `#c9a84c` (Gold)
- **Background**: `#08080a` (Dark ink)
- **Surface**: `#13131a` (Dark gray)
- **Text**: `#f0ece0` (Light cream)
- **Muted**: `#4a4a5a` (Gray)

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: IBM Plex Sans (sans-serif)
- **Mono**: IBM Plex Mono (monospace)

## 🔧 Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Code Quality
- **ESLint**: Configured for Next.js with TypeScript
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (via ESLint)

### Testing
```bash
# Add tests in the future
pnpm test
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. **Add Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Static deployment
- **Railway**: Full-stack deployment
- **Docker**: Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Test API endpoints thoroughly
- Maintain consistent code style
- Update documentation for new features

## 📝 Future Enhancements

### High Priority
- [x] **Real database integration** (Supabase PostgreSQL)
- [x] **Secure authentication** (Supabase Auth with JWT)
- [x] **Password hashing** (via Supabase Auth)
- [ ] Email verification for registration
- [ ] Advanced ML models for predictions

### Medium Priority
- [ ] Export prediction data (CSV/PDF)
- [ ] Dark/light theme toggle
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Real-time notifications

### Low Priority
- [ ] Admin dashboard
- [ ] API rate limiting
- [ ] Social login (Google/GitHub)
- [ ] Prediction sharing
- [ ] Usage analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Framework**: [Next.js](https://nextjs.org/)

## 📞 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review existing issues for similar problems

---

**Built with ❤️ using Next.js and TypeScript**
