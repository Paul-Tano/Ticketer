# Ticketer

**A modern ticketing and concert management platform.**

[![Status](https://img.shields.io/badge/Status-In_development-orange.svg)]()
[![Deployment](https://img.shields.io/badge/Live_Demo-Render-success.svg)](https://ticketer-ife6.onrender.com)

**Live Demo :** [https://ticketer-ife6.onrender.com](https://ticketer-ife6.onrender.com)

## About the Project
Ticketer was designed as part of a comprehensive training project. It addresses a concrete need: to centralize and simplify concert ticket booking for fans, while offering organizers an intuitive administration panel to manage their events.

The application allows users to explore a dynamic catalog of artists, book seats in a few clicks, and instantly access their tickets.

## Key Features

**For Users:**
- **Responsive Interface:** Smooth navigation between Desktop and Mobile (interactive carousels).
- **Ticket Generation:** Automatic creation of a unique QR code for each booking.
- **Notifications (Coming Soon):** Be alerted instantly when one of your favorite artists adds a new concert date.

**For Administrators:**
- **Centralized Management:** Creation and updates of bands/artists, musical genres, and concerts.
- **Access Control:** Comprehensive management of registered users and their bookings.
- **Cloud Storage:** Secure upload and hosting of artist and concert images via Cloudinary.

## Tech Stack

- **Backend:** NestJS (Node.js)
- **Frontend:** Handlebars template engine (.hbs), Tailwind CSS
- **Database:** MongoDB with Mongoose
- **Media Storage:** Cloudinary

## Installation and Configuration

### Prerequisites
- Node.js (v18 or higher recommended)
- A MongoDB database (local or Atlas)
- A Cloudinary account for image storage

### Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ticketer.git
   cd ticketer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file at the root of the project and add the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_atlas_or_local_url
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Authentication
   SESSION_SECRET=your_session_secret
   ```

4. **Run the application (Development Mode)**
   ```bash
   npm run start:dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Disclaimer
This project was built for educational and training purposes. Feel free to explore it to discover the implementation of an MVC architecture with NestJS.
