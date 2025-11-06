🧩 Slot Swapper – Smart Event Scheduling and Swap System

Slot Swapper is a full-stack web application designed to simplify schedule management and slot swapping between users.
It allows users to create, manage, and mark their events as Busy or Swappable, explore a marketplace of available slots, and exchange them through secure swap requests — all in one clean, modern interface.

This project demonstrates real-world full stack development using React, Node.js, Express, MongoDB, and JWT authentication.

🎯 Objective

The goal of Slot Swapper is to create a collaborative platform where users can:

- Add, delete, and manage their personal events in a private dashboard.

- Mark specific slots as Swappable and list them in the marketplace.

- Browse and request swaps for other user's available slots.

- Accept or reject incoming swap requests in an organized requests section.

💡 Design Choices

- Used React (Vite + TypeScript) for modular, fast, and maintainable frontend development.

- Implemented JWT-based authentication for secure and stateless user sessions.

- Built a Node.js + Express backend with clear RESTful APIs.

- Used MongoDB + Mongoose for structured and flexible data storage.

- Maintained a minimal and professional UI inspired by productivity dashboards for clarity and ease of use.

⚙️ Tech Stack

Layer                   Technologies
Frontend	        |     React.js (Vite + TypeScript), Tailwind CSS
Backend	          |     Node.js, Express.js
Database	        |     MongoDB (Mongoose)
Authentication	  |     JWT (JSON Web Tokens)
Tools	            |     Postman, Git, GitHub

🧠 Folder Structure

📦 SlotSwapper
├── 📁 frontend                # Frontend
│   ├── 📁 src
│   │   ├── 📁 components      # Sidebar, AddEventModal, SwapModal, etc.
│   │   ├── 📁 pages           # Dashboard, Marketplace, Requests, LoginSignup
│   │   ├── App.tsx            # Main routing file
│   │   ├── main.tsx
│   │   └── styles.css
│   └── package.json
│
├── 📁 backend                 # Backend
│   ├── 📁 models              # Mongoose Schemas
│   │   └── Event.ts
|   |   └── User.ts
|   |   └── SwapRequest.ts
│   ├── 📁 routes              # Express route handlers
│   │   ├── auth.ts
│   │   ├── eventRoutes.ts
│   │   └── requestRoutes.ts
|   ├── 📁 types 
|   |   └── JWTPayload.ts
│   ├── server.ts              # Server entry file
│   └── package.json
│
└── README.md

🧩 Core Features

✅ User Authentication (JWT) – Secure login and signup.
✅ Dashboard – Create, delete, and manage your personal event slots.
✅ Swappable Slots – Toggle between Busy and Swappable states.
✅ Marketplace – View other users’ available swappable events.
✅ Swap Requests – Send and manage swap requests between users.
✅ Accept / Reject System – Respond to incoming requests with one click.
✅ Automatic Event Replacement – When a swap is accepted, both users’ dashboards update automatically.
✅ Responsive Design – Works smoothly across various screen sizes.

🛠️ Setup Instructions

Follow the steps below to run the project locally:

1️⃣ Clone the Repository
git clone https://github.com/Harshitha-965/SlotSwapper.git
cd slotswapper

2️⃣ Install Dependencies
For Backend:
cd backend
npm install

For Frontend:
cd ../frontend
npm install

3️⃣ Configure Environment Variables

Inside the server folder, create a .env file with the following contents:

PORT=5000
MONGO_URI=mongodb+srv://slotswapper_admin:slotswapper915@slotswapper.akmfgeh.mongodb.net/?appName=SlotSwapper
JWT_SECRET=mySuperSecretKey

4️⃣ Run the Application
Start Backend:
cd backend
npm run dev

Start Frontend:
cd ../frontend
npm run dev

Then open 👉 http://localhost:5173 in your browser.

🧭 API Endpoints

Method	 Endpoint	                    Description	
POST	  /api/auth/signup	         Register a new user	
POST	  /api/auth/login	           Log in user	
GET	    /api/auth/validate	       Validate user token	
POST	  /api/events	               Create a new event	
GET	    /api/events/mine	         Fetch user’s own events	
GET	    /api/events/marketplace	   View all swappable events (except your own)	
PATCH	  /api/events/:id	           Toggle event status (Busy ↔ Swappable)	
DELETE	/api/events/:id	           Delete an event	
POST	  /api/requests	             Send a swap request	
GET	    /api/requests	             Fetch all incoming and outgoing swap requests	
PATCH	  /api/requests/:id/accept	 Accept a swap request (auto-updates dashboards)	
PATCH	  /api/requests/:id/reject	 Reject a swap request	
DELETE	/api/requests/:id	         Delete a swap request	

💬 Assumptions

- A user can mark multiple events as Swappable but only swap one at a time.
- The Marketplace only shows Swappable events, excluding the user’s own.
- When a swap is accepted, the ownership of both events updates automatically, and they default back to Busy.

💬 Challenges Faced

- Implementing bidirectional event swaps without data inconsistency.
- Managing authorization checks to ensure users can only modify their own events.
- Handling JWT validation and token expiry during navigation.
- Building a clean UI flow between Dashboard, Marketplace, and Requests.
- Fixing routing and logout timing issues between frontend and backend.

🧩 Future Enhancements

🔸 Real-time updates using Socket.io for instant request notifications.
🔸 Email notifications for accepted/rejected requests.
🔸 Calendar view integration for better event visualization.
🔸 Deployment on Vercel (frontend) and Render (backend).

👨‍💻 Developed By

Harshitha K G
harshithakg09@gmail.com
www.linkedin.com/in/harshithakg09

⭐ If you found this project interesting, feel free to fork it, explore it, and share your feedback!








