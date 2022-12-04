const express = require('express')
const router = express.Router()
const database = require('../database')
const utils = require('../utils')

/* GET profile page. */
router.get('/:username', function (req, res) {
  const sessionUser = req.session.user
  const username = req.params.username
  database.getUserByUsername(username).then((p_user) => {
    if (p_user !== null) {
      utils.getInvolvedProjects(p_user).then((projects) => {
        res.render('profile', {
          title: p_user.username,
          user: sessionUser,
          profile: p_user,
          user_projects: projects,
        })
      })
    } else {
      res.status(404)
      res.render('error', {
        error: {
          status: 404
        },
        message: "User not found"
      })
    }
  })
})

module.exports = router
