# Assignment 1: Web Service / API using Node.js & MongoDB

This project is a full-stack web application featuring a JSON-based web service that stores and retrieves user data using **Node.js**, **Express**, **MongoDB**, and an **HTML/jQuery** frontend.

---

## 📌 Features

* **Data Validation**: Enforces strict Mongoose schema validation:
  * **Mobile Number**: Exactly 10 digits
  * **Email ID**: Valid email format
  * **Login ID**: 8-character alphanumeric string
  * **Password**: Minimum 6 characters (1 uppercase, 1 lowercase, 1 special character)
* **Automatic Timestamps**: Generates `creationTime` and `lastUpdatedOn` automatically.
* **REST APIs**:
  * `POST /api/users`: Validates and saves new user data to MongoDB.
  * `GET /api/users`: Reads and fetches all stored user records.
* **Interactive Frontend**: Built with HTML and jQuery AJAX to handle form submissions and render table data asynchronously.

---

## 🛠️ Project Structure

```text
assignment-app/
│
├── models/
│   └── User.js          # Mongoose schema and validation definitions
├── public/
│   ├── index.html       # HTML form to enter user details
│   └── users.html       # HTML page to view stored users table
├── server.js            # Express application setup and API endpoints
├── package.json         # Dependencies and project metadata
└── README.md            # Project documentation🚀 How to Run the Project
1. Prerequisites
Make sure you have the following installed on your machine:

Node.js (v14 or higher)

MongoDB installed locally OR a MongoDB Atlas cloud database string.

2. Step-by-Step Local Setup
Open Terminal / PowerShell inside the project directory (assignment-app).

Install Dependencies:
Run the following command to install required npm packages (express, mongoose, cors):

Bash
npm install
Start MongoDB:

If running locally, ensure your MongoDB service is running on mongodb://127.0.0.1:27017/.

(Optional) If using MongoDB Atlas, set your connection string in server.js or as an environment variable.

Start the Express Server:

Bash
node server.js
You should see a message in terminal: Connected to MongoDB successfully and Server running on http://localhost:3000.