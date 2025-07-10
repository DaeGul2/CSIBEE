import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from werkzeug.utils import secure_filename
from sqlalchemy import or_
from app.models import LostItemPost, User
from app.database import db

lost_item_bp = Blueprint("lost_items", __name__)

# 이미지 업로드 설정
UPLOAD_FOLDER = os.path.join("app", "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# 분실물 게시글 등록 (이미지 포함)
@lost_item_bp.route("/", methods=["POST"])
def create_lost_item():
    data = request.form
    files = request.files.getlist("images")

    # author_id 존재 여부 확인
    author_id = data.get("author_id")
    user = User.query.get(author_id)
    if not user:
        return jsonify({"error": "유효한 사용자 ID가 아닙니다."}), 400

    image_urls = []
    if files:
        for file in files:
            if file and allowed_file(file.filename):
                # uuid를 사용해 고유한 파일명 생성
                unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
                filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(filepath)
                image_urls.append(f"/static/uploads/{unique_filename}")

    lost_item = LostItemPost(
        lost_item_post_name=data.get("lost_item_post_name"),
        author_id=author_id,
        lost_item_name=data.get("lost_item_name"),
        lost_location=data.get("lost_location"),
        lost_time=data.get("lost_time"),
        content=data.get("content"),
        image_urls=",".join(image_urls) if image_urls else None,
    )

    db.session.add(lost_item)
    db.session.commit()

    return jsonify({"message": "분실물 게시글이 등록되었습니다.", "lost_item_post_id": lost_item.lost_item_post_id}), 201

# 분실물 게시글 목록 조회 (페이지네이션 + 키워드 검색)
@lost_item_bp.route("/", methods=["GET"])
def get_lost_items():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    keyword = request.args.get('keyword', '', type=str)

    query = LostItemPost.query

    if keyword:
        # 여러 컬럼을 대상으로 OR 검색
        query = query.filter(or_(
            LostItemPost.lost_item_post_name.ilike(f"%{keyword}%"),
            LostItemPost.lost_item_name.ilike(f"%{keyword}%"),
            LostItemPost.content.ilike(f"%{keyword}%"),
            LostItemPost.lost_location.ilike(f"%{keyword}%"),
            LostItemPost.lost_time.ilike(f"%{keyword}%"),
        ))

    pagination = query.order_by(LostItemPost.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    lost_items = pagination.items

    result = {
        "lost_items": [
            {
                "lost_item_post_id": post.lost_item_post_id,
                "lost_item_post_name": post.lost_item_post_name,
                "author_id": post.author_id,
                "created_at": post.created_at,
                "lost_item_name": post.lost_item_name,
                "lost_location": post.lost_location,
                "lost_time": post.lost_time,
                "content": post.content,
                "image_urls": post.image_urls.split(",") if post.image_urls else [],
                "views": post.views,
                "status": post.status,
            }
            for post in lost_items
        ],
        "total_pages": pagination.pages,
        "current_page": pagination.page,
        "total_items": pagination.total
    }
    return jsonify(result)

# 특정 분실물 게시글 조회 (조회수 증가)
@lost_item_bp.route("/<int:lost_item_post_id>", methods=["GET"])
def get_lost_item(lost_item_post_id):
    post = LostItemPost.query.get(lost_item_post_id)
    if not post:
        return jsonify({"error": "해당 게시글을 찾을 수 없습니다."}), 404

    post.views += 1
    db.session.commit()

    return jsonify({
        "lost_item_post_id": post.lost_item_post_id,
        "lost_item_post_name": post.lost_item_post_name,
        "author_id": post.author_id,
        "created_at": post.created_at,
        "lost_item_name": post.lost_item_name,
        "lost_location": post.lost_location,
        "lost_time": post.lost_time,
        "content": post.content,
        "image_urls": post.image_urls.split(",") if post.image_urls else [],
        "views": post.views,
        "status": post.status,
    })

# 분실물 게시글 삭제
@lost_item_bp.route("/<int:lost_item_post_id>", methods=["DELETE"])
def delete_lost_item(lost_item_post_id):
    post = LostItemPost.query.get(lost_item_post_id)
    if not post:
        return jsonify({"error": "해당 게시글을 찾을 수 없습니다."}), 404

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "게시글이 삭제되었습니다."}), 200

# 분실물 게시글 수정 (상태 업데이트 등)
@lost_item_bp.route("/<int:lost_item_post_id>", methods=["PUT"])
def update_lost_item(lost_item_post_id):
    post = LostItemPost.query.get(lost_item_post_id)
    if not post:
        return jsonify({"error": "해당 게시글을 찾을 수 없습니다."}), 404

    data = request.json
    # status만 업데이트한다고 가정
    if "status" in data:
        post.status = data["status"]
    db.session.commit()

    return jsonify({"message": "게시글이 수정되었습니다."}), 200

# 업로드된 이미지 서빙
@lost_item_bp.route("/uploads/<filename>", methods=["GET"])
def serve_uploaded_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)
