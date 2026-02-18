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
      validateStatus: () => true,
    });

    if (res.status == 200) {
        socket.user = res.data;
    }

    return next();

  } catch (err) {
    logger.error("AXIOS_ERR", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      syscall: err?.syscall,
      address: err?.address,
      port: err?.port,
    });
    logger.error("AXIOS_RESP", {
      status: err?.response?.status,
      headers: err?.response?.headers,
      data: err?.response?.data,
    });
    return next(new Error("Unauthorized"));
  }
}
