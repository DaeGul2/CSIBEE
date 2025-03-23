import enum
from datetime import datetime
from sqlalchemy import Enum
from .database import db

# ✅ 변경된 User 모델 – user_id를 회원이 직접 입력한 문자열로 사용
class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)  # auto_increment 제거, 직접 입력
    user_password = db.Column(db.String(255), nullable=False)
    user_name = db.Column(db.String(50), nullable=False)   # 실제 성명
    admission_year = db.Column(db.Integer, nullable=False)
    grade = db.Column(db.Integer, nullable=False)
    class_num = db.Column(db.Integer, nullable=False)
    student_num = db.Column(db.Integer, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False, unique=True)
    is_admin = db.Column(db.Boolean, default=False)
    is_confirmed = db.Column(db.Boolean, default=False)  # 신규 필드 (관리자 승인 전 false)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ 분실물 게시판 테이블
class LostItemPost(db.Model):
    lost_item_post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    lost_item_post_name = db.Column(db.String(100), nullable=False)
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), nullable=False)  # 🔹 변경됨
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    lost_item_name = db.Column(db.String(30), nullable=False)
    lost_location = db.Column(db.String(30), nullable=False)
    lost_time = db.Column(db.String(30), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_urls = db.Column(db.Text)
    status = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ 습득물 게시판 테이블
class FoundItemPost(db.Model):
    found_item_post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    found_item_post_name = db.Column(db.String(100), nullable=False)
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), nullable=False)  # 🔹 변경됨
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    found_item_name = db.Column(db.String(30), nullable=False)
    found_location = db.Column(db.String(30), nullable=False)
    found_time = db.Column(db.String(30), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_urls = db.Column(db.Text)
    resolved = db.Column(db.Boolean, default=False)
    status = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ 나눔 게시판 테이블
class ShareItemPost(db.Model):
    share_item_post_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    share_item_post_name = db.Column(db.String(100), nullable=False)
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), nullable=False)  # 🔹 변경됨
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    image_urls = db.Column(db.Text)
    status = db.Column(db.Boolean, default=False) # 나눔 완료인지 아닌지 
    views = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ✅ 댓글 테이블
class CommentCategoryEnum(enum.Enum):  # ✅ Python의 Enum을 사용
    LOST_ITEM = "lost_item"
    FOUND_ITEM = "found_item"
    SHARE_ITEM = "share_item"

class Comment(db.Model):
    comment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category = db.Column(Enum(CommentCategoryEnum), nullable=False)
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), nullable=False)  # 🔹 변경됨
    post_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    parent_comment_id = db.Column(db.Integer, db.ForeignKey('comment.comment_id'), nullable=True)  # 🔹 변경됨
