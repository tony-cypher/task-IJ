const express = require('express');
const mongoose = require('mongoose')
const path = require('path')
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const session = require('express-session')
const MongoStore = require('connect-mongo')
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;




app.use(cors({
    origin:  process.env.CLIENT_URL || 'http://localhost:3000', //or your frontend url
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
//app.use(cors());
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

  app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('Cookies:', req.headers.cookie);
    next();
  });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true,}
)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Could not connect to MongoDB', error));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use(express.static(path.join(__dirname, 'public')))
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(process.env.MONGODB_URI)
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('CLIENT_URL:', process.env.CLIENT_URL);
}
);

// Test the session
// setTimeout(() => {
//   console.log('Session store:', app.get('trust proxy'));
// }, 5000);

module.exports = app;


