# 🚀 Fundsroom 

Hey everyone! 👋 Welcome to the official repository for **Fundsroom**. This is basically my main project right now and it's built as a monorepo (because I wanted to learn how workspaces work lol). 

I've spent way too many late nights and drank an ungodly amount of caffeine putting this together, so I really hope it works when you clone it. 😅

## 📖 What is this?
Fundsroom is a web application separated into two main parts:
- **Frontend**: The user interface where all the magic happens.
- **Backend**: The server-side stuff handling all the API requests, business logic, and databases so the frontend actually has data to show.

It's set up as an npm workspace monorepo, so you don't have to jump around directories too much to install stuff. 

## 🛠️ Tech Stack
- **Node.js**: (v24.x) because we live on the edge.
- **NPM Workspaces**: Keeps the frontend and backend living in harmony under one roof.

## 🏗️ How the Server was Set Up
So, for the backend, I basically spun up an Express server running on Node.js. It's living in the `backend/` folder and acts as the brain of the operation. I used NPM workspaces so it shares dependencies with the frontend without making the node_modules folder too stupidly massive. It handles all the API routes and serves up data when the frontend asks nicely.

## 🔐 Environment Variables (Don't leak these bro)
I'm using a `.env` file to manage all the secrets and environment-specific stuff. **IMPORTANT:** The `.env` file is in the `.gitignore` so please don't commit your database passwords! 
To get things working:
1. Copy the `.env.example` file (if I remembered to make one, otherwise just ask me for the keys).
2. Rename it to `.env`.
3. Fill in the blanks (like `PORT=3000`, `DATABASE_URL=...`).

## 🏃‍♂️ How to Run This Bad Boy (Locally)

Okay, so to get this running locally on your machine, just follow these steps. (Fingers crossed it works on the first try 🤞).

1. **Clone the repo** (duh)
   ```bash
   git clone <repo-url>
   cd fundsroom
   ```

2. **Set up the Environment Variables**
   Make sure your `.env` file is ready as mentioned above!

3. **Install all the dependencies**
   Since it's a monorepo, you can just run this in the root folder and it'll install everything for both the frontend and backend:
   ```bash
   npm install
   ```

4. **Build the project**
   To compile the backend (and anything else that needs building):
   ```bash
   npm run build
   ```

5. **Start the server!**
   Fire it up by running:
   ```bash
   npm start
   ```

## 🚀 How to Deploy This Thing
When it's time to actually put this on the internet so the professor can grade it:
1. Push your code to the `main` branch.
2. The deployment is meant to be run on something like Vercel (for the frontend) or Render/Heroku (for the backend). 
3. Make sure to manually add the environment variables in the dashboard of whatever hosting service you're using, because again, they aren't in the repo.
4. Run the same build command (`npm run build`) on the server.

## 🧠 Assumptions Made (aka My Excuses)
Just to cover my tracks, here are some assumptions I made while building this:
- **Node version:** I'm assuming you're using Node v24.x or higher because that's what I have installed and I put it in the `engines` field in `package.json`.
- **Knowledge of Git/NPM:** I'm assuming you know how to run basic terminal commands. 
- **Modern Browser:** The frontend probably looks like garbage on Internet Explorer. Please use Chrome, Firefox, or Arc.
- **The code works:** I assume it works on my machine, so it *should* work on yours. (Disclaimer: I am not liable for any mental breakdowns caused by debugging).

## 📂 Project Structure
Here's a quick look at how things are organized so you don't get lost:

```text
fundsroom/
├── backend/          # All the backend API logic (the brain 🧠)
├── frontend/         # The frontend code (the pretty face ✨)
├── docs/             # Documentation (I'll add more here before finals, promise)
├── package.json      # Monorepo config and scripts
└── README.md         # You are here! 📍
```

## 📝 To-Do List (If I ever get time)
- [ ] Actually write proper tests so I don't break things on every commit
- [ ] Add more comments to the code (sorry future me)
- [ ] Fix that one weird bug in the UI that I pretend doesn't exist

## 🤝 Contributing
If you're a classmate looking at this, feel free to open a PR! Just please don't break the main branch, I'm begging you. 🙏 

---
*Built with blood, sweat, tears, and StackOverflow.*
