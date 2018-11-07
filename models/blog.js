class Blog {

  constructor(blogid,blogtitle,blogdate,blogauthor,blogpost) {
    this.blogid = blogid
    this.blogtitle = blogtitle
    this.blogdate = blogdate
    this.blogauthor = blogauthor
    this.blogpost = blogpost
    this.reviews = []
  }

}

module.exports = Blog
