import axios from "axios";
import jwt from "jsonwebtoken";
import { PUBLIC_KEY } from "../config/index.js";
/* user must make socket connection with jwt token */
export async function socketAuth(socket, next) {
    try {
        const token = socket.handshake.auth?.token;

        const verify = jwt.verify(
            token,
            PUBLIC_KEY,
            {
                algorithms: ["RS256"]
            }
        )

        if (!verify?.id){
            return next(new Error("Unauthorized"))
        }

        const user = await axios.get(
        "https://api.kelseywilliams.co/auth/user",
        // `http://localhost:3028/chat/user`,
        {
            headers: {
                Cookie: token,
                "Content-Type": "application/json",
            },
            timeout: 10_000,
        });

        socket.user = user;
        next();

    } catch {
        return next(new Error("Unauthorized"));
    }
}