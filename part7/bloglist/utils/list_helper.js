const dummy = (blogs) => {
  return 1
}

const totalLikes = blogs => blogs.reduce((prev, cur) => prev + cur.likes, 0)

const favoriteBlog = blogs =>  blogs.find(blog => blog.likes === Math.max(...blogs.map(b => b.likes)))

const mostBlogs = blogs => blogs.reduce((prev, cur, i, traversed) => {
    const prevCount = traversed.filter(t => t.author === prev.author).length
    const curCount = traversed.filter(t => t.author === cur.author).length

    return prevCount >= curCount ? { author: prev.author, blogs: prevCount } : { author: cur.author, blogs: curCount }
    },
  {}
)

const mostLikes = blogs => blogs.reduce((prev, cur, i, traversed) => {
  const prevCount = traversed.filter(t => t.author === prev.author).reduce((p, c) => p + c.likes, 0)
  const curCount = traversed.filter(t => t.author === cur.author).reduce((p, c) => p + c.likes, 0)

  return prevCount >= curCount ? { author: prev.author, likes: prevCount } : { author: cur.author, likes: curCount }
  },
{}
)

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog, 
  mostBlogs, 
  mostLikes
}
