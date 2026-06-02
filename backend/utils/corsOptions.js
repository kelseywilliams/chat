const allowedOrigins = [
    "https://kelseywilliams.co",
    "http://localhost",
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