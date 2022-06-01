const express = require('express');
const router = express.Router();
const passport = require("passport")
var LocalStrategy = require('passport-local');
const User = require("../models/user")

passport.use(new LocalStrategy(
    { usernameField: 'login', userpasswordField: 'password'}, 
    (login, password, done) => {
        User.findOne({login: login}, (err, user) => {
            return err
                ? done(err)
                : user
                    ? user.validPassword(password)
                        ? done(null, user)
                        : done(null, false, {message: 'Неправильный пароль'})
                    : done(null, false, {message: 'Неправильный пользователь'})
        })

    }
  ));

  passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, login: user.login, email: user.email });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        User.findById(user.id, (err, user) => {cb(err, user)})
    });
  });


const loginRequired = require('../middleware/loginRequired');

//Блок регистрации/входа
router.get('/login', (req, res) => {
    res.render("user/login", {
        title: "Войдите на сайт"
    });
});

router.post('/signup', async (req, res) => {

    const { email, login, password} = req.body;

    //пока не будем проверять, что логин не занят
    if (email.trim() != "" && login.trim() != "" && password.trim() != "") {
        const newUser = new User({login, email});
        newUser.setPassword(req.body.password); 

        try {
            await newUser.save();
            res.redirect('/user/login');
        } catch (e) {
            console.error(e);
            res.status(500).render("errors/500", {
                error: "Ошибка сохранения данных"
            });
        }
    
    } else {
        res.status(500).render("errors/500", {
            error: "При регистрации необходимо корректно заподлнить все поля!"
        });
    }
});

router.post('/login', passport.authenticate('local', {
    successReturnToOrRedirect: '/user/me',
    failureRedirect: '/user/login',
    failureMessage: true
  }));

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

router.get('/me', loginRequired, async (req, res) => {
    const sessionUserID = req.user.id
    const user = await User.findById(sessionUserID);
    if (user === null) { 
        res.status(500).render("errors/500", {
            error: "Этот пользователь не существует!"
        });
    } 
    else { 
        res.render("user/profile", {
            title: "Ваш профиль",
            user
        });
    }
});

module.exports = router;