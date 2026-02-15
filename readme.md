# LinkVault – Secure Temporary Content Sharing Platform

Hey! This is a simple web app I built to help people share text or files that don't need to live forever. You upload something, get a link, and it disappears after a while.

---

##  Setup Instructions

Setting this up on your own machine is pretty straightforward:

1.  **Clone the repo**
    Open your terminal and run:
    `git clone https://github.com/yourusername/linkvault.git`

2.  **Install Backend dependencies**
    Go into the backend folder and grab the packages:
    `cd backend && npm install`

3.  **Install Frontend dependencies**
    Do the same for the frontend:
    `cd ../frontend && npm install`

4.  **Setup your Environment Variables**
    Create a file named `.env` in the **backend** folder and add these lines:
    * `MONGO_URI=your_mongodb_connection_string`
    * `JWT_SECRET=some_random_secret_key`

5.  **Fire it up!**
    * Start the server: `node src/server.js` (inside backend)
    * Start the interface: `npm run dev` (inside frontend)

---

##  API Overview

### Authentication
* **POST `/api/auth/register`** – Create a new account so you can track your links.
* **POST `/api/auth/login`** – Get a token to stay logged in.

### Content
* **POST `/api/content/text`** – Send a string of text to the database.
* **POST `/api/content/file`** – Upload a file to the server.
* **GET `/api/content/:id`** – View the content (this is what the share link hits).
* **GET `/api/content/my`** – See a list of everything you’ve personally shared.
* **DELETE `/api/content/:id`** – Kill a link manually if you don't want to wait for the timer.

---

##  Design Decisions

* **MongoDB:** I went with Mongo because it handles "unstructured" data really well. Since some posts are just text and others are files, a flexible schema makes life easier.
* **uniqueId over _id:** I used a custom short ID for the URLs. Using the standard MongoDB ObjectIDs in a URL looks messy and is a bit of a security giveaway.
* **TTL Index:** This is the "magic" for the expiry. I set a Time-To-Live index in the database so MongoDB automatically cleans up expired documents without me having to write a separate script.
* **Uploads Folder:** I'm storing files in a local folder for now. It's faster for development than setting up a cloud bucket, though it means the files live on the server disk.
* **JWT Auth:** I used JSON Web Tokens because they are easy to pass in the headers and don't require the server to "remember" every session in memory.
* **React Router:** This handles all the page switching on the front end so the app feels like a smooth, single-page experience.

---

##  Assumptions and Limitations

* **Local Storage:** Since I'm using a local `uploads` folder, if the server restarts or wipes its temp files, the uploads are gone.
* **No Email Verification:** Right now, you can sign up with any email. I haven't added a "click this link to verify" step yet.
* **Password Resets:** If you forget your password, there's no "Forgot Password" flow yet. You'd just have to make a new account.
* **File Size:** I've put a basic cap on file sizes so the server doesn't crash if someone tries to upload a 2GB movie.

---

##  Bonus Features Added

* **One-Time Links:** You can set a link to delete itself the second someone opens it.
* **Max View Limit:** Set a cap (like 5 views) and the link dies after that.
* **Custom Expiry:** Choose exactly how long you want the link to last (1 hour, 1 day, etc.).
* **Password Protection:** Lock your shared content with a password so only people with the code can see it.
* **Dark Mode:** Because no one likes being blinded by a white screen at 2 AM.
* **User History:** A nice dashboard where you can see all your active links and how many views they’ve got.


