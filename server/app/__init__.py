# server.py (혹은 __init__.py)
from flask import Flask, send_from_directory
from flask_cors import CORS
from .database import db
from config import Config
from flask_session import Session
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ CORS 설정
    CORS(app, resources={r"/*": {"origins": ["http://52.79.158.184:3000","http://localhost:3001", "http://localhost:3000"], "supports_credentials": True}})

    # ✅ 세션 설정
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = False
    Session(app)

    # ✅ 업로드 폴더 경로 설정
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "app", "static", "uploads")
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    # 🔹 여기서 모델 임포트 (핵심)
    #    이렇게 해야 db.create_all()이 User, LostItemPost 등 인식
    from app.models import User, LostItemPost, FoundItemPost, ShareItemPost, Comment

    db.init_app(app)
    with app.app_context():
        db.create_all()  # 모델을 인식한 상태에서 테이블 생성

    # ✅ Blueprint 등록
    from app.routes.user_routes import user_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.lost_item_routes import lost_item_bp
    from app.routes.found_item_routes import found_item_bp
    from app.routes.share_item_routes import share_item_bp
    from app.routes.comment_routes import comment_bp
    from app.routes.notice_routes import notice_bp  # 새로 추가

    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(lost_item_bp)
    app.register_blueprint(found_item_bp)
    app.register_blueprint(share_item_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(notice_bp)  # 공지사항 등록

    @app.route('/static/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    return app
