import mysql from 'mysql';



// Create connection 
const DB = mysql.createPool({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b94f56121de365',
    password: '8fec8956',
    database: 'heroku_eff08e493706747',
    timezone: 'Europe/Paris'
});
DB.getConnection(function (err, connection) {
    if (err) {
        console.log(err);
    }
});

export { DB };