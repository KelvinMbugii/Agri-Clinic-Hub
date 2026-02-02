# Agri-Clinic Hub - Backend API

Production-ready REST API backend for Agri-Clinic Hub, an AI-powered agricultural platform.

## 🚀 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
server/
├── controllers/     # Request handlers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Auth & role middleware
├── services/        # Business logic (SMS, AI)
├── config/          # Configuration files
├── uploads/         # Uploaded images
├── app.js           # Express app setup
└── server.js        # Server entry point
```

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A strong random string for JWT signing
   - `PORT` - Server port (default: 5000)

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

4. **Run the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Farmer Endpoints
- `POST /api/ai/detect-disease` - Upload image for disease detection
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get my bookings
- `GET /api/articles` - Get all articles

### Officer Endpoints
- `GET /api/bookings/assigned` - Get assigned bookings
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article

### Admin Endpoints
- `GET /api/users` - Get all users
- `PATCH /api/users/:id/verify` - Verify officer

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 👥 User Roles

- **farmer** - Can upload images, book consultations, view articles
- **officer** - Can manage bookings, create articles (requires admin verification)
- **admin** - Can verify officers, view all users and AI logs

## 📝 Example API Requests

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "farmer"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Detect Disease (with image upload)
```bash
POST /api/ai/detect-disease
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

## 🧪 Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization middleware
- Input validation
- File upload restrictions (images only, 5MB max)

## 📦 Environment Variables

See `.env.example` for all required environment variables.

## 🐛 Troubleshooting

1. **MongoDB connection error:** Ensure MongoDB is running and `MONGODB_URI` is correct
2. **Port already in use:** Change `PORT` in `.env` file
3. **JWT errors:** Ensure `JWT_SECRET` is set in `.env`

## 📄 License

ISC
