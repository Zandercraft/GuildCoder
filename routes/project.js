const express = require('express')
const database = require('../database')
const utils = require('../utils')
const slugify = require('slugify')
const router = express.Router()

/* GET project creation page. */
router.get('/create', function (req, res) {
  const sessionUser = req.session.user

  res.render('create_project', {
    title: 'Collab',
    user: sessionUser
  })
})

/* POST project creation form. */
router.post('/create', function (req, res) {
  const sessionUser = req.session.user

  // Only accept data if user is already logged in
  if (sessionUser !== undefined) {
    // Verify that all required information was given
    if (!req.body.name || !req.body.description || !req.body.website || !req.body.description_short) {
      // Missing information.
      res.status(400)
      res.render('create_project', {
        title: 'Collab',
        error_message: 'Missing a required field! Please fill out all fields and try again.'
      })
    } else {
      let p_slug = slugify(req.body.name)
      // All information was supplied. Create a new project
      database.getProjectBySlug(p_slug).then((project) => {
        if (project !== null) {
          // Slug is not unique.
          res.render('create_project', {
            title: 'Collab',
            error_message: 'A project with this name already exists!'
          })
        } else {
          // Project is unique. Create the new project.
          database.createProject(req.body.name, p_slug, req.body.description, req.body.description_short, req.body.website, req.body.category, req.body.email, [req.session.user._id]).then((newProject) => {
            // Ensure project was created successfully
            if (newProject !== null) {
              // Created successfully, redirect to the project's page
              res.redirect(`/project/${newProject.slug}`)
            } else {
              // Project creation failed
              res.render('create_project', {
                title: 'Collab',
                error_message: 'Creation of project failed. Please contact support@zandercraft.ca.'
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

/* GET project page. */
router.get('/:project', function (req, res) {
  const sessionUser = req.session.user
  const projectSlug = req.params.project

  // Get the project
  database.getProjectBySlug(projectSlug).then((project) => {
    if (project !== null) {
      // Project exists. Render it
      database.getProjectsByOwner(project.owners).then((projects) => {
        res.render('project', {
          title: project.name,
          user: sessionUser,
          is_user_involved: utils.isUserInvolvedWithProject(project, sessionUser),
          project: project,
          other_projects: projects
        })
      })
    } else {
      res.status(404)
      res.render('error', {
        error: {
          status: 404
        },
        message: "Project not found"
      })
    }
  })
})

/* GET project collaboration button. */
router.get('/:project/collab', function (req, res) {
  const sessionUser = req.session.user
  const projectSlug = req.params.project

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.redirect('/login')
  } else {
    // User is signed in. Ensure project exists.
    database.getProjectBySlug(projectSlug).then((project) => {
      if (project !== null) {
        // Project exists, add the user as a collaborator.
        database.addCollaborator(projectSlug, sessionUser).then(() => {
          // Successfully added as collaborator.
          res.render('project', {
            title: project.name,
            user: sessionUser,
            project: project,
            redirectToProject: true,
            is_user_involved: utils.isUserInvolvedWithProject(project, sessionUser),
            success_message: "Successfully joined the project!",
            similar_projects: []
          })
        }).catch(() => {
          // Failed to add as a collaborator
          res.render('project', {
            title: project.name,
            user: sessionUser,
            project: project,
            redirectToProject: true,
            is_user_involved: utils.isUserInvolvedWithProject(project, sessionUser),
            error_message: "Failed to join as a collaborator! Please try again later.",
            similar_projects: []
          })
        })

      } else {
        // Project does not exist

        res.status(404)
        res.render('error', {
          error: {
            status: 404
          },
          message: "Project not found"
        })
      }
    })
  }
})

/* POST project review form. */
router.post('/:project/review', function (req, res) {
  const sessionUser = req.session.user
  const projectSlug = req.params.project

  // Ensure user is signed in.
  if (!sessionUser) {
    // User isn't signed in
    res.redirect('/login')
  } else {
    // User is signed in. Ensure project exists.
    database.getProjectBySlug(projectSlug).then((project) => {
      if (project !== null) {
        // Project exists, process form data.
        if (!req.body.review) {
          // Missing information.
          res.status(400)
          res.render('login', {
            error_message: 'Invalid review form received!'
          })
        } else {
          // All information was supplied. Submit the review.
          database.addReview(projectSlug, {author: sessionUser._id, content: req.body.review}).then(() => {
            res.redirect(`/project/${projectSlug}`)
          }).catch(() => {
            // Encountered an issue adding the review.
            res.render('project', {
              title: project.name,
              user: sessionUser,
              error_message: 'There was an issue adding your review. Please try again!',
              project: project,
              project_socials: [],
              similar_projects: []
            })
          })
        }
      } else {
        // Project does not exist
        res.status(404)
        res.render('error', {
          error: {
            status: 404
          },
          message: "Project not found"
        })
      }
    })
  }
})

module.exports = router
