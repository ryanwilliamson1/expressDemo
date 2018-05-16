var express = require('express');
var app = express();
var path=require('path')
var router = express.Router();

//router-> step1: require userVerify.js
var userAuth=require('./user_controller/userVerify.js')



var publicPath=path.resolve(__dirname, "static"	);
app.use(express.static(publicPath))

var bodyParser = require('body-parser')
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var session=require('express-session')
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}
app.use(session(sess))


var MongoClient = require('mongodb').MongoClient;
var db,menu;
var dbURL="mongodb://pizza1:pizza1@localhost:27017/pizzadb"


MongoClient.connect(dbURL, 
					function(err, database) {
  if(err) throw err;

  db=database.db("pizzadb")
 
  // Start the application after the database connection is ready
  app.listen(8000);
  console.log("Listening on port 8000");
})

app.get('/', function(req, res){
  res.sendFile(`${publicPath}/index.html`);
})

app.get('/adminLogin',function (req,res) {
  res.sendFile(`${publicPath}/adminLogin.html`)

})
app.get('/menu',function (req, res) {
	   var query={}
      findMenuItems(res,query)
})

//demo orders.html, only valid user can access orders.html
app.get('/orders', function(req,res){
  console.log('/orders')
  if(req.session.user)
    res.sendFile(`${publicPath}/orders.html`)
  else
    res.sendFile(`${publicPath}/adminLogin.html`)
   
})


//demo destroy session when get /logout
app.get('/logout',function(req,res){
  req.session.destroy(function(){
    console.log('destroy the session')
    res.redirect('/adminLogin')
  })
  /* body...*/
})



app.get('/showOrders',function(req,res){
var query={}
      findOrderItems(res,query)
})



//router step2: use the router, userAuth
app.use('/adminLogin',userAuth)

app.get("/login",function (req,res) {
//    body... 
console.log('login with post')
})  

function findMenuItems(res,query)
{
  console.log(query)
  db.collection("menu").find(query).toArray(function (err,results) {
 
    console.log(results)
    
    res.json(results)
  })

}


function findOrderItems(res,query)
{

  db.collection("orders").find(query).toArray(function (err,results) {
 
    console.log(results)
    
    res.writeHead(200);
    res.end(JSON.stringify(results))
  })
}

//two functions to export db and publicPath
var getDb = function(){
  return db
};

var getPublicPath=function(){
  return publicPath
};
//module.exports.dbFunc =getDb;
module.exports.getDb=getDb
module.exports.getPublicPath=getPublicPath