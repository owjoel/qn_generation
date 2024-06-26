const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

export const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    exposedHeaders: ['Content-Disposition'],
  };