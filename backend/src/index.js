const express = require('express');
const bodyParser = require('body-parser');
const { PORT } = require('./config/serverConfig');
const v1Routes = require('./routes/index');
const dbConnect = require('./config/db');
const cors = require("cors");

setUpAndStartServer = () => {

    dbConnect();
    const app = express();
    app.use(cors({
    origin: "http://localhost:3000", // React runs on 3001
    credentials: true
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use('/api',v1Routes)

    app.listen(PORT , async()=> {
        console.log("Server started on PORT ",PORT);
    })
}

setUpAndStartServer();