# reset_db.py (예시)

from app import create_app
from app.database import db

def reset_database():
    app = create_app()
    with app.app_context():
        # 모든 테이블 삭제
        db.drop_all()
        # 다시 테이블 생성
        db.create_all()

if __name__ == "__main__":
    reset_database()
