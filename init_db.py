#!/usr/bin/env python3
"""
Database initialization script for production deployment.
This script ensures the database tables exist and creates a default user if none exist.
"""

import os
import sys
from werkzeug.security import generate_password_hash

def init_production_db():
    """Initialize production database with tables and default user."""
    try:
        # Import after adding path
        backend_path = os.path.join(os.path.dirname(__file__), 'backend')
        sys.path.insert(0, backend_path)
        
        from app import app, db, User
        
        with app.app_context():
            print("🔧 Initializing production database...")
            
            # Check environment variables first
            print("📊 Environment variables check:")
            print(f"   DATABASE_URL: {'✅ Set' if os.getenv('DATABASE_URL') else '❌ Not set'}")
            print(f"   SECRET_KEY: {'✅ Set' if os.getenv('SECRET_KEY') else '❌ Not set'}")
            print(f"   DEFAULT_USERNAME: {os.getenv('DEFAULT_USERNAME', '❌ Not set (will use: admin)')}")
            print(f"   DEFAULT_PASSWORD: {'✅ Set' if os.getenv('DEFAULT_PASSWORD') else '❌ Not set (will use: admin123)'}")
            print(f"   DEFAULT_EMAIL: {os.getenv('DEFAULT_EMAIL', '❌ Not set (will use: admin@example.com)')}")
            print(f"   FLASK_ENV: {os.getenv('FLASK_ENV', '❌ Not set')}")
            
            # Create tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Check if any users exist
            user_count = User.query.count()
            print(f"📊 Current user count: {user_count}")
            
            if user_count == 0:
                # Create default admin user
                default_username = os.getenv('DEFAULT_USERNAME', 'admin')
                default_password = os.getenv('DEFAULT_PASSWORD', 'admin123')
                default_email = os.getenv('DEFAULT_EMAIL', 'admin@example.com')
                
                # Use plaintext password for debugging
                default_user = User(
                    username=default_username,
                    password=default_password,
                    email=default_email
                )
                
                db.session.add(default_user)
                db.session.commit()
                
                print(f"✅ Created default user: {default_username}")
                print(f"🔑 Login with username: {default_username}")
                print(f"🔑 Password (plaintext): {default_password}")
                print("⚠️  IMPORTANT: Change the default password after first login!")
            else:
                print("✅ Users already exist in database")
                
                # Check for users without passwords and fix them
                users_without_passwords = 0
                default_password = os.getenv('DEFAULT_PASSWORD', 'admin123')
                
                users = User.query.all()
                for user in users[:5]:  # Limit to first 5 users for display
                    has_password = bool(user.password and user.password.strip())
                    print(f"   - Username: {user.username}, Email: {user.email or 'N/A'}, Password: {'✅' if has_password else '❌'}")
                    
                    # Fix users without passwords (using plaintext for debugging)
                    if not has_password:
                        print(f"     🔧 Setting plaintext password for {user.username}")
                        user.password = default_password
                        users_without_passwords += 1
                
                if len(users) > 5:
                    print(f"   ... and {len(users) - 5} more users")
                
                if users_without_passwords > 0:
                    db.session.commit()
                    print(f"   🔑 Fixed passwords for {users_without_passwords} users")
                    print(f"   ⚠️  Default password (plaintext): {default_password}")
                    print("   ⚠️  IMPORTANT: Change passwords after first login!")
            
            # Verify database connection and table structure
            print(f"\n📋 Database verification:")
            database_url = app.config.get('SQLALCHEMY_DATABASE_URI', 'Not configured')
            # Hide password in logs
            if '@' in database_url and ':' in database_url:
                parts = database_url.split('@')
                if '://' in parts[0]:
                    scheme_user = parts[0].split('://')
                    if ':' in scheme_user[1]:
                        user_pass = scheme_user[1].split(':')
                        safe_url = f"{scheme_user[0]}://{user_pass[0]}:***@{parts[1]}"
                        database_url = safe_url
            print(f"   Database URI: {database_url}")
            print(f"   Total users: {User.query.count()}")
            
            print("\n🎉 Database initialization completed successfully!")
            
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        # Print more detailed error for debugging
        import traceback
        print("   Full error details:")
        traceback.print_exc()
        
        # Don't exit with error code if tables already exist
        if "already exists" not in str(e).lower():
            sys.exit(1)
        else:
            print("   Tables already exist - this is normal")

if __name__ == "__main__":
    init_production_db()
