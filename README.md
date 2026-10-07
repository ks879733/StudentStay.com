# StudentStay.com
🏠 StudentStay.com

A full-stack PG, Lodge & Hostel Booking Platform designed specifically for students looking for monthly accommodation.

StudentStay.com allows students to explore approved properties, view available rooms, make bookings and complete online payments. Property owners can manage their properties and rooms, while administrators control property approval and platform operations.

🚀 Features

👨‍🎓 Student

- User registration and login
- JWT-based authentication
- Access token + refresh token authentication
- Browse approved PGs, lodges and hostels
- View property details
- View available rooms
- Monthly rent-based accommodation
- Room booking
- Online payment integration
- Booking history
- Profile management
- Responsive student dashboard

🏢 Property Owner

- Owner registration/login
- Owner dashboard
- Create and manage properties
- Upload property images
- Add and manage rooms
- Set monthly room rent
- Configure room capacity and sharing type
- Manage room amenities
- View property status
- Manage bookings
- Owner profile

🛡️ Admin

- Admin authentication
- Admin dashboard
- View pending properties
- Approve properties
- Reject properties
- Manage platform properties
- Control property approval workflow

🔐 Authentication & Security

- JWT authentication
- Access token with short expiration
- Refresh token mechanism
- Role-based authorization
- Protected routes
- Owner middleware
- Admin middleware
- Password hashing with bcrypt
- HTTP-only cookie support
- CORS configuration

💳 Payment

The project uses Razorpay for online payments.

Payment flow:

Student
   ↓
Select Room
   ↓
Create Booking
   ↓
Create Razorpay Order
   ↓
Payment
   ↓
Payment Verification
   ↓
Booking Confirmation

🖼️ Image Upload

Property and room images are uploaded using:

- Multer
- Cloudinary

Images are stored remotely instead of directly inside the application server.

🧱 Tech Stack

Frontend

- React.js
- JavaScript
- Vite
- React Router
- Axios
- Tailwind CSS

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Multer
- Cloudinary
- Razorpay

Deployment

- Frontend: Render
- Backend: Render
- Database: MongoDB Atlas
- Images: Cloudinary

📂 Main Data Models

User
 ├── Student
 ├── Owner
 └── Admin

Property
 └── Rooms

Room

Booking

🔄 Property Approval Flow

Owner creates property
        ↓
Property status = pending
        ↓
Admin reviews property
        ↓
 ┌───────────────┐
 │               │
Approve        Reject
 │               │
 ↓               ↓
Property       Property
available      rejected

📁 Project Structure

StudentStay.com/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── ...
│
└── README.md

⚙️ Installation

Clone Repository

git clone https://github.com/ks879733/StudentStay.com.git
cd StudentStay.com

Frontend

cd frontend
npm install
npm run dev

Backend

cd backend
npm install
npm run dev

🔑 Environment Variables

Backend

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

Frontend

VITE_API_URL=your_backend_url

Never commit ".env" files or secret credentials to GitHub.

📱 Responsive Design

The application is designed to work across:

- 📱 Mobile
- 📲 Tablet
- 💻 Laptop
- 🖥️ Desktop

🧠 What I Learned

Through this project I worked with:

- Full-stack application architecture
- REST APIs
- MongoDB data modeling
- JWT authentication
- Refresh token implementation
- Role-based authorization
- File uploads
- Cloudinary integration
- Payment gateway integration
- Protected routes
- React state management
- Axios interceptors
- API error handling
- Deployment
- Database hosting
- Production environment variables

🔮 Future Improvements

- Redis caching
- Redis-based session/token management
- Advanced search and filtering
- Location-based property search
- Booking concurrency protection
- Rate limiting
- API monitoring
- Automated testing
- Docker deployment
- CI/CD pipeline
- Advanced admin analytics

👨‍💻 Author

Kundan

Full-Stack Developer | React | Node.js | MongoDB

GitHub: https://github.com/ks879733

---

⭐ If you find this project useful, consider giving it a star!
