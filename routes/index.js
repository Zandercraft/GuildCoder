const express = require('express')
const router = express.Router()
const database = require('../database')
const utils = require('../utils')

/* GET home page. */
router.get('/', function (req, res, next) {
  const sessionUser = req.session.user

  database.getAllProjects().then((projects) => {
    res.render('home', {
      title: 'Home',
      user: sessionUser,
      featured_projects: utils.getMostPopularProjects(projects, 4),
      popular_projects: utils.getMostPopularProjects(projects, 12),
      latest_projects: utils.getLatest(projects, 9)
    })
  })
})

module.exports = router
