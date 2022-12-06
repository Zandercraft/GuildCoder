const express = require('express')
const database = require('../database')
const utils = require('../utils')
const slugify = require('slugify')
const router = express.Router()

/* GET guild creation page. */
router.get('/create', function (req, res) {
  const sessionUser = req.session.user

  res.render('create_guild', {
    title: 'Create Guild',
    user: sessionUser
  })
})

/* POST guild creation form. */
router.post('/create', function (req, res) {
  const sessionUser = req.session.user

  // Only accept data if user is already logged in
  if (sessionUser !== undefined) {
    // Verify that all required information was given
    if (!req.body.name || !req.body.description || !req.body.website || !req.body.description_short) {
      // Missing information.
      res.status(400)
      res.render('create_guild', {
        title: 'Create Guild',
        error_message: 'Missing a required field! Please fill out all fields and try again.'
      })
    } else {
      let g_slug = slugify(req.body.name)
      // All information was supplied. Create a new project
      database.getGuildBySlug(g_slug).then((guild) => {
        if (guild !== null) {
          // Slug is not unique.
          res.render('create_guild', {
            title: 'Create Guild',
            error_message: 'A guild with this name already exists!'
          })
        } else {
          // Project is unique. Create the new guild.
          database.createGuild(req.body.name, g_slug, req.body.description, req.body.description_short, req.body.website, req.body.email, [sessionUser._id]).then((newGuild) => {
            console.log(guild)
            // Ensure guild was created successfully
            if (newGuild !== null) {
              // Created successfully, redirect to the project's page
              res.redirect(`/guild/${newGuild.slug}`)
            } else {
              // Project creation failed
              res.render('create_guild', {
                title: 'Create Guild',
                error_message: 'Creation of guild failed. Please contact support@zandercraft.ca.'
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

/* GET guild page. */
router.get('/:guild', function (req, res) {
  const sessionUser = req.session.user
  const guildSlug = req.params.guild

  // Get the guild
  database.getGuildBySlug(guildSlug).then((g_guild) => {
    if (g_guild !== null) {
      // Guild exists. Render it
      res.render('guild', {
        title: g_guild.name,
        user: sessionUser,
        is_user_involved: utils.isUserInvolvedWithGuild(g_guild, sessionUser),
        guild: g_guild
      })
    } else {
      res.status(404)
      res.render('error', {
        error: {
          status: 404
        },
        title: "404",
        message: "Guild not found"
      })
    }
  })
})

/* GET guild's messages. */
router.get('/:guild/messages', function (req, res) {
  const sessionUser = req.session.user
  const guildSlug = req.params.guild

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.status(400)
    res.json({error: "Must be signed in to read a guild's messages."})
  } else {
    // User is signed in. Ensure guild exists.
    database.getGuildBySlug(guildSlug).then((g_guild) => {
      if (g_guild !== null) {
        // Guild exists, return the messages as a json object.
        let guild_messages = []
        for (let message of g_guild.messages) {
          guild_messages.push({
            author: {
              username: message.author ? message.author.username : 'Deleted User',
              icon_url: message.author ? message.author.icon_url : '/images/default-user-icon.png'
            },
            message: message.message,
            sent_on: message.sent_on,
            edited: message.edited
          })
        }

        res.status(200).json(guild_messages)
      } else {
        // Guild does not exist
        res.status(404)
        res.json({error: "Guild does not exist"})
      }
    })
  }
})

/* POST guild's messages. */
router.post('/:guild/messages', function (req, res) {
  const sessionUser = req.session.user
  const guildSlug = req.params.guild

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.status(400)
    res.json({error: "Must be signed in to send guild messages."})
  } else {
    // User is signed in. Ensure guild exists.
    database.getGuildBySlug(guildSlug).then((g_guild) => {
      if (g_guild !== null) {
        // Guild exists, process form data.
        if (!req.body.message) {
          // Missing information.
          res.status(400)
          res.json({
            error: 'Invalid message form received!'
          })
        } else {
          // All information was supplied. Submit the message.
          database.addMessage(guildSlug, {author: sessionUser._id, message: req.body.message, sent_on: new Date(), edited: false}).then(() => {
            res.sendStatus(200)
          }).catch(() => {
            // Encountered an issue adding the message.
            res.json({
              error: "Error encountered when adding message"
            })
          })
        }
      } else {
        // Guild does not exist
        res.status(404)
        res.json({
          error: "Guild not found"
        })
      }
    })
  }
})

/* GET guild join button. */
router.get('/:guild/join', function (req, res) {
  const sessionUser = req.session.user
  const guildSlug = req.params.guild

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.redirect('/login')
  } else {
    // User is signed in. Ensure guild exists.
    database.getGuildBySlug(guildSlug).then((g_guild) => {
      if (g_guild !== null) {
        // Guild exists, add the user as a member.
        database.addGuildMember(guildSlug, sessionUser).then(() => {
          // Successfully added as collaborator.
          res.render('guild', {
            title: g_guild.name,
            user: sessionUser,
            is_user_involved: utils.isUserInvolvedWithGuild(g_guild, sessionUser),
            guild: g_guild,
            success_message: "Successfully joined the guild!",
            redirectToGuild: true
          })
        }).catch(() => {
          // Failed to add as a collaborator
          res.render('guild', {
            title: g_guild.name,
            user: sessionUser,
            is_user_involved: utils.isUserInvolvedWithGuild(g_guild, sessionUser),
            guild: g_guild,
            error_message: "Failed to join as a member! Please try again later.",
            similar_projects: []
          })
        })

      } else {
        // Guild does not exist
        res.status(404)
        res.render('error', {
          error: {
            status: 404
          },
          message: "Guild not found"
        })
      }
    })
  }
})

module.exports = router
