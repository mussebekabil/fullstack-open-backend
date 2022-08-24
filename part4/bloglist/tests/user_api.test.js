const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const { usersInDb } = require('./test_helper')

const api = supertest(app)


describe('user api flows', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
  
    await user.save()
  }, 10000)
  
  test('should create new user successfully', async () => {
    const usersAtStart = await usersInDb()
  
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'testpassword',
    }
  
    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const createdUser = response.body;
    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
    expect(createdUser.username).toEqual(newUser.username)
    expect(createdUser.passwordHash).not.toBeDefined()
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'Another user',
      password: 'differentpassword',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'testuser',
      name: 'Another user',
      password: 'p',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password should have atleast 3 characters')

    const usersAtEnd = await usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})

