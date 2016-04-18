/*jshint node: true */
// ładujemy wykorzystywane moduły
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieSession = require('cookie-session');
var logger = require('morgan');
var errorHandler = require('errorhandler');
// tworzymy i konfigurujemy obiekt aplikacji
var app = express();
var routes = require('./routes');
var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';
var secret = process.env.SECRET || '$uper $ecret';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('puzzle', {
    data: [], // układ liczb-kolorów do zganięcia
    size: 5,  // liczba wykorzystywanych „kolumn”
    dim: 9,   // liczba dostępnych kolorów
    max: null // maksymalna liczba prób (null – brak ograniczeń)
});

// obsługa danych typu application/json
app.use(bodyParser.json());
// obsługa danych typu application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// obsługa sesji za pomocą ciasteczek
app.use(cookieSession({secret: secret}));
// „serwery statyczne”
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components/jquery/dist')));

if ('development' == env) {
    app.use(logger('dev'));
    app.use(errorHandler());
} else {
    app.use(logger('short'));
}

app.get('/', routes.index);
app.get(/^\/play\/((size\/(\d+)\/)?(dim\/(\d+)\/)?(max\/(\d+)\/)?)?/, routes.play);
app.get(/^\/mark\/((?:\d+\/)+)$/, routes.mark);

// uruchamiamy aplikację
app.listen(port, function () {
    console.log("Serwer nasłuchuje na porcie " + port);
});
