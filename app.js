// Express Imports and app Constant
const express = require('express')
// const multer = require('multer') // Multer - file upload processing
const hbs = require('hbs') // Handlebars - templating
const session = require('express-session') // Express-Session - Server-side client session handling
const MongoStore = require('connect-mongo') // Express-Session - Session Storage in MongoDB
const mongoString = require('./bin/www').mongoString
const cookieParser = require('cookie-parser') // (Session dependency) - Cookie parsing
const app = express()

// Error Handling Imports
const createError = require('http-errors')

// Utility Imports
const path = require('path')
const logger = require('morgan')


// --- Multer Image Storage Setup ---
// const iconStorage = multer.diskStorage({
//   destination: './public/images/uploaded/user_icon',
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// })
// const upload = multer({ iconStorage })

// --- Router Imports ---
const indexRouter = require('./routes/index')
const profileRouter = require('./routes/profile')
const projectRouter = require('./routes/project')
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const termsRouter = require('./routes/terms')
const privacyRouter = require('./routes/privacy')
const logoutRouter = require('./routes/logout')
const newRouter = require('./routes/new')
const trendingRouter = require('./routes/trending')
const userSettingsRouter = require('./routes/user_settings')
const guildsRouter = require('./routes/guilds')
const guildRouter = require('./routes/guild')
const messagesRouter = require('./routes/messages')

// --- Handlebars View Engine Setup ---
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// --- Handlebars Helpers ---
hbs.registerHelper("formatDate", function(date) {
  let unformattedDate = new Date(date)
  return String(unformattedDate.toISOString().slice(0, 10)) // Return only date portion of string
});
hbs.registerHelper('equals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// --- Middleware Setup ---
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  secret: 'SecretKey',
  store: MongoStore.create({ mongoUrl: "mongodb+srv://senecaDBUser:nVZpo97O15m7L6EQ@seneca-web.vw4knv6.mongodb.net/web322_week8" })
}))
app.use(express.static(path.join(__dirname, 'public')))

// --- Routers ---
app.use('/', indexRouter)
app.use('/project', projectRouter)
app.use('/profile', profileRouter)
app.use('/register', registerRouter)
app.use('/login', loginRouter)
app.use('/terms', termsRouter)
app.use('/privacy-policy', privacyRouter)
app.use('/logout', logoutRouter)
app.use('/new', newRouter)
app.use('/trending', trendingRouter)
app.use('/settings', userSettingsRouter)
app.use('/guilds', guildsRouter)
app.use('/guild', guildRouter)
app.use('/messages', messagesRouter)

// -- Forward 404s to error handler --
app.use(function (req, res, next) {
  next(createError(404))
})

// --- Error Handler ---
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', { title: 'Error' })
})

module.exports = app
