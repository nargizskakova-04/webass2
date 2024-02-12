const express = require('express');
const https = require('https');
const app = express();
const mongoose = require('mongoose');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

//scheme
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String
});


// Подключение к MongoDB

const dbUrl = "mongodb+srv://skakovasaule7:puding110@clusterweather.pw5di4w.mongodb.net/weather?retryWrites=true&w=majority";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose
    .connect(dbUrl, connectionParams)
    .then(()=>{
        console.info("Connected to the DB")
})
    .catch((e) => {
        console.log("Error: ", e);
});


const User = mongoose.model('users', userSchema);

app.get('/', function(req, res){
    res.render('index', { title: 'Weather App', weather: null });
});


app.post('/', function(req, res){
    const city = req.body.cityName;
    const apiKey = "2ffe3ae70da0dcdf0d88442954523dcd"; 
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;

    https.get(url, function(response){
        response.on("data", function(data){
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const weatherDescription = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const feelsLike = weatherData.main.feels_like;
            const humidity = weatherData.main.humidity;
            const pressure = weatherData.main.pressure;
            const windSpeed = weatherData.wind.speed;
            const countryCode = weatherData.sys.country;
            const latitude = weatherData.coord.lat;
            const longitude = weatherData.coord.lon;

            const query = `?city=${city}&temp=${temp}&desc=${weatherDescription}&icon=${icon}&feelsLike=${feelsLike}&humidity=${humidity}&pressure=${pressure}&windSpeed=${windSpeed}&countryCode=${countryCode}&lat=${latitude}&lon=${longitude}`;
            res.redirect('/weather' + query);
        });
    });
});

app.get('/weather', function(req, res){
    res.render('weather', {
        city: req.query.city,
        temp: req.query.temp,
        desc: req.query.desc,
        icon: req.query.icon,
        feelsLike: req.query.feelsLike,
        humidity: req.query.humidity,
        pressure: req.query.pressure,
        windSpeed: req.query.windSpeed,
        countryCode: req.query.countryCode,
        lat: req.query.lat,
        lon: req.query.lon
    });
});

app.get('/register', function(req, res) {
    res.render('register'); 
});

app.post('/register', function(req, res) {
    const { email, password, firstName, lastName } = req.body;
    const newUser = new User({
        email,
        password,
        firstName,
        lastName
    });

    newUser.save()
        .then(() => res.redirect('/login'))
        .catch(err => {
            console.error(err);
            res.redirect('/register');
        });
});

app.get('/login', function(req, res) {
    res.render('login'); 
});

app.post('/login', async function(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });
        if (user && user.password === password) {
            res.render('user', { user: user });
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});




app.listen(3000, function(){
    console.log('Server is running on port 3000');
});