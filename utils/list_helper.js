const _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const maxNum = Math.max(...blogs.map(b => b.likes))
    const blog = blogs.find(b => b.likes === maxNum)

    return blogs.length === 0
        ? {}
        : {
            title: blog.title,
            author: blog.author,
            likes: blog.likes
        }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0)
        return {}

    const authors = _.countBy(blogs, 'author')
    const max = _.max(_.values(authors))

    for (key in authors) {
        if (authors[key] === max) {
            return {
                author: key,
                blogs: max
            }
        }
    }
}


const mostLikes = (blogs) => {
    if (blogs.length === 0)
        return {}

    const authors = _.groupBy(blogs, 'author')

    for (key in authors)
        authors[key] = _.sumBy(authors[key], 'likes')

    const max = _.max(_.values(authors))

    for (key in authors) {
        if (authors[key] === max) {
            return {
                author: key,
                likes: max
            }
        }
    }
}


module.exports = {
    dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}