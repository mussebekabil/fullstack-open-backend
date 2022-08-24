const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})  
    response.json(blogs)
  })
  
blogsRouter.post('/', async (request, response) => {
  let newBlog = request.body
  if(!Object.keys(newBlog).includes('title') || !Object.keys(newBlog).includes('url')) {
    response.status(400).end()
  }

  if(!Object.keys(newBlog).includes('likes')) {
    newBlog = {
      ...newBlog,
      likes: 0
    }
  }

  const blog = new Blog(newBlog)

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: request.body.likes },
    { new: true }
  )
  response.json(updatedBlog)
})

module.exports = blogsRouter
