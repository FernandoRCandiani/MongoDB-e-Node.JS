// Carregando módulos
const express = require("express")
const handlabars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Usuario")
const Usuario = mongoose.model("usuarios")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)

// Configurações
    // Sessão
    app.use(session({
        secret: "projetoteste",
        resave: true,
        saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    // Middleware 
    app.use(function(req, res, next){
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user =req.user || null;
        next();
    })

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // Handlebars
        app.engine("handlebars", handlabars({defaultLayout: "main"}));
        app.set("view engine", "handlebars");
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/projetoteste").then(()=>{
            console.log("Conectado ao mongo");
        }).catch( function(err){
            console.log("Erro ao se conectar: " + err)
        })

    // Public
        app.use(express.static(path.join(__dirname, "public")))

// Rotas
    app.get("/", (req, res) => {
        Usuario.find().lean().populate("usuario").sort({data: "desc"}).then((usuarios) => {
            res.render("index", {usuarios: usuarios})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
        
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })

    app.use("/usuarios", usuarios)

// Outros
const PORT = 8081;
app.listen(PORT, function(){
    console.log("Servidor rodando!")
})