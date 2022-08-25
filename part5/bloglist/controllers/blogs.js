const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { id: 1, name: 1, username: 1}) 
  response.json(blogs)
})
  
blogsRouter.post('/', userExtractor, async (request, response) => {
  let newBlog = request.body
  
  if(!newBlog.title || !newBlog.url) {
    response.status(400).end()
  }

  if(!Object.keys(newBlog).includes('likes')) {
    newBlog = {
      ...newBlog,
      likes: 0
    }
  }
  
  const user = request.user
  const blog = new Blog({
    ...newBlog,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs =  user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id); 
  if(!blog) {
    return response.status(404).json({ error: 'blog not found with this id' })
  }
  const user = request.user
  if(blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'user is not authorized to delete this blog' })
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id); 
  if(!blog) {
    return response.status(404).json({ error: 'blog not found with this id' })
  }
  const user = request.user
  if(blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'user is not authorized to delete this blog' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: request.body.likes },
    { new: true }
  ).populate('user', { id: 1, name: 1, username: 1}) 
  response.json(updatedBlog)
})

module.exports = blogsRouter
