from flask import Blueprint, request, jsonify
from app.models import FoundItemPost
from app.database import db

found_item_bp = Blueprint('found_items', __name__, url_prefix='/found_items')

@found_item_bp.route('/', methods=['GET'])
def get_found_items():
    posts = FoundItemPost.query.all()
    return jsonify([{
        'found_item_post_id': post.found_item_post_id,
        'found_item_post_name': post.found_item_post_name,
        'author_id': post.author_id,
        'found_item_name': post.found_item_name,
        'found_location': post.found_location,
        'found_time': post.found_time,
        'content': post.content,
        'image_urls': post.image_urls,
        'resolved': post.resolved,
        'status': post.status,
        'views': post.views,
    } for post in posts]), 200

@found_item_bp.route('/<int:post_id>', methods=['GET'])
def get_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    return jsonify({
        'found_item_post_id': post.found_item_post_id,
        'found_item_post_name': post.found_item_post_name,
        'author_id': post.author_id,
        'found_item_name': post.found_item_name,
        'found_location': post.found_location,
        'found_time': post.found_time,
        'content': post.content,
        'image_urls': post.image_urls,
        'resolved': post.resolved,
        'status': post.status,
        'views': post.views,
    }), 200

@found_item_bp.route('/', methods=['POST'])
def create_found_item():
    data = request.json
    post = FoundItemPost(
        found_item_post_name=data.get('found_item_post_name'),
        author_id=data.get('author_id'),
        found_item_name=data.get('found_item_name'),
        found_location=data.get('found_location'),
        found_time=data.get('found_time'),
        content=data.get('content'),
        image_urls=data.get('image_urls'),
        resolved=data.get('resolved', False),
        status=data.get('status', True)
    )
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Found item post created', 'found_item_post_id': post.found_item_post_id}), 201

@found_item_bp.route('/<int:post_id>', methods=['PUT'])
def update_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    data = request.json
    post.found_item_post_name = data.get('found_item_post_name', post.found_item_post_name)
    post.found_item_name = data.get('found_item_name', post.found_item_name)
    post.found_location = data.get('found_location', post.found_location)
    post.found_time = data.get('found_time', post.found_time)
    post.content = data.get('content', post.content)
    post.image_urls = data.get('image_urls', post.image_urls)
    post.resolved = data.get('resolved', post.resolved)
    post.status = data.get('status', post.status)
    db.session.commit()
    return jsonify({'message': 'Found item post updated'}), 200

@found_item_bp.route('/<int:post_id>', methods=['DELETE'])
def delete_found_item(post_id):
    post = FoundItemPost.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Found item post deleted'}), 200
