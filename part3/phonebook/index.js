require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('data', (req) => {
  if(req.method === 'POST' || req.method === 'PUT' ) {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))


app.get('/info', (request, response, next) => {
  console.log(request, response.getHeader('Date'))
  Person.find({})
    .then(person => response.send(`
                <div>
                    <p>Phonebook has info for ${person.length} people</p>
                    <p>${new Date()}</p>
                </div>
            `).end())
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { body } = request
  const person = new Person({
    name: body.name,
    number: body.number
  })
  Person.findOne({ name: body.name })
    .then(person => {
      if(person) {
        response.status(400).json({ error: `Person with name ${person.name} already exist` })
      }
    })
    .catch(error => next(error))

  person.save()
    .then(savedPerson => response.json(savedPerson))
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findById(id)
    .then(person => response.json(person))
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { body, params } = request
  Person.findByIdAndUpdate(
    params.id,
    { number: body.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params
  Person.findByIdAndRemove(id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
