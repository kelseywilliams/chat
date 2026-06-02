import axios from "axios";
import logger from "../utils/logger.js";
import { PROTOCOL, API_DOMAIN } from "../config/index.js";

const path = `${PROTOCOL}://${API_DOMAIN}/auth/user`

export async function socketAuth(socket, next) {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) return next(new Error("Unauthorized"));
    try {
        const res = await axios.get(path, {
            headers: { Cookie: cookieHeader },
            timeout: 2000,
            validateStatus: () => true, // Keeps axios from throwing on non-2k statuses
        });

        if (res.status === 200) {
            socket.user = res.data;
            return next(); // Explicitly allow connection
        }

        // Treat ALL other statuses (401, 403, 500, etc.) as unauthorized
        logger.warn(`Auth service rejected connection with status: ${res.status}`);
        return next(new Error("Unauthorized"));

    } catch (err) {
        logger.error(`Error while attempting authentication. ${err}`);
        return next(new Error("Unauthorized"));
    }
}
