const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRoute = require('./controllers/blogs')
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
app.use('/api/blogs', blogsRoute)

module.exports = app
