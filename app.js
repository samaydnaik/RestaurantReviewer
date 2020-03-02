var express = require("express")
app =express()
bodyParser=require("body-parser")
expressSanitizer=require("express-sanitizer")
mongoose=require("mongoose")
methodOverride=require("method-override")
passport = require("passport")
LocalStrategy = require("passport-local")
Blog = require("./models/blogs")
User = require("./models/user")
Comment = require("./models/comment")
seedDB = require("./seeds")

seedDB()
//mongoose.connect("mongodb://localhost/restaurant2", { useNewUrlParser: true,useUnifiedTopology:true })
//mongoose.connect("mongodb + srv://Samay:@cluster0-mxux0.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })

//const MongoClient = require('mongodb').MongoClient;
//const uri = "mongodb+srv://Samay:rT7wU4FvGCuFBE0i@cluster0-mxux0.mongodb.net/test?retryWrites=true&w=majority";
const uri = process.env.DATABASEURL

mongoose.connect(uri,{
    useNewUrlParser: true, useUnifiedTopology: true 
})
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// })
mongoose.connection.on("connected",() => {
    console.log("Mongoose is connected!!!!!")
})

app.set("view engine","ejs")   
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer())
app.use(methodOverride("_method"))


app.use(require("express-session")({
    secret: "Just like that",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(function (req, res, next) {
    res.locals.currentUser = req.user
    next()
})

app.get("/",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR!")
        }
        else{
            res.render("home",{blogs:blogs,currentUser:req.user})
        }
    })
    
})


app.get("/blogs",function(req,res){
     if(req.query.search){
         const regex= new RegExp(escapeRegex(req.query.search),'gi')
         Blog.find({title: regex}, function (err, blogs) {
             if (err) {
                 console.log("ERROR!!")
             }
             else {
                 res.render("index", { blogs: blogs,currentUser:req.user })
             }
         })
     }else{
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR!!")
        }
        else{
            res.render("index",{blogs:blogs})
        }
    })
}}
)

app.get("/blogs/register", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log("ERROR!!")
        } else {
            res.render("register")
        }
    })
})

app.post("/blogs/register",function(req,res){
    var newUser = new User({username:req.body.username})
    User.register(newUser,req.body.password, function(err,user){
        if(err){
            console.log(err)
            return res.render("register")
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/")
        })
    })
})

app.get("/blogs/login", function (req, res) {
    Blog.find({}, function (err, blogs) {
        if (err) {
            console.log("ERROR!!")
        }
        else {
            res.render("login", { blogs: blogs })
        }
    })
})


app.post("/blogs/login", passport.authenticate("local",
{
    successRedirect:"/",
    failureRedirect:"/blogs/login"
}),function(req,res){

})



app.get("/blogs/new",function(req,res){
    res.render("new")
})

app.post("/blogs",function(req,res){
     req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog,function(err,newBlog){
        if(err)
        {
            res.render("new")
        }
        else{
            res.redirect("/blogs")
        }
    })
})

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id).populate("comments").exec(function(err,foundBlog){
        if(err)
        {
            res.redirect("/blogs")
        }
        else
        {
           // console.log(foundBlog )
            res.render("show",{blog:foundBlog})
        }
    })
})

app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
        {
            res.redirect("/blogs")
        }
        else
        {
            res.render("edit",{blog:foundBlog})
        }
    })
})

app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err)
        {
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

app.delete("/blogs/:id",function(req,res)
{
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs")
        }
        else
        {
            res.redirect("/blogs")
        }
    })
})

app.get("/logout",function(req,res){
    req.logout()
    res.redirect("/")
})


//COMMENT ROUTES
app.get("/blogs/:id/comments/new",function(req,res){
    Blog.findById(req.params.id,function(err,blog){
        if(err)
        console.log(err)
        else{

            res.render("comments/new",{blog:blog})
        }
    })
})

app.post("/blogs/:id/comments",function(req,res){
    Blog.findById(req.params.id, function (err, blog) {
        if (err)
            {console.log(err)
            res.redirect("/blogs")
            }
        else {
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err)
                }
                else{
                    blog.comments.push(comment)
                    blog.save();
                    res.redirect('/blogs/'+blog._id)
                }
            })
        }
    })
})

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\s&")
}

app.listen(process.env.PORT,process.env.IP,function(){
    console.log("Server is Running")
})