class NoticeItemModel {
  final int? noticeId;
  final String? title;
  final String? content;
  final String? category;
  final String? publishDate;
  final bool? active;

  NoticeItemModel({
    this.noticeId,
    this.title,
    this.content,
    this.category,
    this.publishDate,
    this.active,
  });

  factory NoticeItemModel.fromJson(Map<String, dynamic> json) {
    return NoticeItemModel(
      noticeId: json['noticeId'] as int?,
      title: json['title'] as String?,
      content: (json['content'] ?? json['description']) as String?,
      category: json['category'] as String?,
      publishDate: (json['publishDate'] ?? json['createdAt'])?.toString(),
      active: (json['active'] ?? json['isActive']) as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (noticeId != null) 'noticeId': noticeId,
      'title': title,
      'content': content,
      'description': content,
      'category': category,
      'publishDate': publishDate,
      'active': active,
      'isActive': active ?? true,
    };
  }

}
