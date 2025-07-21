# Portfolio Website - Maycon Meier

A comprehensive Flask-based portfolio website showcasing professional experience, research projects, and interactive tools for financial analysis and engineering calculations.

![Portfolio Website](https://img.shields.io/badge/Flask-2.2.5-blue)
![Python](https://img.shields.io/badge/Python-3.8+-green)
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
- **Database Integration**: SQLAlchemy with SQLite for user management
- **Security**: CSRF protection with Flask-WTF
- **Lazy Loading**: Optimized import loading for better performance
- **Mobile Detection**: Automatic mobile/desktop template routing

### Research Showcases
1. **Hydrogen-Based Iron Reduction**: Computer vision tracking of dendritic growth
2. **Rocket Propellant Simulation**: Phase-field modeling with adaptive mesh refinement
3. **Warfare Gas Classification**: Machine learning dimension reduction techniques

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 2.2.5
- **Database**: SQLAlchemy with SQLite
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
├── database2.db          # SQLite database
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
│   └── database.db      # Development database
└── 
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

5. **Initialize database**
   ```bash
   python -c "from app import db; db.create_all()"
   ```

6. **Run the application**
   ```bash
   flask run
   ```

7. **Access the website**
   Open your browser and navigate to `http://localhost:5000`

### Production Deployment

For production deployment, consider:

1. **Use a production WSGI server**
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

2. **Set production environment variables**
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key
   ```

3. **Configure database for production**
   - Use PostgreSQL or MySQL instead of SQLite
   - Update `SQLALCHEMY_DATABASE_URI` in app.py

## 📊 Database Schema

### User Model
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password

### Dashinfo Model
- `id`: Primary key
- `user_id`: Foreign key to User
- `stock_name`: Stock ticker symbol
- `stock_shares`: Number of shares
- `stock_price`: Price per share

## 🔑 Configuration

### Environment Variables
- `SECRET_KEY`: Flask secret key for sessions
- `MAIL_USERNAME`: Email username for contact form
- `MAIL_PASSWORD`: Email password
- `SQLALCHEMY_DATABASE_URI`: Database connection string

### Caching Configuration
- API calls cached for 5-10 minutes
- Database queries optimized with aggregation
- Static assets cached for performance

## 🎯 Key Features Explained

### Stock Analysis Tool
- Real-time stock data via Yahoo Finance API
- Interactive charts with Plotly.js
- Multiple time period selection (1D to Max)
- Company information display
- Dividend yield calculations

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

## 🚀 Performance Features

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
- Open-source community for excellent libraries and frameworks

## 📞 Support

If you have any questions or issues, please:

1. Check the [Issues](https://github.com/yourusername/portfolio-website/issues) page
2. Create a new issue if your problem isn't addressed
3. Contact via the website's contact form
4. Email directly for urgent matters

---

**Built with ❤️ using Flask and modern web technologies**
