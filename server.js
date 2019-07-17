const express = require('express');
const app = express();
const server = app.listen(9000);
const io = require('socket.io')(server);
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
const flash = require('express-flash')
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cake', {
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

app.use(express.static(__dirname + '/public/dist/public'));
app.use(express.static(__dirname + "/static"));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Over 9000!",
    saveUninitialized: true,
    resave: false,
    cookie: {
        maxAge: 60000
    }
}))

//===================================================================
// Schemas
//===================================================================

var ReviewSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
}, {
    timestamps: true

})

var CakeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    comment: [ReviewSchema],
    rating: [ReviewSchema],
    reviews: [ReviewSchema]
}, {
    timestamps: true
})

mongoose.model('Cake', CakeSchema);
mongoose.model('Review', ReviewSchema);
var Cake = mongoose.model('Cake');
var Review = mongoose.model('Review');

//===================================================================
// Route 
//===================================================================

app.get('/cakes', function (req, res) {
    Cake.find({}, function (err, cakes) {
        if (err) {
            console.log("Returned error", err);
            // respond with JSON
            res.json({
                message: "Error",
                error: err
            })
        } else {
            // respond with JSON
            res.json({
                message: "Success",
                data: cakes
            })
        }
    })
})

//===================================================================
// Route to show by id
//===================================================================

app.get('/Cakes/:id', (req, res) => {
    Cake.findById(req.params.id, function (err, cakes) {
        if (err) {
            console.log("Returned error", err);
            // respond with JSON
            res.json({
                message: "Error",
                error: err
            })
        } else {
            // respond with JSON
            res.json({
                message: "Success",
                data: cakes
            })
        }
    })
})

//===================================================================
// Route to add 
//===================================================================

app.post('/cakes', (req, res) => {
    Cake.create(req.body, function (err, cakes) {
        if (err) {
            console.log("Returned error", err);
            // respond with JSON
            res.json({
                message: "Error",
                error: err
            })
        } else {
            // respond with JSON
            res.json({
                message: "Success",
                data: cakes
            })
        }
    })
})

//===================================================================
// Route to edit
//===================================================================

app.put('/cakes/:id', (req, res) => {
    Cake.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    }, (err, cakes) => {
        if (err) {
            console.log("Returned error", err);
            res.json({
                message: "Error",
                error: err
            })
        } else {
            res.json({
                message: "Success",
                data: cakes
            })
        }
    })
})

//===================================================================
// Route to find reivew
//===================================================================

app.get('/reviews', function (req, res) {
    Review.find({}, function (err, reviews) {
        if (err) {
            console.log("Returned error", err);
            // respond with JSON
            res.json({
                message: "Error",
                error: err
            })
        } else {
            // respond with JSON
            res.json({
                message: "Success",
                data: reviews
            })
        }
    })
})


//===================================================================
// Route to add review to cake
//===================================================================

app.post('/reviews/:id', (req, res) => {
    console.log('POST DATA', req.body);
    Review.create(req.body, (err, data) => {
        if (err) {
            console.log('something went wrong', err)
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message)
            }
            res.redirect('/')
        } else {
            Cake.findOneAndUpdate({
                _id: req.params.id
            }, {
                $push: {
                    review: data
                }
            },(err, data) => {
                if (err) {
                    console.log("Error adding review to cake", err.message)
                    res.redirect("/")
                } else {
                    console.log("Successfully added review to cake")
                    res.redirect("/")
                }
            })
        }
    })
})

//===================================================================
// Route to delete 
//===================================================================

app.delete('/cakes/:id', (req, res) => {
    Cake.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log("Returned error", err);
            // respond with JSON
            res.json({
                message: "Error",
                error: err
            })
        } else {
            // respond with JSON
            res.json({
                message: "Success"
            })
        }
    })
})

//===================================================================
// 404
//===================================================================

app.get('*', (req, res) => {
    res.send("404 not a valid URL")
});