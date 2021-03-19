if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB = process.env.DB_CONNECTION ||  process.env.MONGO

//Connect to db
const mongoose = require('mongoose')
mongoose.connect(MONGODB, {useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database!'))

app.locals.basedir = "./";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Template Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

//Node Module files
app.use("/jquery", express.static(path.join(__dirname, "/node_modules/jQuery/dist")));
app.use("/bootstrap", express.static(path.join(__dirname, "/node_modules/bootstrap/dist")));

//SESSIONS
//Create Session Object
app.use(
	session({
		cookie: {
			maxAge: 1800000, //30 mins
		},
    secret: "secret message",
    resave: true,
    saveUninitialized: false
	})
);
//Movie Router
let moviesRouter = require("./routes/movies-router");
app.use("/movies", moviesRouter);

//People Router
let peopleRouter = require("./routes/people-router");
app.use("/people", peopleRouter);

let userRouter = require("./routes/users-router")
app.use("/users", userRouter);

//GET Requests
app.get("/", (req, res, next) => {
	//console.log(req.session);
	res.redirect('/movies')
});
app.get("/login", (req, res) => {
  console.log(req.session)
	res.render("login", { session: req.session });
});
app.get("/signup", (req, res) => {
	res.render("signup");
});
app.get("/test", (req, res) => {
	res.render("newmovies");
});
app.get("/profile", (req, res) => {
	res.render("profile");
});

app.post("/switchUserType", switchUserType);
app.post("/followUser", followUser);
//Logging In/Out
app.get("/logOutUser", logOutUser)
app.post("/signUpUser", signUpUser, logInUser)
app.post("/logInUser", logInUser);

function followUser(req, res){
  let userID
  console.log(req.body)
  console.log(req.path)
  console.log(req.url)
  /*
  if(req.body.state == "unfollow"){
    if(users.hasOwnProperty(req.session.uid)){
      for(user in users){
        if(users[user].id === (req.session.uid)){
          let id = req.path.split('/')
          -
          userID = id[id.length - 1]
          console.log(userID)
          let index = users[user].following.indexOf(userID)
          if(index > -1){
             users[user].following.splice(index, 1)
          }
        }
        
      }
    }
    console.log(users)
  }
  */
  res.redirect('/users/' +  userID)
}
// ===  Functions  ===
//switching account type
function switchUserType(req, res){
  for(user in users){
    if(users[user].id === (req.session.uid)){
      if(users[user].isContributor){
        users[user].isContributor = false;
      }else{
        users[user].isContributor = true;
      }
      console.log("done")
    }
    console.log(users[user])
  }
  res.redirect('/users/' +  req.session.uid)
}

//Logging In/Out functions
function logOutUser(req, res){
  console.log("=== Logging Out ===")
  req.session.destroy()
  res.redirect('/login')
}

function signUpUser(req, res, next){
  console.log("POST /signUpUser")

  let newUser = req.body
  if(newUser.username === null || newUser.password === null){
    res.status(300).redirect("signUpUser");
  } else if (userNames.hasOwnProperty(newUser.username)){
    res.status(300).send("Username already Exists!")
  } else{

    newUser.id = "user10"
    newUser.followers = []
    newUser.following = []
    newUser.reviews = []
    newUser.movieList = []
    newUser.accountType = 'regular'
    console.log(newUser)

    users[newUser.id] = newUser
    //console.log(users)
    next()
  }
}

function logInUser(req, res) {
  console.log("[logInUser] " + req.body.username + " is attempting to login");

	if (req.session.loggedin == true) {
    res.render('login');
    console.log("[logInUser] user is already Logged in")
	} else {
    let logUser = req.body;
		let authBool = true;

		for(user in users){
			if (logUser.username == users[user].username && logUser.password == users[user].password) {
        console.log("[logInUser] user account has been located");
        authBool = false;

        req.session.uid = users[user].id;
				req.session.username = logUser.username;
        req.session.loggedin = true;

        console.log("[logInUser] user logged in successfully")
        console.log("[logInUser] redirecting to user profile")
				res.status(200).redirect(`/users/${user}`);
			}
		}
		if (authBool) {
      console.log("[logInUser] user could not be found")
      req.setAttribute("logged", false)
			res.redirect('/login')
		}
	}
}

app.listen(PORT, () => {
	console.log(`Server started and listening at http://localhost:${PORT}`);
});

