# 📚 Online Bookstore

A full-stack e-commerce prototype built with Node.js, Express, and Bootstrap that lets users browse, purchase, and read PDF books in-browser. Features secure authentication, cart management, order history, and PDF streaming.

---

## ⭐ Features

- **User Authentication**  
  - Secure registration and login with JWT & HttpOnly cookies  
  - Password hashing via bcrypt  

- **Catalog & PDF Viewer**  
  - Browse book catalog  
  - Read PDFs in-browser without downloads  

- **Shopping Cart & Orders**  
  - Add/remove items  
  - View past orders and simulated payment flows  

- **Responsive Design**  
  - Mobile-first UI with Bootstrap grid and components  

---

### Installation

1. **Clone the repo**  
   git clone https://github.com/DinoFazlic/Online-Bookstore.git
   cd Online-Bookstore

2. **Install dependencies**
   npm install

3. **Create a .env file in the project root with:**
    PORT=3000
    DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
    JWT_SECRET=your_jwt_secret
