let PROTOCOL = "http"
let API_DOMAIN = "proxy:80/api"
if (process.env.NODE_ENV == "production"){
    PROTOCOL = "https";
    API_DOMAIN = "api.kelseywilliams.co";
}

export {
    PROTOCOL,
    API_DOMAIN
}