var LOGO_DEPARTAMENTO = null
var API_KEY_RECAPTCHA = "6LdjNuUUAAAAAPaTbCGnwAgapO3fyu5x0kMOD6Lz";
var COUNTRY, LANGUAGE, API_KEY, tiempo_para_expirar, URL_BACKEND;
var URL_SITE = window.location.href;

if(ENVIROMENT == "development"){
    URL_LOGIN = "http://localhost:5501/login.html" 
    tiempo_para_expirar = 1440
    URL_BACKEND = "http://localhost:5002";

}else if(ENVIROMENT == "testing"){
    URL_LOGIN = "https://inv.trebolapp.cl/login.html";
    tiempo_para_expirar = 1440
    URL_BACKEND = "https://api-inv.trebolapp.cl";
    
}else if(ENVIROMENT == "production"){
    URL_LOGIN = "https://www.inventario.cl/login.html"
    URL_BACKEND = "https://api.inventario.cl"
    tiempo_para_expirar = 1440
}
