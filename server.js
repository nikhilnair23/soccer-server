const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const unirest = require('unirest');
// const initDB = require('./data/db').initDb;
// const getDB = require('./data/db').getDb;
const bodyparser = require('body-parser');
let session = require('express-session')
// require('./data/db')()
// initDB();

// require('./services/comment.service.server')(app);


/*const connection = mysql.createConnection({
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
});*/

let db_config = {
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
};



/*connection.connect(err => {
    if (err) {
        console.log(err);
    }
    else {
        console.log('connected')
    }
});*/



let connection;
let mysql_pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
});


function handleDisconnect() {

    /*connection = mysql.createConnection(db_config);// Recreate the connection, since



                                                    // the old one cannot be reuse
    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            connection.destroy();
            // Connection to the MySQL server is usually
            // database.releaseConnection(connection)
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });*/
}

handleDisconnect();


app.use(cors());
app.use(bodyparser());
app.use(unirest());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'any string'
}));

// let connection = getDB();
const selectUsers = 'SELECT * FROM user';

app.get('/', (req, res) => {
    mysql_pool.getConnection(function (err,connection) {
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
        connection.release();
    })

});


app.post('/register', (req, res) => {


    const {username, password, first_name, last_name, favorite_team, isAdmin} = req.body;
    const insert_query = `INSERT INTO user (username, password, first_name, last_name, favorite_team, isAdmin) 
  VALUES ('${username}', '${password}', '${first_name}', '${last_name}', '${favorite_team}', '${isAdmin}')`;

    mysql_pool.getConnection(function (err,connection) {
        connection.query(insert_query, (err, results) => {
            if (err) {
                res.status(400).json('Invalid credentials');
                //res.send('unsuccessful yo');
            }
            else {
                req.session['currentUser'] = username;
                res.json(req.body);
            }
        });
        connection.release();
    })


});

app.post('/login', (req, res) => {

    const {username, password} = req.body;

    const login_query = `SELECT username, password FROM user WHERE username = '${username}' AND password = '${password}'`;

    mysql_pool.getConnection(function (err,connection) {
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
                    req.session['currentUser'] = username;
                    res.send('you exist!');
                }
            }
        });
        connection.release();
    })

});

app.get('/profile', (req, res) => {

    const {username} = req.query;
    console.log(username);

    const profile_query = `SELECT username FROM user WHERE username = '${username}'`;

    mysql_pool.getConnection(function (err,connection) {
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
        connection.release();
    })


});

app.get('/loggedIn', (req,res) => {

    console.log(req.session);
    let user = req.session['currentUser']
    if (user!==undefined){
        mysql_pool.getConnection(function (err,connection) {
            const profile_query = `SELECT * FROM user WHERE username = '${user}'`;
            connection.query(profile_query, (err, results) => {
                if (err) {
                    res.send('something happened sorry');
                }
                else {
                    return res.json({
                        data: results[0]
                    });
                }
            });
            connection.release();
        })
        // res.send(req.session['currentUser'])
    }
    else{
        res.send("NOT_LOGGED_IN");
    }
})

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.send(200);
})

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

    const {homeTeam} = req.params;
    const {awayTeam} = req.params;
    console.log(homeTeam, awayTeam);

    unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/h2h/" + homeTeam + "/" + awayTeam)
        .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
        .header("Accept", "application/json")
        .end(function (result) {
            //console.log(result.status, result.headers, result.body);
            res.send(result.body);
        });

});

app.get('/fixtures/id/:fixture_id', (req, res) => {

    const {fixture_id} = req.params;

    unirest.get("https://api-football-v1.p.rapidapi.com/fixtures/id/" + fixture_id)
        .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
        .header("Accept", "application/json")
        .end(function (result) {
            //console.log(result.status, result.headers, result.body);
            res.send(result.body);
        });

});

app.get('/teams/team/:team_id', (req, res) => {

    const {team_id} = req.params;

    unirest.get("https://api-football-v1.p.rapidapi.com/teams/team/" + team_id)
        .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
        .header("Accept", "application/json")
        .end(function (result) {
            //console.log(result.status, result.headers, result.body);
            res.send(result.body);
        });
});

app.post('/api/get_comment_news/', (req,res) => {

    mysql_pool.getConnection(function (err,connection) {
        let url = req.body.url;
        const getComments = `SELECT * FROM comment_news WHERE url = '${url}'`;
        // let getComments = `SELECT username FROM user WHERE username = '${username}'`;
        connection.query(getComments, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't get comment");
                //res.send('unsuccessful yo');
            }
            else {
                console.log(results);
                return res.json(200,{
                    body: results
                });
            }
        });
        connection.release();
    })
    
})

app.post('/api/comment_news', (req,res) => {
    
    const {url, user, comment, date} = req.body
    const url1 = req.body.url;
    const insert_query = `INSERT INTO comment_news (url, user, comment, date) 
  VALUES ('${url}', '${user}', '${comment}', '${date}')`;
    
    
    mysql_pool.getConnection(function (err,) {
        connection.query(insert_query, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't add comment");
                //res.send('unsuccessful yo');
            }
            else {
                res.sendStatus(200);
            }
        });
        connection.release();
    })


})

app.listen(5000, () => {
    console.log('app is running on 5000')
});