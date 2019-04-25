const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const unirest = require('unirest');
// const initDB = require('./data/db').initDb;
// const getDB = require('./data/db').getDb;
const bodyparser = require('body-parser');
let session = require('express-session')

let corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true };
app.use(cors(corsOptions));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin",
//         "*");
//     res.header("Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept");
//     res.header("Access-Control-Allow-Methods",
//         "GET, POST, PUT, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Credentials", "false");
//     next();
// });


// require('./services/comment.service.server')(app);

/*const connection = mysql.createConnection({
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
});*/

/*
let db_config = {
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
};
*/



let connection;
let mysql_pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'bed9bed8e064dc',
    password: '9f19c1e0',
    database: 'heroku_59367cadade0e22'
});


/*function handleDisconnect() {
}

handleDisconnect();*/


// app.use(cors());
app.use(bodyparser());
app.use(unirest());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'any string'
}));


// let connection = getDB();
const selectUsers = 'SELECT * FROM user';

app.get('/users', (req, res) => {
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

app.get('/teams/all', (req, res) => {

    const selectTeams = 'SELECT * FROM teams';

    mysql_pool.getConnection(function (err,connection) {
        connection.query(selectTeams, (err, results) => {
            if (err) {
                return res.send(err);
            }
            else {
                console.log(results)
                return res.json({
                                    data: results
                                });
            }
        })
        connection.release();
    })

});

app.post('/allteams', (req,res) => {
    const{team_id, name, logo} = req.body;
    const insert_query = `INSERT INTO teams (team_id, name, logo) VALUES ('${team_id}', '${name}', '${logo}')`;
    //console.log(team_id, name, logo);

    mysql_pool.getConnection(function (err,) {
        connection.query(insert_query, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't add team");
                //res.send('unsuccessful yo');
            }
            else {

                res.sendStatus(200);
            }
        });
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
                //res.status(400).json('Invalid credentials');
                //res.send('unsuccessful yo');
                res.send([]);
            }
            else {
                //res.json(req.body);
                req.session['currentUser'] = username;
                res.send(req.body);
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
                    res.sendStatus(400)
                    // res.send([]);
                }
                else {
                    req.session['currentUser'] = username;
                    console.log(results);
                    //res.send('you exist!');
                    res.send(results);
                }
            }
        });
        connection.release();
    })
});

app.post('/signout', (req,res) => {
    req.session.destroy();
    res.send(200);
})

app.get('/profile/:username', (req,res) => {
    const {username} = req.params;
    console.log(username);

    const profile_query = `SELECT * FROM user WHERE username = '${username}'`;

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
                    res.send(results[0]);
                }
            }
        });
        connection.release();
    })
});

app.get('/profile/follow/:username', (req,res) => {
    const {username} = req.params;

    const profile_query = `SELECT * FROM user_follow WHERE user_following= '${username}'`;

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
                    console.log(results);
                    res.json(results);
                }
            }
        });
        connection.release();
    })
});

app.put('/profile/:username', (req,res) => {

    const {username} = req.params;
    const {password, first_name, last_name} = req.body;
    console.log(username);
    console.log(first_name);

    const profile_query =  `UPDATE user SET first_name = '${first_name}', last_name = '${last_name}', password = '${password}' WHERE username = '${username}'`;
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
                    res.send(req.body);
                }
            }
        });
        connection.release();
    })


});

app.delete('/profile/:username', (req,res) => {

    const {username} = req.params;
    console.log(username);

    const profile_query =  `DELETE FROM user WHERE username = '${username}'`;
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
                    req.session.currentUser=undefined;
                    req.session=null;
                    req.session.destroy();
                    res.send(200);
                }
            }
        });
        connection.release();
    })
});

app.post('/profile/teams',(req,res) => {
    const {username,team_id, team} = req.body;
    const insert_query = `INSERT INTO user_team (user, team_id, team) 
  VALUES ('${username}', '${team_id}', '${team}')`;

    mysql_pool.getConnection(function (err,connection) {
        connection.query(insert_query, (err, results) => {
            if (err) {
                //res.status(400).json('Invalid credentials');
                //res.send('unsuccessful yo');
                res.sendStatus(400);
            }
            else {
                //res.json(req.body);
                res.sendStatus(200);
            }
        });
        connection.release();
    })
})

app.get('/profile/teams/:username',(req,res) => {
    const {username} = req.params;
    const profile_query = `SELECT TEAM FROM USER_TEAM WHERE USER = '${username}'`;
    // let arr[] = new arr;

    mysql_pool.getConnection(function (err,connection) {
        connection.query(profile_query, (err, results) => {
            if (err) {
                res.send('something happened sorry');
            }
            else {
                if (results.length === 0) {
                    return res.json({
                        data: []
                    });
                }
                else {
                    console.log(results);
                    res.json({
                        data:results
                    });
                }
            }
        });
        connection.release();
    })

})

app.put('/favorite_team/:username', (req,res) => {

    const {username} = req.params;
    const {favorite_team} = req.body;
    console.log(favorite_team);

    const profile_query =  `UPDATE user SET favorite_team = '${favorite_team}' WHERE username = '${username}'`;
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

                    res.send(req.body);
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
        return res.json({
            data: "NOT_LOGGED_IN"
        });
    }
})

/*app.get('/logout', (req,res) => {
    req.session.destroy();
    res.send(200);
})*/

app.get('/leagues', (req, res) => {

    unirest.get("https://api-football-v1.p.rapidapi.com/leagues/season/2018")
        .header("X-RapidAPI-Key", "b83be741d1mshbbc318cf68d0e9fp139528jsn0cddc0e04919")
        .header("Accept", "application/json")
        .end(function (result) {
            //console.log(result.status, result.headers, result.body);
            res.send(result.body);
        });
});


app.get('/standings/:id', (req, res) => {

    const {id} = req.params

    unirest.get("https://api-football-v1.p.rapidapi.com/leagueTable/" + id)
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
    
    
    mysql_pool.getConnection(function (err,connection) {
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

app.delete('/api/comment_news',(req,res) => {
    const {url,user,comment} = req.body
    const delete_query = `DELETE FROM COMMENT_NEWS WHERE URL='${url}' AND USER = '${user}' AND COMMENT='${comment}'`;
    mysql_pool.getConnection(function (err,connection) {
        connection.query(delete_query, (err, results) => {
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

app.get('/api/team_logo',(req,res) => {
    const {name} = req.body
    const select_query = `SELECT logo FROM teams WHERE name = '${name}'`
    mysql_pool.getConnection(function (err,connection) {
        connection.query(select_query, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't find team");
                //res.send('unsuccessful yo');
            }
            else {
                res.send(results[0]);
            }
        });
        connection.release();
    })
})

app.listen(5000, () => {
    console.log('app is running on 5000')
});