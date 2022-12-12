const express = require('express')
const database = require('../database')
const router = express.Router()

/* GET register page. */
router.get('/', function (req, res) {
  const sessionUser = req.session.user

  // Only send to register page if not logged in already.
  if (sessionUser === undefined) {
    res.render('register', {
      title: 'Register',
      user: sessionUser
    })
  } else {
    res.redirect('/')
  }
})

/* POST register form. */
router.post('/', function (req, res) {
  const sessionUser = req.session.user

  // Only accept data if user isn't already logged in
  if (sessionUser === undefined) {
    // Verify that all required information was given
    if (!req.body.email || !req.body.password || !req.body.username || !req.body.first_name || !req.body.last_name || !req.body.skill) {
      // Missing information.
      res.status(400)
      res.render('register', {
        title: 'Register',
        error_message: 'Missing a required field! Please fill out all fields and try again.'
      })
    } else {
      // All information was supplied. Validate that account is unique.
      database.getUserByUsername(req.body.username).then((user) => {
        if (user !== null) {
          res.render('register', {
            title: 'Register',
            error_message: 'A user with this email already exists!'
          })
        } else {
          database.getUserByEmail(req.body.email).then((user) => {
            if (user !== null) {
              res.render('register', {
                title: 'Register',
                error_message: 'A user with this username already exists! Please select another.'
              })
            } else {
              // Account is unique. Create the new user.
              database.createUser(req.body.first_name, req.body.last_name, req.body.username, req.body.email, req.body.password, req.body.skill).then((newUser) => {
                // Ensure user was created successfully
                if (newUser !== null) {
                  // Created successfully, set session and redirect home
                  req.session.user = newUser
                  res.redirect('/')
                } else {
                  // User creation failed
                  res.render('register', {
                    title: 'Register',
                    error_message: 'Creation of user failed. Please contact support@zandercraft.ca.'
                  })
                }
              })
            }
          })
        }
      })
    }
  } else {
    res.redirect('/')
  }
})

module.exports = router
