# 🚀 Premium Digital Marketplace

Welcome! This is a complete, production-ready e-commerce platform built specifically for selling digital products like e-books, audiobooks, workbooks, and video courses.

If you are new to this project or to web development, don't worry. This guide will walk you through exactly what this project is, what tools you need, and how to get it running on your computer step-by-step.

---

## 📖 What does this app actually do?

This application has two main sides:

1. **The Storefront (For Customers):** A beautiful, fast website where users can browse products, add them to a cart, pay securely via Paystack, and instantly access their purchased downloads or video courses.
2. **The Admin Dashboard (For You):** A powerful control panel where you can create new products, manage courses, track sales, handle customer orders, and update the website's homepage content without touching any code.

---

## 🛠️ What you need to install first (Prerequisites)

Before we can run the app, you need to install a few foundational tools on your computer. Think of these as the "engine" that makes the app work.

1. **Node.js (Version 18 or higher):** This is the environment that runs our JavaScript code.
   👉 [Download Node.js here](https://nodejs.org/) (Choose the "LTS" version).
2. **PostgreSQL (Version 12 or higher):** This is our database. It's where all the data (users, products, orders) is permanently saved.
   👉 [Download PostgreSQL here](https://www.postgresql.org/download/).
   _(Note: During installation on Windows/Mac, it will ask you to set a password for the "postgres" superuser. **Write this password down! You will need it later.**)_
3. **A Code Editor:** We recommend [Visual Studio Code (VS Code)](https://code.visualstudio.com/).
4. **Git:** Used to download the project code. [Download Git here](https://git-scm.com/).

---

## 🗺️ Understanding the Tech Stack

You don't need to be an expert in these, but here is a simple translation of the technologies we are using:

- **Next.js 16:** The main framework. It handles both the frontend (what users see) and the backend (the server and database logic).
- **TypeScript:** JavaScript with "rules". It helps catch errors before the code even runs.
- **Tailwind CSS & Shadcn UI:** The styling tools. They make the website look beautiful and professional without writing custom CSS from scratch.
- **Prisma ORM:** A tool that lets us talk to our PostgreSQL database using TypeScript code instead of writing raw SQL queries.
- **Paystack:** The payment gateway that securely processes credit card and bank payments.
- **Zustand & React Query:** Tools that manage data and keep the user interface fast and in-sync.

---

## 🏁 Step-by-Step Setup Guide

Follow these steps exactly in order. Open your computer's **Terminal** (or Command Prompt / PowerShell) to type these commands.

### Step 1: Get the project code

First, download the code to your computer and navigate into the folder:

```bash
git clone <your-repository-url>
cd premium-digital-marketplace
```

### Step 2: Install the project dependencies

Run this command:

```bash
npm install
```

- **What this does:** It reads the `package.json` file and downloads all the external code libraries (like Next.js, React, Prisma) into a folder called `node_modules`. This might take a minute or two.

### Step 3: Create your Database and User

_This is the step where most beginners get stuck. Take your time here._

We need to create a specific database and a specific user for this app inside PostgreSQL.

1. Open your PostgreSQL terminal. On Mac/Linux, type:

   ```bash
   sudo -u postgres psql
   ```

   _(On Windows, search for "SQL Shell" or "psql" in your Start Menu and open it, just pressing Enter through the default prompts)._

2. Once you are inside the PostgreSQL prompt (it will look like `postgres=#`), type these commands exactly, pressing Enter after each:

   ```sql
   -- 1. Create a user for the app (Change 'my_secure_password' to whatever you want)
   CREATE USER marketplace_user WITH PASSWORD 'my_secure_password';

   -- 2. Give this user permission to create databases (Required by Prisma)
   ALTER USER marketplace_user CREATEDB;

   -- 3. Create the actual database and assign our user as the owner
   CREATE DATABASE marketplace_db OWNER marketplace_user;

   -- 4. Exit the PostgreSQL prompt
   \q
   ```

### Step 4: Connect the app to your database (The `.env` file)

The app needs to know how to connect to the database and access secret keys (like Paystack). We do this using a `.env` file.

1. In your project folder, create a new file named exactly `.env` (don't forget the dot at the beginning).
2. Open it in your code editor and paste the following template:

```env
# --- DATABASE CONNECTION ---
# Format: postgresql://[username]:[password]@localhost:5432/[database_name]?schema=public
# IMPORTANT: Replace these with the exact user/password/db you created in Step 3!
DATABASE_URL="postgresql://marketplace_user:my_secure_password@localhost:5432/marketplace_db?schema=public"

# --- APP SETTINGS ---
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_CURRENCY="NGN"
# Create a random 32-character string for security (e.g., abcdefghijklmnopqrstuvwxyz123456)
JWT_SECRET="replace-with-a-random-32-character-secret"

# --- PAYSTACK (Get these from your Paystack Dashboard) ---
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxx"
PAYSTACK_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxx"

# --- EMAIL (For sending receipts/verifications) ---
# For local testing, you can leave these blank or use a tool like Mailtrap
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="Premium Marketplace <no-reply@example.com>"

# --- FILE STORAGE ---
# Where should we save uploaded images/files? "filesystem" saves them to your computer.
STORAGE_DRIVER="filesystem"
```

- **Crucial:** Ensure the `DATABASE_URL` exactly matches the username, password, and database name you created in Step 3.

### Step 5: Prepare the Database (Prisma)

Now we tell Prisma to build the tables inside your PostgreSQL database. Run these commands one by one:

```bash
# 1. Generate the Prisma Client (Creates TypeScript types for your database)
npm run prisma:generate

# 2. Create the tables in your database (Migrations)
npm run prisma:migrate
```

- **Note:** When you run `prisma:migrate`, it will ask you to name the migration. Just type `initial` and press **Enter**.

```bash
# 3. Fill the database with fake data (Seed)
npm run prisma:seed
```

- **What this does:** If you log in right now, the app will be empty. The `seed` command creates a fake Admin user, a fake Customer, some fake products, and sample courses so you can actually see the app working!

### Step 6: Start the App!

You are finally ready to run the app. Type:

```bash
npm run dev
```

Open your web browser and go to: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 How to log in (Seeded Credentials)

Because we ran the `seed` command in Step 5, you don't need to register a new account to test the app. Use these pre-made accounts:

### 👑 The Admin Account (Full Access)

Use this to manage products, view orders, and change website content.

- **Email:** `admin@digitalmarketplace.dev`
- **Password:** `ChangeMe!12345`
- _(Access the admin panel at: `http://localhost:3000/admin`)_

### 👤 The Customer Account

Use this to test buying a product, viewing the course player, and downloading files.

- **Email:** `ada@example.com`
- **Password:** `CustomerPass!123`
- _(Access the dashboard at: `http://localhost:3000/dashboard`)_

---

## 🐛 Troubleshooting Common Errors

If you get stuck, here are the solutions to the most common errors beginners face:

### ❌ Error: `P1000: Authentication failed`

**What it means:** The username or password in your `DATABASE_URL` (inside the `.env` file) does not match the user you created in PostgreSQL.
**How to fix:** Double-check your `.env` file. Did you spell the username right? Is the password correct? If your password has special characters like `@` or `#`, you must URL-encode them (e.g., change `@` to `%40`).

### ❌ Error: `P3014: Permission denied to create database`

**What it means:** Prisma needs to create a temporary "shadow database" to check for errors, but your PostgreSQL user doesn't have permission to do so.
**How to fix:** Open your PostgreSQL terminal (`sudo -u postgres psql`) and run:

```sql
ALTER USER marketplace_user CREATEDB;
```

_(Replace `marketplace_user` with whatever username you put in your `.env` file)._

### ❌ Error: `P3015: Could not find the migration file`

**What it means:** A previous migration attempt failed or was cancelled, leaving an empty, broken folder.
**How to fix:** Look at the error message to find the folder name (e.g., `prisma/migrations/20260705_init`). Delete that specific folder manually, then run `npm run prisma:migrate` again.

---

## 🧪 Testing the Code

If you want to ensure the core logic (like password hashing and payment webhooks) is working correctly, you can run the automated tests:

```bash
npm run test
```

This uses **Vitest** to run tests. You can view the visual coverage report by opening the `coverage/index.html` file in your web browser after the tests finish.

---

## 🐳 Alternative: Running with Docker

If you don't want to install PostgreSQL and Node.js directly on your computer, and you have **Docker Desktop** installed, you can run the entire app in isolated containers.

1. Copy the environment file: `cp .env.example .env` (and fill in the values).
2. Start the containers:
   ```bash
   docker compose up --build
   ```

This will automatically set up the database and the app. The app will still be available at `http://localhost:3000`.

---

## 📂 Quick Tour of the Project Structure

If you are looking at the code, here is where everything lives:

- **`prisma/`**: Contains `schema.prisma` (the blueprint of our database tables) and `seed.ts` (the fake data generator).
- **`src/app/`**: The Next.js App Router. Every folder here becomes a URL route (e.g., `src/app/cart/page.tsx` becomes `yoursite.com/cart`). It also contains the `api/` folder for backend logic.
- **`src/components/`**: Reusable UI pieces. `ui/` has basic buttons/inputs, `shop/` has product cards, `admin/` has the dashboard layout.
- **`src/lib/`**: The "brains" of the app. Contains database connections (`db.ts`), authentication logic (`auth/`), payment processing (`payments/`), and file storage (`storage/`).
- **`src/store/`**: Contains `cart-store.ts`, which uses Zustand to remember what items the user has in their cart as they browse the site.

---

## 🚀 Next Steps & Deployment

When you are ready to put this on the internet for the world to see:

1. **Database:** Host your PostgreSQL database on a service like Supabase, Neon, or AWS RDS, and update your `DATABASE_URL`.
2. **Hosting:** Deploy the Next.js app to Vercel, Railway, or a VPS.
3. **Payments:** Switch your Paystack keys from `test` mode to `live` mode.
4. **Webhooks:** Update your Paystack dashboard with your live production webhook URL so payments are verified correctly.

Happy coding! 🎉
