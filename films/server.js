const app = require("./app");
const { DB_URI } = require("./src/config");
const mongoose = require("mongoose");
mongoose.connect(DB_URI);

app.listen(3000, () => {
    console.log("Running on port 3000");
    console.log("------------------------")
}); 