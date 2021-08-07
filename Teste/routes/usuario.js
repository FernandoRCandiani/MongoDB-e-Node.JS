const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/cadastro", (req, res) => {
    res.render("usuarios/cadastro")
})

router.post("/cadastro", (req, res) =>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "E-mail inválido"})
    }

    if(!req.body.cpf || typeof req.body.cpf == undefined || req.body.cpf == null){
        erros.push({texto: "CPF inválida"})
    }

    if(req.body.cpf.length != 11){
        erros.push({texto: "CPF inválida"})
    }

    if(erros.length > 0){

        res.render("usuarios/cadastro", {erros: erros});

    }else{

        Usuario.findOne({email: req.body.email}).lean().then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe um conta com este e-mail no nosso sistema")
                res.redirect("/usuarios/cadastro")
            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    cpf: req.body.cpf
                    
                })

                bcrypt.genSalt(10, function(erro, salt){
                    bcrypt.hash(novoUsuario.cpf, salt, function(erro, hash){
                        if(erro){
                            req.flash("error_msg", "Houver um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.cpf = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")

                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            res.redirect("/usuarios/cadastro")
                        })
                    })
                })
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/perfis/editperfis/:id", (req, res) => {
    Usuario.findOne({_id:req.params.id}).lean().then(function(usuario){
        res.render("usuarios/editperfis", {usuario: usuario})
    }).catch(function(err){
        req.flash("error_msg", "Esta perfil existe")
        res.redirect("/usuarios/perfis")
    })
})

router.post("/perfis/editperfis", function(req, res){

    Usuario.findOne({_id: req.body.id}).then( function(usuario){

        usuario.nome = req.body.nome;
        usuario.email = req.body.email;
        usuario.cpf = req.body.cpf


        usuario.save().then(function(){
            req.flash("success_msg", "Perfil editada com sucesso!");
            res.redirect("/usuarios/perfis")
        }).catch(function(err){
            req.flash("error_msg", "Houver um erro ao interno ao edição do perfil")
            res.redirect("/usuarios/perfis")
        })

    }).catch(function(err){
        req.flash("error_msg", "Houver um erro ao editar o perfil")
        res.redirect("/usuarios/perfis")
    })
})

router.post("/perfis/deletar", function(req, res){
    Usuario.remove({_id: req.body.id}).then(function(){
            req.flash("success_msg", "Perfil deletado com sucesso!")
            res.redirect("/usuarios/perfis")
      }).catch(function(err){
        req.flash("error_msg", "Houver um erro ao deletar o perfil")
        res.redirect("/usuarios/perfis")
    })
})


// Perfil do usuario
router.get("/perfis", (req, res) =>{
    Usuario.find().lean().then((usuarios) =>{
        res.render("usuarios/perfis", {usuarios: usuarios})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao mostar perfis")
        req.redirect("/usuarios")
    })
})


router.get("/login", (req,res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res,next) =>{

    passport.authenticate("local",{
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

router.get("/logout", (req, res) => {

    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")
})


module.exports = router