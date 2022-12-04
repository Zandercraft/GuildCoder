const express = require('express')
const database = require('../database')
const router = express.Router()

/* GET messages page. */
router.get('/', function (req, res) {
  const sessionUser = req.session.user

  // Ensure user is logged in.
  if (sessionUser !== undefined) {
    // Get the conversations
    database.getConversationsByParticipant(sessionUser).then((conversations) => {
      res.render('messages', {
        title: "Messages",
        user: sessionUser,
        user_conversations: conversations
      })
    })
  } else {
    // Redirect to login page
    res.redirect('/login')
  }

})

/* GET messages */
router.get('/:id', function (req, res) {
  const sessionUser = req.session.user
  const conversationId = req.params.id

  // Ensure user is logged in.
  if (sessionUser !== undefined) {
    // Get the conversation contents
    database.getConversationById(conversationId).then((conversation) => {
      // Ensure conversation exists
      if (conversation !== undefined) {
        // Construct a JSON object to return
        let messages = []
        // Populate messages
        console.log(conversation.messages)
        for (let message in conversation.messages) {
          messages.push({
            author: {
              username: message.author ? message.author.username : 'Deleted User',
              icon_url: message.author ? message.author.icon_url : '/images/default-user-icon.png'
            },
            message: message.message,
            sent_on: message.sent_on,
            edited: message.edited
          })
        }

        res.json(messages)
      } else {
        process.stderr.write(`ERROR: Encountered when retrieving conversation. Doesn't exist.`)
        res.status(404)
        res.json({
          error: "Conversation not found"
        })
      }

    })
  } else {
    res.redirect('/login')
  }
})

module.exports = router
