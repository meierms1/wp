# Portfolio Website - Maycon Meier

A comprehensive Flask-based portfolio website showcasing professional experience, research projects, and interactive tools for financial analysis and engineering calculations.

![Portfolio Website](https://img.shields.io/badge/Flask-3.0.3-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Overview

This portfolio website serves as a professional showcase for Dr. Maycon Meier, featuring:

- **Professional Resume & Experience**: Interactive resume with work experience, education, publications, and skills
- **Research Projects**: Detailed presentations of computational research including hydrogen-based iron reduction, rocket propellant simulations, and machine learning applications
- **Financial Tools**: Real-time stock analysis with interactive charts and company information
- **Engineering Calculators**: Material property calculators and unit conversion tools
- **Responsive Design**: Mobile-friendly interface with Bootstrap framework

## 🚀 Live Demo

Visit the live website: [Your Website URL]

## 📋 Features

### Core Functionality
- **Multi-page Navigation**: About, Resume, Projects, Finance Tools, Dashboard
- **User Authentication**: Secure login system with Flask-Login
- **Real-time Data**: Stock market data integration via Yahoo Finance API
- **Interactive Visualizations**: Dynamic charts using Plotly.js
- **Responsive Design**: Mobile and desktop optimized layouts
- **Contact Form**: Email integration for professional inquiries

### Technical Features
- **Performance Optimized**: Flask-Caching for API calls and database queries
- **Database Integration**: SQLAlchemy 2.x with PostgreSQL for production, SQLite for local development
- **Cloud Ready**: Production deployment with persistent PostgreSQL database
- **Security**: CSRF protection with Flask-WTF
- **Lazy Loading**: Optimized import loading for better performance
- **Mobile Detection**: Automatic mobile/desktop template routing

### Research Showcases
1. **Hydrogen-Based Iron Reduction**: Computer vision tracking of dendritic growth
2. **Rocket Propellant Simulation**: Phase-field modeling with adaptive mesh refinement
3. **Warfare Gas Classification**: Machine learning dimension reduction techniques

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0.3
- **Database**: SQLAlchemy 2.x with PostgreSQL (production) / SQLite (development)
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF with WTForms
- **Email**: Flask-Mail
- **Caching**: Flask-Caching

### Frontend
- **Templates**: Jinja2
- **CSS Framework**: Bootstrap
- **JavaScript**: Plotly.js for data visualization
- **Icons**: FontAwesome
- **Responsive**: Mobile-first design

### Data & APIs
- **Financial Data**: Yahoo Finance (yfinance)
- **Data Processing**: NumPy, Pandas
- **Database**: PostgreSQL with psycopg2-binary driver
- **Calculations**: Custom engineering calculators

### Development Tools
- **Server**: Werkzeug development server
- **Version Control**: Git
- **Deployment**: Production-ready with gunicorn

## 📁 Project Structure

```
wp/
├── app.py                 # Main Flask application
├── finance.py             # Stock data and financial calculations
├── calculator.py          # Engineering material property calculators
├── apitk.py              # API tokens and configuration
├── requirements.txt       # Python dependencies
├── database2.db          # SQLite database (local development)
├── wsgi.py               # Production WSGI entry point
├── README.md             # Project documentation
├── 
├── templates/            # HTML templates
│   ├── base.html         # Base template with common layout
│   ├── about.html        # About page
│   ├── resume.html       # Professional resume
│   ├── projects.html     # Research projects showcase
│   ├── finance.html      # Stock analysis tools
│   ├── dashboard.html    # User dashboard
│   ├── tools.html        # Engineering calculators
│   ├── *-mobile.html     # Mobile-optimized templates
│   └── navigation.html   # Navigation component
├── 
├── static/               # Static assets
│   ├── assets/          # CSS, JS, and vendor files
│   │   ├── css/         # Custom stylesheets
│   │   ├── js/          # JavaScript files
│   │   └── vendor/      # Third-party libraries
│   ├── *.gif            # Research project animations
│   ├── *.png            # Static images and plots
│   ├── *.webp           # Optimized images
│   └── resume.pdf       # Downloadable resume
├── 
├── instance/            # Instance-specific files
│   └── database.db      # Local development database
└── __pycache__/         # Python cache files
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio-website.git
   cd portfolio-website
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development  # For development
   ```

5. **Initialize database (Local Development)**
   ```bash
   python -c "from app import app, db; app.app_context().push(); db.create_all()"
   ```

6. **Run the application**
   ```bash
   python app.py
   # OR for development with Flask CLI:
   export FLASK_APP=app.py
   export FLASK_ENV=development
   flask run
   ```
   ```

7. **Access the website**
   Open your browser and navigate to `http://localhost:5000`

### Production Deployment

For production deployment with PostgreSQL:

1. **Database Setup**
   - Set up PostgreSQL database (recommended: Neon, Railway, or Google Cloud SQL)
   - Obtain database connection string

2. **Environment Variables**
   ```bash
   export DATABASE_URL=postgresql://username:password@host:port/database
   export SECRET_KEY=your-secure-secret-key
   export FLASK_ENV=production
   ```

3. **Deploy with WSGI server**
   ```bash
   pip install gunicorn
   gunicorn wsgi:app
   ```

4. **Cloud Deployment (Zeet.co, Heroku, Google Cloud)**
   - Set `DATABASE_URL` environment variable in your deployment platform
   - Application automatically handles PostgreSQL connection and table creation
   - No additional configuration needed - fully cloud-ready!

## 📊 Database Schema

The application uses **PostgreSQL** for production and **SQLite** for local development, with automatic switching based on the `DATABASE_URL` environment variable.

### User Model
- `id`: Primary key (Integer)
- `username`: Unique username (String, 20 chars)
- `password`: Password (String, 20 chars)
- `email`: Email address (String, 50 chars)

### Dashinfo Model (Transaction Records)
- `id`: Primary key (Integer)
- `ticker`: Stock ticker symbol (String, 10 chars)
- `price`: Stock price at time of transaction (Float)
- `date`: Transaction date (DateTime)
- `type`: Transaction type - "BUY" or "SELL" (String, 10 chars)
- `user`: Foreign key to User.id (Integer)
- `amount`: Number of shares (Integer)
- `total`: Total transaction value (Float)

### Database Features
- **Automatic Migration**: Tables created automatically on first run
- **Foreign Key Relationships**: Proper user-transaction relationships
- **Data Persistence**: All user data persists across deployments
- **Query Optimization**: Aggregated queries for performance
- **Error Handling**: Robust database error handling with rollbacks

## 🔑 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (automatically handles SQLite fallback for local development)
- `SECRET_KEY`: Flask secret key for sessions and security
- `MAIL_USERNAME`: Email username for contact form functionality
- `MAIL_PASSWORD`: Email password for SMTP authentication
- `FLASK_ENV`: Environment setting (development/production)
- `FLASK_DEBUG`: Debug mode setting (True/False)
- `PORT`: Server port (default: 5000)
- `HOST`: Server host (default: 0.0.0.0 for production)

### Database Configuration
- **Production**: PostgreSQL with full ACID compliance and concurrent user support
- **Development**: SQLite for easy local development
- **Automatic Switching**: Based on `DATABASE_URL` environment variable
- **Connection Handling**: Automatic postgres:// to postgresql:// URL conversion for SQLAlchemy 2.x compatibility

### Caching Configuration
- API calls cached for 5-10 minutes to reduce external API load
- Database queries optimized with aggregation to prevent N+1 queries
- Static assets cached for optimal performance
- Static assets cached for performance

## 🎯 Key Features Explained

### PostgreSQL Database Integration
- **Cloud-Ready**: Seamless integration with cloud PostgreSQL providers (Neon, Railway, Google Cloud SQL)
- **Data Persistence**: All user registrations and transactions persist across deployments
- **Scalability**: Supports multiple concurrent users with proper connection pooling
- **Modern SQLAlchemy**: Uses SQLAlchemy 2.x for optimal performance and security
- **Automatic Setup**: Database tables created automatically on first deployment

### Stock Analysis Tool
- Real-time stock data via Yahoo Finance API
- Interactive charts with Plotly.js
- Multiple time period selection (1D to Max)
- Company information display
- Dividend yield calculations
- Cached API calls for improved performance

### Engineering Calculators
- Material property calculations
- Unit conversions for engineering applications
- Temperature, pressure, and dimensional conversions
- Custom algorithms for mechanical properties

### Research Project Presentations
- Animated GIFs of simulation results
- Publication links and references
- Detailed technical descriptions
- Interactive visualizations

### Performance Optimizations
- Lazy loading of heavy libraries (NumPy, Pandas)
- Cached API calls to reduce external requests
- Optimized database queries
- Async CSS loading for faster page rendering

## 🔒 Security Features

- CSRF protection on all forms
- Secure password hashing
- Session management
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy ORM

## � Database Migration & Deployment Guide

### From SQLite to PostgreSQL
The application has been upgraded from SQLite to PostgreSQL for production deployments while maintaining SQLite compatibility for local development.

#### Why PostgreSQL?
- **Data Persistence**: Cloud platforms often use ephemeral storage; PostgreSQL provides permanent data storage
- **Concurrent Users**: Better support for multiple simultaneous users
- **Scalability**: Professional-grade database with advanced features
- **Backup & Recovery**: Automated backups and point-in-time recovery

#### Deployment Steps
1. **Choose a PostgreSQL Provider**:
   - **Neon** (recommended): Free tier with automatic scaling
   - **Railway**: Simple deployment with built-in PostgreSQL
   - **Google Cloud SQL**: Enterprise-grade with advanced features
   - **Heroku Postgres**: Easy integration with Heroku deployments

2. **Set Environment Variable**:
   ```bash
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ```

3. **Deploy**: The application automatically:
   - Detects PostgreSQL connection
   - Creates all necessary tables
   - Handles user registration and data persistence

#### Local Development
For local development, simply run without `DATABASE_URL` and the app uses SQLite:
```bash
python app.py  # Uses SQLite automatically
```

## �🚀 Performance Features

- **Caching Strategy**: Flask-Caching for API calls and database queries
- **Lazy Loading**: Heavy libraries loaded only when needed
- **Optimized Queries**: Database aggregation to reduce N+1 queries
- **Asset Optimization**: Compressed images and deferred script loading
- **Mobile Optimization**: Separate mobile templates for better performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 About the Developer

**Dr. Maycon Meier** - Postdoctoral Researcher specializing in computational mechanics, software development, and data science.

- 🔬 **Research Areas**: Computational solid mechanics, phase-field modeling, machine learning
- 💻 **Technical Skills**: Python, C++, Flask, Machine Learning, Finite Element Analysis
- 🎓 **Education**: PhD in Mechanical and Aerospace Engineering, University of Colorado
- 📧 **Contact**: [LinkedIn](https://linkedin.com/in/maycon-meier)

## 🙏 Acknowledgments

- University of Colorado for research support
- Department of Energy for funding hydrogen research
- Office of Naval Research for propellant simulation support
- **Neon Database** for providing excellent PostgreSQL cloud hosting
- **Flask Community** for the amazing framework and extensions
- Open-source community for excellent libraries and frameworks
- **PostgreSQL Global Development Group** for the robust database system

## 📞 Support

If you have any questions or issues, please:

1. Check the [Issues](https://github.com/yourusername/portfolio-website/issues) page
2. Create a new issue if your problem isn't addressed
3. Contact via the website's contact form
4. Email directly for urgent matters

---

**Built with ❤️ using Flask and modern web technologies**
