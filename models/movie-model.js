const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
	Source: {
		type: String,
	},
	Value: {
		type: String,
	},
});

const movieSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	imdbID: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	year: {
		type: String,
		required: true,
	},
	rated: {
		type: String,
	},
	released: {
		type: String,
	},
	runtime: {
		type: String,
		required: true,
	},
	genres: [String],
	directors: [String],
	writers: [String],
	actors: [String],
	plot: {
		type: String,
		required: true,
	},
	language: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	awards: {
		type: String,
	},
	poster: {
		type: String,
	},
	imdbRating: {
		type: Number,
	},
	ratings: [{ Source: String, Value: String }],
	reviews: [{ Name: String }],
	similar: [{ Name: String }],
});

module.exports = mongoose.model("movies", movieSchema);
