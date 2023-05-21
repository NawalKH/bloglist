const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
    {
        title:"test blog1",
        author:"author1",
        url:"www.test.com",
        likes: 12
    },
    {
        title:"test blog2",
        author:"author2",
        url:"www.test.com",
        likes: 1
    },
]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
  }

  

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

  module.exports = {
    initialBlogs, blogsInDb, usersInDb
  }