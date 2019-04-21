
    const mysql = require('mysql');
    let connection = mysql.createConnection({
        host: 'us-cdbr-iron-east-02.cleardb.net',
        user: 'bed9bed8e064dc',
        password: '9f19c1e0',
        database: 'heroku_59367cadade0e22'
    });


    function initDb(callback) {
        let connection = mysql.createConnection({
            host: 'us-cdbr-iron-east-02.cleardb.net',
            user: 'bed9bed8e064dc',
            password: '9f19c1e0',
            database: 'heroku_59367cadade0e22'
        });
        connection.connect(function(err) {
            if (err) {
                return console.error('error: ' + err.message);
            }

            let createUser = 'create table if not exists user (\n' +
                ' username VARCHAR(255),\n' +
                ' password VARCHAR(255),\n' +
                ' first_name VARCHAR(255),\n' +
                ' last_name VARCHAR(255),\n' +
                ' favorite_team VARCHAR(255),\n' +
                ' isAdmin boolean,\n' +
                ' CONSTRAINT PK_User PRIMARY KEY (username)\n' +
                ');';

            let createCommentNews = 'create table IF NOT EXISTS comment_news (\n' +
                ' url VARCHAR(255),\n' +
                ' user VARCHAR(255),\n' +
                ' comment VARCHAR(255),\n' +
                ' date VARCHAR(255),\n' +
                ');'

            connection.query(createUser, function(err, results, fields) {
                if (err) {
                    console.log(err.message);
                }
            });

            connection.query(createCommentNews,function (err) {
                if (err) {
                    console.log(err.message);
                }
            });



            connection.end(function(err) {
                if (err) {
                    return console.log(err.message);
                }
            });
        });
    }

    function getDb() {
        return connection;
    }



    module.exports = {
        getDb,
        initDb
    }