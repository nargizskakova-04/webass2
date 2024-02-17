Weather App README.md
Overview
This Weather App is a Node.js application using Express, MongoDB, and the OpenWeatherMap API to display real-time weather data based on user input. It features user authentication, dynamic weather updates, and admin functionalities.

Features
User Authentication: Secure login and registration system.
Dynamic Weather Data: Fetches weather data from OpenWeatherMap API based on user queries.
Admin Panel: Special functionalities for admin users, including user management.
Prerequisites
Node.js installed
MongoDB account and cluster
OpenWeatherMap API key
Installation
Clone the Repository

git clone "https://github.com/nargizskakova-04/webass2"
cd ass2
Install Dependencies

npm install
Set Environment Variables

Create a .env file in the root directory and add the following:

DB_URL=mongodb+srv://"mongodb+srv://skakovasaule7:puding110@clusterweather.pw5di4w.mongodb.net/weather?retryWrites=true&w=majority"
API_KEY="2ffe3ae70da0dcdf0d88442954523dcd"


Start the Server


node weather.js
The server will start on http://localhost:3000.

Usage
Navigate to http://localhost:3000 in your browser to access the app.
Register for an account to get started.
Once logged in, enter a city name to fetch and display its current weather data.
Admin users can access the admin panel (email: narkosya@gmail.com password: "weatherreport") for user management.
Security Practices
Password Handling: We use bcrypt for hashing and salting passwords before storing them in MongoDB to ensure security.
Environment Variables: Sensitive information such as database strings and API keys are stored in environment variables.
Input Validation: User inputs are validated to prevent SQL injection and other vulnerabilities.
HTTPS: It's recommended to use HTTPS in production to secure data in transit.
Contributing
Contributions are welcome! Please follow the standard fork-and-pull request workflow.

License
Specify your license here or state that the project is unlicensed.