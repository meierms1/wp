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
- **Responsive Design**: Mobile-friendly interface

## 📁 Project Structure

```
wp/
├── app.py                 # Delegates to backend.app for running locally
├── backend/               # Backend Flask app and modules
│   ├── __init__.py
│   ├── app.py             # Unified Flask application (APIs + pages)
│   ├── wsgi.py            # Production WSGI entry point
│   ├── calculator.py      # Engineering calculators (moved from root)
│   ├── finance.py         # Finance helpers (moved from root)
│   └── templates/         # (optional) backend-only templates
├── frontend/              # React application (CRA)
├── instance/              # Instance-specific files
│   └── database2.db       # Local development SQLite DB
├── templates/             # Jinja templates used by Flask pages
├── Procfile               # gunicorn entry
├── requirements.txt       # Python dependencies
├── README.md
└── FIRE2.json             # Quiz questions
```

Notes:
- Removed legacy shims: `api.py`, `quiz_api.py`, `wsgi.py`.
- Removed unsafe or unused files: `apitk.py`, `sp_500_stocks.csv`.
- Root `calculator.py` and `finance.py` were removed; use `backend.calculator` and `backend.finance`.

## 🔧 Setup

- Backend: `python app.py` (uses backend.app)
- Frontend: `cd frontend && npm start` (proxy to 5000)

## 🗄️ Database
- Uses SQLite at `instance/database2.db` by default; set `DATABASE_URL` for PostgreSQL.

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
