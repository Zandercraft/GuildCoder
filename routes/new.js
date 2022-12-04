const express = require('express')
const router = express.Router()
const database = require('../database')
const utils = require('../utils')

/* GET new projects page. */
router.get('/', function (req, res, next) {
  const sessionUser = req.session.user

  database.getAllProjects().then((p_projects) => {
    res.render('new', {
      title: 'New Projects',
      user: sessionUser,
      projects: utils.getLatest(p_projects)
    })
  })
})

module.exports = router
