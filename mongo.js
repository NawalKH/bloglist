const mongoose = require('mongoose')
const Blog = require('./models/blog')

mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://fullstack:fullstack@cluster0.r7nby42.mongodb.net/testbloglist?retryWrites=true&w=majority')

const blogOne = new Blog({
    title:"test blog1",
    author:"Nawal",
    url:"www.test.com",
    likes: 12
})

const blogTwo = new Blog({
    title:"test blog2",
    author:"Nawal",
    url:"www.test.com",
    likes: 12
})

blogOne
.save()
.then(result => {
    console.log('blog 1 saved!')
})

blogTwo
.save()
.then(result => {
    console.log('blog 2 saved!')
    mongoose.connection.close()
})
