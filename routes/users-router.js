const express = require("express");
let router = express.Router();
const userData = require("../data/users.json");

//User Functions
var users = {}
var userNames = {}

userData.forEach(user => {
    users[user.id] = user;
    userNames[user.username] = 1;
})


router.get('/', parseQuery, getUser);
router.get('/:userID', getSpecificUser);

function parseQuery(req, res, next){
  req.properParse = {}

  if (req.query.name && userNames.hasOwnProperty(req.query.name.toLowerCase())){
      req.properParse.name = req.query.name.toLowerCase();
  }else if(req.query.name == null){
  //continue
  }else{
  var partialCheck = Object.keys(req.query.name).filter(function(name) {
    return (name.toLowerCase().indexOf(req.query.name.toLowerCase()) > -1) || (req.query.name.toLowerCase().indexOf(name.toLowerCase()) > -1);
  });
  if (partialCheck){
    req.properParse.name = req.query.name.toLowerCase();
  }
}
  next();
}

function getUser(req, res, next){
  let finalUsers = []
  for(let id in users){
      let currentUser = users[id];

      let checkUserExists = ((!req.properParse.name) || (currentUser.username.toLowerCase().indexOf(req.properParse.name) >= 0))

      if(checkUserExists){
          finalUsers.push(currentUser);
      }
  }
  res.format({
      'text/html' : function(){
        if(finalUsers.length === null || finalUsers.length === 0){
          res.status(404).send("Could Not Find User")
        } else {
          res.render('searchUser', {users: finalUsers, session : req.session})
        }
      },
      'application/json' : function(){
        if(finalUsers.length == null || finalUsers.length === 0){

          res.status(404).send("Could Not Find User")
        }else{
          res.status(200).send(JSON.stringify(finalUsers));
        }
      },
    })
}

function getSpecificUser(req, res, next){
  
  let userID = req.params.userID
  //check if logged in user is following this user
  let isFollowing = false;
  for(user in users){
    if(users[user].id === req.session.uid){
      let following = (users[user].following)
      //console.log(following)
      if(following.includes(userID)){
        isFollowing = true
      }
    }
  }

   if (users.hasOwnProperty(userID)) {
      console.log("[getSpecificUser] rendering user profile page")
      
      res.format({
       'text/html': function () {
         res.status(200).render('user', {user : users[userID], session: req.session, isFollowing: isFollowing})
       },
       'application/json': function() {
         res.send(users[userID])
       },
     })
   } else {
     res.status(404).send("Invalid User ID.")
  }
}

module.exports = router;