var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"), // takes data from a form!
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")

mongoose.connect("mongodb://localhost/auth_demo_app");
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "Rusty is the best and cutest dog in the world",
    resave: false,
    saveUninitialized: false
}));

// v those 2 lines are needed whenever we use passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));

/*  these 2 methods above are rly important. they're responsable for reading
    the session, taking the data from the session that's encoded and unincoding it */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============
// ROUTES
//============

app.get("/", function(req, res){
    res.render("home");
});

// O argumento isLoggedIn vai checar se o usuário está logado antes de redirecionar para /secret
app.get("/secret",isLoggedIn, function(req, res){
   res.render("secret");
});

// Auth Routes

//show sign up form
app.get("/register", function(req, res){
   res.render("register");
});
//handling user sign up
app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      /*the reason only "username" is inside the object above is because we don't wanna
      save the password in the database, that's why the password is one the second argument
      password will store a huge hash instead of the actual password.
      */
        if(err){
            console.log(err);
            return res.render('register');
            /*the return is used bc if there's an error, the rest of the code wont need to be used*/
        }
        passport.authenticate("local")(req, res, function(){
          /*this line will log the user in
          "local" is because the user will sign in with username and password
          but it could be "twitter" or "facebook" or "google" etc...*/
           res.redirect("/secret");
        });
    });
});

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login");
});
//login logic
//middleware: code that runs before our final callback
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000, function(){
    console.log("server started.......");
})
