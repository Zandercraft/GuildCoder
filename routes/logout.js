const express = require('express')
const router = express.Router()

/* GET login page. */
router.get('/', function (req, res) {
  // Clear user session
  req.session.destroy()

  res.redirect('/')
})

/* POST login form. */
router.post('/', function (req, res) {
  // Clear user session
  req.session.destroy()

  res.redirect('/')
})

module.exports = router
