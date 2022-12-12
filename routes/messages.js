const express = require('express')
const database = require('../database')
const { all } = require('express/lib/application')
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

/* GET create conversation */
router.get('/create', function (req, res) {
  const sessionUser = req.session.user

  // Ensure user is logged in.
  if (sessionUser !== undefined) {
    database.getAllUsers().then((all_users) => {
      // Find and remove the sessionUser from the list
      let currUserIdx = all_users.findIndex((user) => {
        return user.username === sessionUser.username
      })
      all_users.splice(currUserIdx, 1)

      res.render('messages_create', {
        title: 'New Conversation',
        user: sessionUser,
        users: all_users
      })
    }).catch((reason) => {
      res.render('messages_create', {
        title: 'New Conversation',
        user: sessionUser,
        error_message: "ERROR: Unable to retrieve users to create conversation with."
      })
      process.stdout.write('ERROR: Unable to retrieve list of users to create conversation with: ', reason)
    })
  } else {
    // Redirect to login page
    res.redirect('/login')
  }
})

/* POST create conversation */
router.post('/create', (req, res) => {
  const sessionUser = req.session.user

  // Ensure user is logged in
  if (sessionUser !== undefined) {
    // Ensure at least one user is provided
    if (req.body.participants.length > 0) {
      // Add the sessionUser to the conversation
      let participants
      if (typeof(req.body.participants) === "string") {
        participants = [req.body.participants]
      } else {
        participants = req.body.participants
      }
      participants.push(sessionUser._id)

      // Get the users by their IDs
      database.getUsersById(participants).then((users) => {
        // Valid users selected. Create a conversation with the selected users
        database.createConversation(req.body.name, users).then((conversation) => {
          // Conversation created. Redirect user to their messages.
          res.redirect('/messages')
        }).catch((reason) => {
          // Unable to create conversation
          database.getAllUsers().then((all_users) => {
            res.status(400)
            res.render('messages_create', {
              title: 'New Conversation',
              user: sessionUser,
              users: all_users,
              error_message: "ERROR: Something went wrong creating the conversation. Please try again."
            })
          }).catch((reason) => {
            res.status(400)
            res.render('messages_create', {
              title: 'New Conversation',
              user: sessionUser,
              error_message: "ERROR: Something went wrong creating the conversation. Please try again.\n" +
                "ERROR: Unable to retrieve users to create conversation with."
            })
            process.stdout.write('ERROR: Unable to retrieve list of users to create conversation with: ', reason)
          })
          process.stdout.write('ERROR: Unable to create conversation: ', reason)
        })
      }).catch((reason) => {
        // Invalid user selection
        database.getAllUsers().then((all_users) => {
          res.status(400)
          res.render('messages_create', {
            title: 'New Conversation',
            user: sessionUser,
            users: all_users,
            error_message: "ERROR: Something went wrong with your user selection. Please try again."
          })
        }).catch((reason) => {
          res.status(400)
          res.render('messages_create', {
            title: 'New Conversation',
            user: sessionUser,
            error_message: "ERROR: Something went wrong with your user selection. Please try again.\n" +
              "ERROR: Unable to retrieve users to create conversation with."
          })
          process.stdout.write('ERROR: Unable to retrieve list of users to create conversation with: ', reason)
        })
        process.stdout.write('ERROR: Unable to retrieve selected users to create conversation with: ', reason)
      })
    } else {
      database.getAllUsers().then((all_users) => {
        res.render('messages_create', {
          title: 'New Conversation',
          user: sessionUser,
          users: all_users,
          error_message: "ERROR: Please select at least one user to create a conversation with."
        })
      }).catch((reason) => {
        res.status(400)
        res.render('messages_create', {
          title: 'New Conversation',
          user: sessionUser,
          error_message: "ERROR: Please select at least one user to create a conversation with.\n" +
            "ERROR: Unable to retrieve users to create conversation with."
        })
        process.stdout.write('ERROR: Unable to retrieve list of users to create conversation with: ', reason)
      })
    }
  } else {
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
        for (let message of conversation.messages) {
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

/* POST messages. */
router.post('/:id', function (req, res) {
  const sessionUser = req.session.user
  const conversationId = req.params.id

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.status(400)
    res.json({ error: "Must be signed in to send messages." })
  } else {
    // User is signed in. Ensure guild exists.
    database.getConversationById(conversationId).then((g_conversation) => {
      if (g_conversation !== null) {
        // Guild exists, process form data.
        if (!req.body.message) {
          // Missing information.
          res.status(400)
          res.json({
            error: 'Invalid message form received!'
          })
        } else {
          // All information was supplied. Submit the message.
          database.addConversationMessage(conversationId, {
            author: sessionUser._id,
            message: req.body.message,
            sent_on: new Date(),
            edited: false
          }).then(() => {
            res.sendStatus(200)
          }).catch(() => {
            // Encountered an issue adding the message.
            res.json({
              error: "Error encountered when adding message"
            })
          })
        }
      } else {
        // Conversation does not exist
        res.status(404)
        res.json({
          error: "Conversation not found"
        })
      }
    })
  }
})

module.exports = router
