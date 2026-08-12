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

## 🏃‍♂️ How to Run This Bad Boy

Okay, so to get this running locally on your machine, just follow these steps. (Fingers crossed it works on the first try 🤞).

1. **Clone the repo** (duh)
   ```bash
   git clone <repo-url>
   cd fundsroom
   ```

2. **Install all the dependencies**
   Since it's a monorepo, you can just run this in the root folder and it'll install everything for both the frontend and backend:
   ```bash
   npm install
   ```

3. **Build the project**
   To compile the backend (and anything else that needs building):
   ```bash
   npm run build
   ```

4. **Start the server!**
   Fire it up by running:
   ```bash
   npm start
   ```

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
