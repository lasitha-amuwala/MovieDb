const express = require("express");
const Person = require("../models/person-model");
const Movie = require("../models/movie-model");
let router = express.Router();

router.get("/", getPerson);
router.get("/:personID", getSpecificPerson);

function getPerson(req, res, next) {
	let query;
	if (req.query.name)
		query = { name: { $regex: req.query.name, $options: "i" } };
	else query = {};

	Person.find(query, { name: 1 })
		.limit(20)
		.exec((err, peopleData) => {
			if (err) throw err;
			else {
				//console.log(peopleData)
				res.format({
					"text/html": function () {
						if (peopleData.length == null || peopleData.length == 0) {
							res.status(404).send("Could Not Find Person");
						} else {
							res.render("searchPeople", {
								person: peopleData,
								session: req.session,
							});
						}
					},
					"application/json": function () {
						if (peopleData.length == null || peopleData.length == 0) {
							res.status(404).send("Could Not Find Person");
						} else {
							res.status(200).send(JSON.stringify(peopleData));
						}
					},
				});
			}
		});
}

function getSpecificPerson(req, res) {
	let personID = req.params.personID;

	Person.countDocuments({ _id: personID }, (err, count) => {
		if (count > 0) {
			Person.find({ _id: personID }, (err, personData) => {
				if (err) throw err;
				else {
					let person = personData[0]
					let historyList = person.history;
					let queryList = {};
					queryList["$in"] = [];

					historyList.forEach((history) => {
						queryList["$in"].push(history);
					});

					Movie.find(
						{ _id: queryList },
						{
							title: 1,
							year: 1,
							released: 1,
							directors: 1,
							writers: 1,
							actors: 1,
						}
					)
						.sort({ year: -1 })
						.exec((err, historyData) => {

							if (err) throw err;
							else {
								let history = []
								for(i in historyData){
									let roles = []
									let historyObj = {}
									let currData = historyData[i]
									
									if(currData.directors.includes(person._id)) roles.push("Director");
									if(currData.writers.includes(person._id)) roles.push("Writer");
									if(currData.actors.includes(person._id)) roles.push("Actor");
									
									historyObj.id = currData._id
									historyObj.title = currData.title
									historyObj.year = currData.year
									historyObj.released = currData.released
									historyObj.roles = roles
									history.push(historyObj)
								}
								res.format({
									"text/html": function () {
										if (personData.length == null || personData.length == 0) {
											res.status(404).send("Could Not Find Person");
										} else {
											//console.log(historyData)
											res.render("person", {
												person,
												history,
												session: req.session,
											});
										}
									},
									"application/json": function () {
										if (personData.length == null || personData.length == 0) {
											res.status(404).send("Could Not Find Person");
										} else {
											res.status(200).send(JSON.stringify(personData));
										}
									},
								});
							}
						});
				}
			});
		} else {
			res.status(404).send("MovieDb Does Not Contain a Record of " + personID);
		}
	});
}

module.exports = router;
