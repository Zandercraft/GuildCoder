const express = require('express')
const router = express.Router()
const database = require('../database')
const utils = require('../utils')

/* GET new projects page. */
router.get('/', function (req, res, next) {
  const sessionUser = req.session.user

  database.getAllGuilds().then((g_guilds) => {
    res.render('guilds', {
      title: 'Guilds',
      user: sessionUser,
      guilds: utils.getLatest(g_guilds)
    })
  })
})

module.exports = router
