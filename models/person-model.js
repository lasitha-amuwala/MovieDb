const mongoose = require("mongoose");

const peopleSchema = new mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		name: {
			type: String,
			required: true,
		},
		history: [mongoose.Schema.Types.ObjectId],
	},
	{
		collection: "people",
	}
);

module.exports = mongoose.model("people", peopleSchema);
