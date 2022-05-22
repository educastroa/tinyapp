const bcrypt = require('bcrypt');


function generateRandomString(num) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let charactersString = '';
    for (let x = 0; x < num; x++) {
      charactersString += characters[Math.floor(Math.random() * characters.length)]
    }
    return charactersString;
} 

function urlsForUser(id, data) {
  const urlsList = {};
  for (let urls in data) {
    if (data[urls].userID === id) {
       urlsList[urls] = data[urls].longURL;
    }
  }
  return urlsList;
}

function verifyEmailPassword(reqEmail, reqPassword, users) {
  
  for (let id in users) {
    if (users[id].email === reqEmail && bcrypt.compareSync(reqPassword, users[id].password) === true) {
      return id
    }
  }
  return false
}

function isEmailExists(reqEmail, reqPassword, users) {
  
  if (reqEmail.length === 0 || reqPassword.length === 0) {
    return false;
  } 
  for (let id in users) {
    if (users[id].email === reqEmail)
    return false; 
  }  
  return true;
}

module.exports = {
  generateRandomString,
  urlsForUser,
  verifyEmailPassword,
  isEmailExists
}