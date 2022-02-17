
// USERS 

export const sqlAuthUuid = (uuid) => {
    return `SELECT uuid FROM user WHERE uuid = "${uuid}"`
};

export const sqlCheckPseudo = (pseudo) => {
    return `SELECT pseudo FROM users WHERE pseudo='${pseudo}'`;
};

export const sqlSignup = (pseudo, secretKey, uuid) => {
    return `INSERT INTO users  (pseudo, secretKey, uuid) VALUES ("${pseudo}", "${secretKey}", "${uuid}")`;
};

export const sqlGetAccount = (uuid) => {
    return `SELECT * FROM users WHERE uuid = '${uuid}'`
}

export const sqlLogin = (pseudo) => {
    return `SELECT * FROM users WHERE pseudo = '${pseudo}'`
};

export const sqlNumberLogin = (number_connections, uuid) => {
    return `Update users SET number_connections = '${number_connections}'  WHERE uuid = '${uuid}'`
};





