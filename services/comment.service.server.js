const connection = require('../data/db').getDb();

module.exports = function (app) {
    function getComments(req,res){
        let url = req.body.url;
        // const getComments = `SELECT * FROM comment_news WHERE url = '${url}'`;
        let getComments = `SELECT username FROM user WHERE username = '${username}'`;
        // let sql = 'SELECT * FROM comment_news WHERE url = ?';
        // connection.query(sql, [url], function (err, result) {
        //     if (err) throw err;
        //     return res.json({
        //         data: results
        //     });
        // });
        connection.query(getComments, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't get comment");
                //res.send('unsuccessful yo');
            }
            else {
                return res.json({
                    data: results
                });
            }
        });

    }

    function addComment(req,res){
        const {url, user, comment, date} = req.body
        const insert_query = `INSERT INTO comment_news (url, user, comment, date) 
  VALUES ('${url}', '${user}', '${comment}', '${date}')`;

        connection.query(insert_query, (err, results) => {
            if (err) {
                res.status(400).json("Couldn't add comment");
                //res.send('unsuccessful yo');
            }
            else {
                res.sendStatus(200);
            }
        });
    }
    app.get('/api/comment_news',getComments);
    app.post('/api/comment_news',addComment);
}