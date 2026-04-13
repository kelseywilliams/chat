// This is much more reliable in Vite/Docker environments
const isProd = import.meta.env.NODE_ENV; 

export const PROTOCOL = isProd ? "https" : "http";
export const API_DOMAIN = isProd ? "api.kelseywilliams.co" : "localhost/api";

console.log("Current Environment:", isProd ? "Production" : "Development");