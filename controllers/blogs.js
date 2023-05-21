const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

//getting blogs
blogsRouter.get('/', async(request, response) => {
   const blogs = await Blog
   .find({}).populate('user', { username: 1, name: 1 })
   response.json(blogs)
  })

  //adding a blog
  blogsRouter.post('/', async(request, response) => {
    const body = request.body

    const user = await request.user

    if(!user)
    response.status(401).end()

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id
  })

  if(!body.title || !body.url){
    response.status(400).end()
  }
  else{
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  }
  })

  //deleting blog
  blogsRouter.delete('/:id', async (request, response) => {

    const user = await request.user
    if(!user)
    response.status(401).end()

    const blog = await Blog.findById(request.params.id)

     if(blog.user.toString() === user.id.toString()){
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
     }
     else 
     response.status(401).json({ error: 'invalid user' })

  })

  //updating a blog
  blogsRouter.put('/:id', (request, response) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0
    }
  
    Blog.findByIdAndUpdate(request.params.id, blog,  { new: true })
      .then(updatedBlog => {
        response.json(updatedBlog)
      })
  })
  
  module.exports = blogsRouter