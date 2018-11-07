const express = require('express')
const Blog = require('./models/blog')
const Review = require('./models/review')
const app = express()
const bodyparser = require('body-parser')
const pgp = require('pg-promise')()
const mustacheExpress = require('mustache-express')

const connectionString = "postgres://localhost:5432/blogdb"

const db = pgp(connectionString)

app.use(bodyparser.urlencoded({ extended : false}))

let blogs = []

app.use(express.static('css'))
app.engine('mustache',mustacheExpress())
app.set('views', './views')
app.set('view engine','mustache')

app.get('/api/blogs',function(req,res){
  res.json(blogs)
})


app.post('/blog-page',function(req,res){
  let blogid = req.body.blogid
  // console.log(blogid)

  db.any('SELECT blogs.blogid,blogauthor,blogdate,blogtitle,blogpost,blogcomment,commentid FROM blogs JOIN blogcomments on blogs.blogid = blogcomments.blogid WHERE blogs.blogid = $1',[blogid])
  .then(function(items){



    items.forEach(function(item){

    let existingBlog = blogs.find(function(blog){
      return blog.blogid = item.blogid

    })
    if(existingBlog == null){
      let blog = new Blog(item.blogid,item.blogtitle,item.blogdate,item.blogauthor,item.blogpost)
      let review = new Review(item.blogcomment)
      blog.reviews.push(review)
      blogs.push(blog)
    } else {
            let review = new Review(item.blogcomment)
            existingBlog.reviews.push(review)
    }

    })

    // console.log(blogs[0].reviews[0])
    for (let i=0;i<blogs.length;i++){
      // console.log(blogs[i].reviews[0].commentid)
      for(let j=0;j<blogs[i].reviews.length;j++){
        console.log(blogs[i].reviews[j])
      }
    }
    console.log(blogs)
    res.render('blog-page',{blogs : blogs})

  })

})

app.post('/delete-blog',function(req,res){
  let blogid = req.body.blogid

  db.none('DELETE FROM blogs WHERE blogid = $1',[blogid])
  .then(function(){
    res.redirect('/')
  })
  .catch(function(error){
    console.log(error)
  })
})

app.get('/update-blog/:blogid',function(req,res){

  let blogid = req.params.blogid

  db.one('SELECT blogtitle,blogauthor,blogdate,blogpost FROM blogs WHERE blogid = $1',[blogid])
  .then(function(result){
    console.log("result value")
    console.log(result)
    res.render('update-blog',{blog : result })
  })

})

app.post('/add-comment',function(req,res){
  let blogcomment = req.body.blogcomment
  let blogid = req.body.blogid

  console.log(blogcomment)
  console.log(blogid)

  db.none('INSERT INTO blogcomments(blogcomment,blogid)VALUES($1,$2)',[blogcomment,blogid])
  .then(function(){
    res.redirect('/blog-page')
  })
  .catch(function(error){
  console.log(error)
  })
})



app.post('/add-blog',function(req,res){
  let blogtitle = req.body.blogtitle
  let blogauthor = req.body.blogauthor
  let blogdate = req.body.blogdate
  let blogpost = req.body.blogpost

  db.none('INSERT INTO blogs(blogtitle,blogauthor,blogdate,blogpost)VALUES($1,$2,$3,$4)',[blogtitle,blogauthor,blogdate,blogpost])
  .then(function(){
    res.redirect('/')
  })
  .catch(function(error){
  console.log(error)
  })
})

app.get('/add-blog',function(req,res){
    res.render('add-blog')

})



app.get('/',function(req,res){

  db.any('SELECT blogid,blogtitle,blogpost,blogauthor,blogdate from blogs;')
  .then(function(result){
    // console.log(result)
    res.render('index',{blogs: result})

  })
})

app.listen(3000,function(req,res){
  console.log("Server is started...")
})
