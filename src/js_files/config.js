var LOGO_DEPARTAMENTO = null
var API_KEY_RECAPTCHA = "6LdjNuUUAAAAAPaTbCGnwAgapO3fyu5x0kMOD6Lz"; // USO EN CITAS WEB
var COUNTRY, LANGUAGE, API_KEY, tiempo_para_expirar, URL_BACKEND;
var URL_SITE = window.location.href;

if(ENVIROMENT == "development"){
    URL_LOGIN = "http://localhost:5501/login.html" 
    tiempo_para_expirar = 1440
    URL_BACKEND = "http://localhost:5002";

}else if(ENVIROMENT == "testing"){
    URL_LOGIN = "https://testing.cideusach.cl/login.html";
    tiempo_para_expirar = 1440
    URL_BACKEND = "https://testing-api.cideusach.cl";
    
}else if(ENVIROMENT == "production"){
    URL_LOGIN = "https://www.cideusach.cl/login.html"
    URL_BACKEND = "https://api.cideusach.cl"
    tiempo_para_expirar = 1440
}
