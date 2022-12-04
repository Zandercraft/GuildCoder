const express = require('express')
const router = express.Router()

/* GET terms page. */
router.get('/', function (req, res) {
  const sessionUser = req.session.user
  res.render('privacy', {
    title: 'Privacy Policy',
    user: sessionUser,
    last_update: '2022-11-03 at 4:08pm Eastern Time'
  })
})

module.exports = router
