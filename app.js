const express = require('express')
const app = express()
const bodyparser = require('body-parser')
const pgp = require('pg-promise')()
const mustacheExpress = require('mustache-express')

const connectionString = "postgres://localhost:5432/blogdb"

const db = pgp(connectionString)

app.use(bodyparser.urlencoded({ extended : false}))

app.use(express.static('css'))
app.engine('mustache',mustacheExpress())
app.set('views', './views')
app.set('view engine','mustache')


app.post('/blog-page',function(req,res){
  let blogid = req.body.blogid


  db.any('SELECT * from blogs WHERE blogid = $1',[blogid])
  .then(function(result){

    res.render('blog-page',{blogs: result})

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
