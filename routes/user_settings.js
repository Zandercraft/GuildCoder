const express = require('express')
const database = require('../database')
const router = express.Router()

/* GET user settings page. */
router.get('/', function (req, res) {
  const sessionUser = req.session.user

  // Only send to user settings page if the user is logged in
  if (sessionUser !== undefined) {
    res.render('user_settings', {
      title: 'Account Settings',
      user: sessionUser
    })
  } else {
    res.redirect('/')
  }
})

/* POST user settings form. */
router.post('/', function (req, res) {
  const sessionUser = req.session.user

  // Only accept data if user is logged in
  if (sessionUser !== undefined) {
    // Verify that all required information was given
    if (!req.body.email || !req.body.password || !req.body.first_name || !req.body.last_name || !req.body.skill
        || !req.body.profile_header || !req.body.bio || !req.body.extended_bio || !req.body.icon_url || !req.body.contact_schedule) {
      // Missing information.
      res.status(400)
      res.render('user_settings', {
        title: 'Account Settings',
        user: sessionUser,
        error_message: 'Missing a required field! Please fill out all fields and try again.'
      })
    } else {
      // All information was supplied. Validate that email provided is not already in use.
      database.getUserByEmail(req.body.email).then((user) => {
        if (user !== null && (req.body.email !== sessionUser.email)) {
          res.render('user_settings', {
            title: 'Account Settings',
            user: sessionUser,
            error_message: 'Another user with this email already exists! Please use a different one.',
          })
        } else {
          // Email is unique. Ensure password is correct.
          database.authUser(sessionUser.email, req.body.password).then((user) => {
            if (user[0] !== false) {
              let showContactEmail = (req.body.show_contact_email !== undefined)
              console.log(req.body.show_contact_email)
              database.updateUser(sessionUser.email, {
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                contact_email: req.body.contact_email,
                show_contact_email: showContactEmail,
                bio: req.body.bio,
                profile_header: req.body.profile_header,
                extended_bio: req.body.extended_bio,
                icon_url: req.body.icon_url,
                contact_schedule: req.body.contact_schedule
                // TODO: Add password update support (needs to hash)
              }).then((updateStatus) => {
                // Ensure user was updated successfully
                if (updateStatus) {
                  // Updated successfully, log user out and redirect home
                  req.session.destroy()
                  res.redirect('/')
                } else {
                  // User update failed
                  res.render('user_settings', {
                    title: 'Account Settings',
                    user: sessionUser,
                    error_message: 'Account settings update failed. Please contact support@zandercraft.ca.'
                  })
                }
              })
            } else {
              // Password provided was incorrect.
              res.render('user_settings', {
                title: 'Account Settings',
                user: sessionUser,
                error_message: 'The password you provided was incorrect.'
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
