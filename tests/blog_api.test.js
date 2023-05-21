const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const { response } = require('../app')

const User = require('../models/user')
const bcrypt = require('bcrypt')

jest.setTimeout(100000)

var token= '';

//getting token 
beforeAll(async() => {
  await mongoose.connect('mongodb+srv://fullstack:fullstack@cluster0.r7nby42.mongodb.net/testbloglist?retryWrites=true&w=majority')
  console.log('connected')
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  const response= await api
  .post('/api/login')
  .send({username: user.username, password:'sekret'})
  
    token = 'bearer ' + response.body.token;
})

beforeEach(async () => {

    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

  
describe('when there is initially some blogs saved', () => {

  
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
},100000)


test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })


  test('all blogs are defined by id', async () => {
    const response = await api.get('/api/blogs')
    const blogId = response.body.map(b => b.id)
    expect(blogId).toBeDefined()
  })

})

describe('addition of a new blog', () => {

  test('succeeds with valid data', async () => {
    const newBlog =  {
      title:"test blog3",
      author:"author3",
      url:"www.test.com",
      likes: 20 }
  
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsAtEnd[helper.initialBlogs.length]).toMatchObject(newBlog);
  })

  test('succeeds without likes and defaults to 0', async () => {
    const newBlog = {
      title:"test blog4",
      author:"author4",
      url:"www.test.com"
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(201)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(blogsAtEnd[helper.initialBlogs.length]).toHaveProperty('likes',0)

  })

  test('fails with status code 400 when missing title or url', async () => {
    const newBlog = {
      author:"author5",
      likes:9
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)
      .expect(400)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with status code 401 Unauthorized if a token is not provided.', async () => {
    const newBlog =  {
      title:"test blog3",
      author:"author3",
      url:"www.test.com",
      likes: 20 }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

})

describe('deletion of a blog', () => {

  test('succeeds with status code 204 if id is valid', async () => {
    
    //adding blog by authorized user
    const userBlog = {
      title:"test blog",
      author:"author",
      url:"www.test.com",
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(userBlog)
      .expect(201)
    
    ////deleting blog by authorized user
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[blogsAtStart.length -1]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const blogIds = blogsAtEnd.map(b => b.id)
    expect(blogIds).not.toContain(blogToDelete.id)
  })


  test('fails with status code 401 Unauthorized if a token is not provided.', async () => {
  
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length
      )

      const blogIds = blogsAtEnd.map(b => b.id)
      expect(blogIds).toContain(blogToDelete.id)
  })

})

describe('updating a blog', () => {

  test('succeeds if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      title:"updated blog",
      author:"updated author",
      url:"www.test.com",
      likes:20
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const updatedblog = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    expect(updatedblog).toMatchObject(newBlog);
  })
})


  afterAll(async () => {
    await mongoose.connection.close()
  })