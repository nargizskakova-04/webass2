const express = require('express');
const https = require('https');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: String,
    creationDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
    deletionDate: { type: Date, default: null },
    isAdmin: { type: Boolean, default: false }
});


userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
        const hash = await bcrypt.hash(this.password, saltRounds);
        this.password = hash;
    }
    if (!this.isNew) {
        this.updateDate = Date.now();
    }
    next();
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
    console.log(city);
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
    const { email, password, username } = req.body;
    const newUser = new User({
        email,
        password,
        username
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
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                if (user.isAdmin) {
                    res.redirect('/admin');
                } else {
                    res.render('user', { user: user });
                }
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});


app.get('/admin', async (req, res) => {
    try {
      const users = await User.find(); 
      res.render('admin', { users });
    } catch (error) {
      console.error(error);
      res.send("An error occurred while fetching users.");
    }
  });

  app.post('/admin/add-user', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
    });
  
    try {
      await newUser.save();
      res.redirect('/admin'); 
    } catch (error) {
      console.error(error);
      res.send("Failed to add new user.");
    }
  });
  app.post('/admin/delete-user/:userId', async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.userId);
      res.redirect('/admin');
    } catch (error) {
      console.error(error);
      res.send("Failed to delete user.");
    }
  });

  function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).send("Access Denied");
    }
  }
  
  app.use('/admin', isAdmin); 
  


app.listen(3000, function(){
    console.log('Server is running on port 3000');
});
