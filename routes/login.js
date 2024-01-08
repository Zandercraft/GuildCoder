const express = require('express')
const router = express.Router()
const database = require('../database')
const site_key = "<SITE_KEY>"
const site_secret = "<SITE_SECRET>"

/* GET login page. */
router.get('/', function (req, res) {
  const sessionUser = req.session.user

  // Only send to login page if not logged in already.
  if (sessionUser === undefined) {
    res.render('login', {
      title: 'Log In',
      user: sessionUser,
      captcha_site_key: site_key
    })
  } else {
    res.redirect('/')
  }
})

/* POST login form. */
router.post('/', async function (req, res) {
  const sessionUser = req.session.user

  // Only accept data if user isn't already logged in
  if (sessionUser === undefined) {
    // Verify that all required information was given
    if (!req.body.email || !req.body.password) {
      // Missing information.
      res.status(400)
      res.render('login', {
        error_message: 'Invalid registration details!'
      })
    } else {
      // All information was supplied. Find the account.
      database.authUser(req.body.email, req.body.password, true, req.get('User-Agent')).then((result) => {
        if (result[0]) {
          req.session.user = result[1]
          res.redirect('/')
        } else {
          res.render('login', {
            title: "Login",
            error_message: 'The email or password you provided was incorrect. Please try again!'
          })
        }
      })
    }
  } else {
    res.redirect('/')
  }
})

module.exports = router
