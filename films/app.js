const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const Film = require("./src/models/film_model");
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({ msg: 'films' });
});

app.get('/api/v1/films', async(req, res) => {
    try {
        const films = await Film.find({});
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve films' });
    }
});

app.post('/api/v1/films', verifyToken, async(req, res) => {
    try {
        const { name, rating } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Film name is required' });
        }

        if (rating === undefined || rating === null || rating === '') {
            return res.status(400).json({ error: 'Rating is required' });
        }

        const ratingNum = parseInt(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const film = new Film({ 
            name: name.trim(), 
            rating: ratingNum 
        });
        
        const savedFilm = await film.save();
        res.status(201).json(savedFilm);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to create film' });
    }
});

app.post("/api/v1/login", (req, res) => {
    const user = {
        username: req.body.username
    }
    jwt.sign({user}, 'secretkey', (err, token) => {
        res.json({
            token
        })
    });
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        jwt.verify(bearerToken, 'secretkey', (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                next();
            }
        })
    } else {
        res.sendStatus(403);
    }
}
module.exports = app;