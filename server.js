const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const unirest = require('unirest');
const bodyparser = require('body-parser');

const app = express();

const selectUsers = 'SELECT * FROM user';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: 'soccer_user'
});

connection.connect(err => {
  if(err) {
    console.log(err);
  }
  else {
    console.log('connected')
  }
});


app.use(cors());
app.use(bodyparser());
app.use(unirest());

//

app.get('/', (req,res) => {
  connection.query(selectUsers, (err, results) => {
    if (err) {
      return res.send(err);
    }
    else {
      return res.json({
        data: results
      });
    }
  })
});


app.post('/register', (req, res) => {

  const {username, password, first_name, last_name, favorite_team, isAdmin} = req.body;

  console.log(req.body);

  const insert_query = `INSERT INTO user (username, password, first_name, last_name, favorite_team, isAdmin) 
  VALUES ('${username}', '${password}', '${first_name}', '${last_name}', '${favorite_team}', '${isAdmin}')`;

  connection.query(insert_query, (err, results) => {
    if (err) {
      res.status(400).json('Invalid credentials');
      //res.send('unsuccessful yo');
    }
    else {
      res.json(req.body);
    }
  });
});

app.post('/login', (req,res) => {

  const {username, password} = req.body;

  const login_query = `SELECT username, password FROM user WHERE username = '${username}' AND password = '${password}'`;

  connection.query(login_query, (err, results) => {
    if (err) {
      res.send('something happened sorry');
    }
    else {
      if (results.length === 0) {
        //res.send('you dont exist man');
        res.status(400).json('You dont exist man');
      }
      else {
      res.send('you exist!');
      }
    }
  });

});

app.get('/profile', (req,res) => {

  const {username} = req.query;
  console.log(username);

  const profile_query =  `SELECT username FROM user WHERE username = '${username}'`;

  connection.query(profile_query, (err, results) => {
    if (err) {
      res.send('something happened sorry');
    }
    else {
      if (results.length === 0) {
        res.send('this guy dont exist man');
      }
      else {
      res.send(username);
      }
    }
  });

});

app.get('/leagues', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagues/season/2018")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});


app.get('/standings/132', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/132")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/standings/2', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/2")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/standings/87', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/87")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/standings/8', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/8")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });
});

app.get('/standings/94', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/94")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/live', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/live")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/epl', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/league/2")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
     // console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/laliga', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/league/87")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/bundesliga', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/league/8")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/seriea', (req, res) => {

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/league/94")
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/h2h/:homeTeam/:awayTeam', (req, res) => {

  const { homeTeam } = req.params;
  const { awayTeam } = req.params;
  console.log(homeTeam,awayTeam);

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/h2h/" + homeTeam + "/" + awayTeam)
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/fixtures/id/:fixture_id', (req, res) => {

  const { fixture_id } = req.params;

  unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/id/" + fixture_id)
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.get('/teams/team/:team_id', (req, res) => {

  const { team_id } = req.params;

  unirest.get("https://api-football-v1.p.rapidapi.com/teams/team/" + team_id)
   .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
   .header("Accept", "application/json")
   .end(function (result) {
      //console.log(result.status, result.headers, result.body);
      res.send(result.body);
  });

});

app.listen(5000, () => {
  console.log('app is running on 5000')
});