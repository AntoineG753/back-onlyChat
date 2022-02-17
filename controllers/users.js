import { DB } from '../connectDB.js';
import { sqlSignup, sqlCheckPseudo, sqlGetAccount, sqlLogin, sqlNumberLogin} from '../utils/scriptSQL.js';
import bcrypt from 'bcrypt';
import { v5 as uuidv5 } from 'uuid';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { } from 'dotenv/config';

export const signup = (req, res, next) => {

    
    const checkPseudo = sqlCheckPseudo(
        req.body.pseudo
    )

    DB.query(
        checkPseudo,
        (err, Result) => {
            if (err) throw error;
            if (Result.length > 0) {
                    return res.status(400).json({ msg: 'pseudo existe deja' });    
            } else {
                
                const uuid = uuidv5(req.body.pseudo, process.env.KEY_UUID);
                const secretKey = `${process.env.PSW_SECRET_KEY, CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(uuid))}`
                console.log(secretKey)
                bcrypt.hash(secretKey, 10, function (err, hash) {
                    if (err) throw error;
                    const Signup = sqlSignup(
                        req.body.pseudo,
                        hash, 
                        uuid
                    )
                    console.log(Signup)
                    DB.query(
                        Signup,
                        function (error, Result) {
                            if (error) throw error;
                            
                            const Login = sqlLogin(
                                req.body.pseudo
                            )
                            DB.query(
                                Login,
                                function (error, Result) {
                                    if (error) throw error;
                                    res.status(201).json({
                                        user: Result[0],
                                        secretKey: secretKey, 
                                        token: jwt.sign(
                                        { userToken: uuid },
                                        process.env.SECRET_TOKEN_KEY,
                                        { expiresIn: '12h' },
                                    )})
                                }
                            )
                        }
                    )
                });
                

            }

           
        }
    )
};


export const login = (req, res, next) => {

    // check email already exist 
    const checkPseudo = sqlCheckPseudo(
        req.body.pseudo
    )
    
    DB.query(
        checkPseudo,
        (err, Result) => {
         
            if (err) res.status(500).json({ error: "erreur serveur" });
            console.log(Result.length)
            if (Result.length <= 0) {
                return res.status(404).json({ msg: "Pseudo invalide" });
            }
            // login 
           
            const login = sqlLogin(
                req.body.pseudo
            );

            DB.query(
                login,
                (err, result) => {
                    if (err) throw err;
                    if (!req.body.secretKey) {
                        return res.status(401).json({ msg: 'veuillez entrer un mot de passe.' })
                    }
                    console.log(req.body.secretKey , result[0].secretKey)
                    bcrypt.compare(req.body.secretKey, result[0].secretKey, function (err, isValid) {
                        if (isValid) {
                            const number = result[0].number_connections + 1;
                            const NumberLogin = sqlNumberLogin(
                                number,
                                result[0].uuid
                            );
                            DB.query(
                                NumberLogin,        
                                (err, Result) => {
                                    if (err) throw err;
                                    res.status(201).json({ 
                                        user: result[0],  
                                        token: jwt.sign(
                                        { userToken: result[0].uuid },
                                        process.env.SECRET_TOKEN_KEY,
                                        { expiresIn: '12h' },
                                    )})
                                })
                            
                           }
                           if (err) {
                            res.status(401).json({ msg: "password invalide" })
                           }
                    })
                })
        }
    )
};


export const connectAuth = (req, res, next) => {

    if (!req.body.authorization) {
        res.status(401).json({ msg: "pas de token" })
    } else {
        const token = req.body.authorization.split(' ')[1];
        console.log(token)
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY, (error, decoded) => {
            if (error) {
                
                res.status(401).json({ msg: error })
            } else {
                if (!decoded.userToken) {
                    res.status(401).json('token non valide')
                } else {
                    const getAccount = sqlGetAccount(
                        decoded.userToken
                    );
                    DB.query(
                        getAccount,
                        (err, Result) => {
                            if (err) throw err;

                            if (Result.length === 0) {
                                console.log("utilisateur non trouvable")
                                res.status(404).json({ msg: "utilisateur non trouver" })
                            } else {
                                const setToken = jwt.sign(
                                    { userToken: Result[0].uuid },
                                    process.env.SECRET_TOKEN_KEY_CONNECT,
                                    { expiresIn: '12h' },
                                )
                              
                                const result = [{
                                    uuid: Result[0].uuid,
                                    pseudo: Result[0].pseudo,
                                    admin: Result[0].admin,
                                    ban: Result[0].ban,
                                    vip: Result[0].vip,
                                    creation_date: Result[0].creation_date,
                                    number_connections: Result[0].number_connections
                                }]


                                res.status(201).json({ result, token })
                            }
                        }
                    )
                }
            }

        });
    }
}
