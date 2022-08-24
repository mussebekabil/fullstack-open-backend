const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRoute = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const { info, error } = require('./utils/logger')
const { MONGODB_URI } = require('./utils/config')

info('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    info('connected to MongoDB')
  })
  .catch((e) => {
    error('error connection to MongoDB:', e.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRoute)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
