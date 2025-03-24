# notice_routes.py

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from app.models import NoticePost, User
from app.database import db

notice_bp = Blueprint("notices", __name__, url_prefix="/notices")

UPLOAD_FOLDER = os.path.join("app", "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# 공지사항 등록 (관리자만 가능)
@notice_bp.route("/", methods=["POST"])
def create_notice():
    data = request.form
    files = request.files.getlist("images")

    # 작성자(author_id) 유효성 체크
    author_id = data.get("author_id")
    user = User.query.get(author_id)
    if not user:
        return jsonify({"error": "유효한 사용자 ID가 아닙니다."}), 400

    # 관리자 여부 체크
    if not user.is_admin:
        return jsonify({"error": "관리자만 공지사항을 작성할 수 있습니다."}), 403

    image_urls = []
    if files:
        for file in files:
            if file and allowed_file(file.filename):
                unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                image_urls.append(f"/static/uploads/{unique_filename}")

    notice = NoticePost(
        notice_post_name=data.get("notice_post_name"),
        author_id=author_id,
        content=data.get("content"),
        image_urls=",".join(image_urls) if image_urls else None
    )
    db.session.add(notice)
    db.session.commit()

    return jsonify({"message": "공지사항이 등록되었습니다.", "notice_post_id": notice.notice_post_id}), 201

# 공지사항 목록 조회 (검색 및 페이지네이션 포함)
@notice_bp.route("/", methods=["GET"])
def get_notices():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    keyword = request.args.get('keyword', '', type=str)

    query = NoticePost.query

    if keyword:
        query = query.filter(or_(
            NoticePost.notice_post_name.ilike(f"%{keyword}%"),
            NoticePost.content.ilike(f"%{keyword}%")
        ))

    pagination = query.order_by(NoticePost.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    notices = pagination.items

    result = {
        "notices": [
            {
                "notice_post_id": post.notice_post_id,
                "notice_post_name": post.notice_post_name,
                "author_id": post.author_id,
                "created_at": post.created_at,
                "content": post.content,
                "image_urls": post.image_urls.split(",") if post.image_urls else [],
                "views": post.views,
            }
            for post in notices
        ],
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "total_items": pagination.total
    }
    return jsonify(result)

# 특정 공지사항 조회 (조회수 증가)
@notice_bp.route("/<int:post_id>", methods=["GET"])
def get_notice(post_id):
    post = NoticePost.query.get(post_id)
    if not post:
        return jsonify({"error": "공지사항을 찾을 수 없습니다."}), 404

    post.views += 1
    db.session.commit()

    return jsonify({
        "notice_post_id": post.notice_post_id,
        "notice_post_name": post.notice_post_name,
        "author_id": post.author_id,
        "created_at": post.created_at,
        "content": post.content,
        "image_urls": post.image_urls.split(",") if post.image_urls else [],
        "views": post.views,
    }), 200

# 공지사항 수정 (관리자만 가능)
@notice_bp.route("/<int:post_id>", methods=["PUT"])
def update_notice(post_id):
    post = NoticePost.query.get(post_id)
    if not post:
        return jsonify({"error": "공지사항을 찾을 수 없습니다."}), 404

    data = request.form  # 혹은 JSON
    # 작성자(admin) 여부 체크: 실제로는 session이나 인증 토큰을 활용하는 게 좋음
    author_id = data.get("author_id")
    user = User.query.get(author_id)
    if not user or not user.is_admin:
        return jsonify({"error": "관리자만 공지사항을 수정할 수 있습니다."}), 403

    post.notice_post_name = data.get("notice_post_name", post.notice_post_name)
    post.content = data.get("content", post.content)
    db.session.commit()

    return jsonify({"message": "공지사항이 수정되었습니다."}), 200

# 공지사항 삭제 (관리자만 가능)
@notice_bp.route("/<int:post_id>", methods=["DELETE"])
def delete_notice(post_id):
    post = NoticePost.query.get(post_id)
    if not post:
        return jsonify({"error": "공지사항을 찾을 수 없습니다."}), 404

    # 삭제 요청 시 작성자(admin) 여부 확인 (실제로는 session 활용)
    author_id = request.args.get("author_id")
    user = User.query.get(author_id)
    if not user or not user.is_admin:
        return jsonify({"error": "관리자만 공지사항을 삭제할 수 있습니다."}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "공지사항이 삭제되었습니다."}), 200
