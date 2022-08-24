const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb } = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  for(const blog of initialBlogs) {
    await new Blog(blog).save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog should have id instead of _id in returned blogs', async () => {
  const response = await api.get('/api/blogs')
  response.body.forEach(b => expect(b.id).toBeDefined())
})

test('should create a new blog', async () => {
  const newBlog = {
    title: "Unit Test",
    author: "Alan Bob",
    url: "https://test-blog-url.com/",
    likes: 4
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blog = response.body
  expect(blog.id).toBeDefined()
  expect(blog).toMatchObject(newBlog)

  const updatedBlogList = await blogsInDb()
  expect(updatedBlogList).toHaveLength(initialBlogs.length + 1)

})
test('should default likes to 0 if not specified', async () => {
  const newBlog = {
    title: "Blog without likes",
    author: "Alan Bob",
    url: "https://test-blog-url.com/"
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
  
  const blog = response.body
  expect(blog.likes).toEqual(0)
})

test('should return 400 if title is not specified', async () => {
  const newBlog = {
    author: "Alan Bob",
    url: "https://test-blog-url.com/",
    likes: 4
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('should return 400 if url is not specified', async () => {
  const newBlog = {
    title: "Blog without url",
    author: "Alan Bob",
    likes: 4
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('should delete a blog by id', async () => {
  const blogsAtStart = await blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(r => r.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('should update likes a blog by id', async () => {
  const blogsBeforeUpdate = await blogsInDb()
  const blogToUpdate = blogsBeforeUpdate[0]

  const response = await api
  .put(`/api/blogs/${blogToUpdate.id}`)
  .send({ likes: 22 })
  .expect(200)

const updatedBlog = response.body
  expect(updatedBlog.likes).toBe(22)
  expect(updatedBlog.likes).not.toBe(blogToUpdate.likes)
})

afterAll(() => {
  mongoose.connection.close()
})
