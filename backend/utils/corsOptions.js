const allowedOrigins = [
    "https://api.kelseywilliams.co",
    "https://kelseywilliams.co",
    "https://www.kelseywilliams.co",
    // "http://api:3028",
    // "http://localhost:3028",
    // "http://localhost:3029"
]

const corsOptions = {
    origin : (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
            cb(null, true);
        } else {
            cb(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
}

export { allowedOrigins, corsOptions };