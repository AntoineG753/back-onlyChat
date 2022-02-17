import mysql from 'mysql';



// Create connection 
const DB = mysql.createPool({
    host: 'eu-cdbr-west-02.cleardb.net',
    user: 'b8bcbe8c044761',
    password: '7324368d',
    database: 'heroku_8fcf79b81a18a26',
    timezone: 'Europe/Paris'
});
DB.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
    }
});

export { DB };