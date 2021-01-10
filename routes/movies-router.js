const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../models/movie-model')
const Person = require('../models/person-model')
let router = express.Router();

router.get('/', getMovies)
router.get('/:movieID', getSpecificMovie)

router.post('/', createMovie)

let genres = {
  action: 1,  adventure: 1,  animation: 1,  biography: 1,  comedy: 1,  crime: 1,  documentary: 1,  drama: 1,
  family: 1,  fantasy: 1,  'film-noir': 1,  history: 1,  horror: 1,  music: 1,  musical: 1,  mystery: 1,
  news: 1,  romance: 1,  'sci-Fi': 1,  short: 1,  sport: 1,  thriller: 1,  war: 1,  western: 1
}

//need to validate data before sending to createMOvie
function createMovie(req, res){
  const movie = new Movie({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    year: req.body.year,
    rated: req.body.rated,
    released: req.body.released,
    runtime: req.body.runtime,
    genre: req.body.genre,
    directors: req.body.directors,
    writers: req.body.writers,
    actors: req.body.actors,
    plot: req.body.plot,
    language: req.body.language,
    country: req.body.country ,
    awards: req.body.awards,
    poster: req.body.poster,
    reviews: req.body.reviews,
    similar: req.body.similar 
  });
  movie.save().then(result => {
    console.log(result);
  }).catch(err => console.log(err));
}

function getMovies(req, res){
  let queryList = {}
  let sort
  queryList['$and']=[];
  if(req.query.title){
    queryList['$and'].push({title : { $regex: req.query.title , $options: "i" }})
  }
  if(req.query.genre && req.query.genre !== 'Genre'){
    queryList['$and'].push({genres : capitalize(req.query.genre) })
  }
  if(req.query.year && req.query.year !== 'Year'){
    queryList['$and'].push({year : req.query.year})
  }
  if(req.query.rating && req.query.rating !== 'Rating'){
    queryList['$and'].push( {imdbRating:{ $lt: parseInt(req.query.rating)+1 }})
    sort = {imdbRating: -1}
  }
  if(Object.keys(req.query).length <= 0 || (Object.keys(req.query).length === 1 && req.query.title === '' )){
      queryList = {}
  }

  Movie.find(queryList, {title : 1, poster : 1}).sort(sort).limit(20).exec((err, movieData) =>{
    if(err){
      console.log(err)
    }else{
      res.format({
        'text/html' : function(){
          if(movieData.length == null || movieData.length == 0){
            res.status(404).send("Could Not Find Movie")
          } else {
            res.render('home', {movieData, genres, session: req.session})
          }
        },
        'application/json' : function(){
          if(movieData.length == null || movieData.length == 0){
            res.status(404).send("Could Not Find Movie")
          }else{
            res.status(200).send(JSON.stringify(movieData));
          }
        },
      })
    }
  })
}

function getSpecificMovie(req, res){
  let movieID = req.params.movieID
  Movie.countDocuments({_id : movieID}, (err, count) => { 
    if(count  > 0){
      Movie.find({_id : movieID}, (err, doc) => {
       if(!err){
        let people = []
        let movieData = mongooseToObject(doc)
        movieData = movieData[0]

        movieData.directors.forEach(d => { people.push(d) });
        movieData.writers.forEach(d => { people.push(d) });
        movieData.actors.forEach(d => { people.push(d) });

        Person.find({_id : { $in : people }},{name : 1}).exec((err, result) => {
          if (err) throw err;
          else{
            movieData.directors = assignNameToID(movieData.directors, result)
            movieData.writers = assignNameToID(movieData.writers, result)
            movieData.actors = assignNameToID(movieData.actors, result)
            
            res.format({
              'text/html': function () {
                res.render('movie', {movie :  movieData, session : req.session})
              },
              'application/json': function() {
                res.status(200).send(JSON.stringify(movieData));
              },
            });
          }
        });
       }else{
        console.log(err)
       }
      });
    }else{
      res.status(404).send("Invalid Movie ID.")
    }
  }); 
}

function assignNameToID(movieData, peopleData){
  let objectList = []
  for(let i = 0; i < movieData.length; i++){
    for(let j = 0; j < peopleData.length; j++){
      if(((movieData[i]).localeCompare(peopleData[j]._id)) === 0){
        objectList.push(peopleData[j])
      }
    }
  }
  return objectList
}

function capitalize(word){
  return (word.toLowerCase().charAt(0).toUpperCase() + word.toLowerCase().slice(1))
}

function mongooseToObject(data){
 return data.map((doc) => { return doc.toObject(); })
}

module.exports = router;