#!/usr/bin/env python3
"""
Fix existing users without passwords in the production database.
This script will set passwords for users that don't have them.
"""

import os
import sys
from werkzeug.security import generate_password_hash

def fix_user_passwords():
    """Fix users without passwords in the production database."""
    try:
        # Import after adding path
        backend_path = os.path.join(os.path.dirname(__file__), 'backend')
        sys.path.insert(0, backend_path)
        
        from app import app, db, User
        
        with app.app_context():
            print("🔧 Fixing user passwords in production database...")
            
            # Find all users
            users = User.query.all()
            print(f"📊 Found {len(users)} users")
            
            users_fixed = 0
            
            for user in users:
                # Check if user has no password or empty password
                if not user.password or user.password.strip() == '':
                    print(f"🔑 Fixing password for user: {user.username}")
                    
                    # Set a secure default password (you should change this)
                    default_password = os.getenv('DEFAULT_PASSWORD', 'admin123')
                    hashed_password = generate_password_hash(default_password)
                    
                    user.password = hashed_password
                    users_fixed += 1
                else:
                    print(f"✅ User {user.username} already has a password")
            
            if users_fixed > 0:
                db.session.commit()
                print(f"🎉 Fixed passwords for {users_fixed} users")
                print("⚠️  IMPORTANT: Default password is 'admin123' (or your DEFAULT_PASSWORD env var)")
                print("⚠️  Please login and change your password immediately!")
            else:
                print("✅ All users already have passwords")
            
            # Verify the fix
            print(f"\n📋 Verification:")
            for user in User.query.all():
                has_password = bool(user.password and user.password.strip())
                print(f"   - {user.username}: Password = {'✅ Yes' if has_password else '❌ No'}")
            
            print("\n🎉 Password fix completed!")
            
    except Exception as e:
        print(f"❌ Password fix error: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        import traceback
        print("   Full error details:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    fix_user_passwords()
