class GalleryItemModel {
  final int? galleryId;
  final String? eventName;
  final String? mediaType; // IMAGE / VIDEO
  final String? mediaUrl;
  final String? caption;
  final String? uploadDate;
  final bool? active;

  GalleryItemModel({
    this.galleryId,
    this.eventName,
    this.mediaType,
    this.mediaUrl,
    this.caption,
    this.uploadDate,
    this.active,
  });

  factory GalleryItemModel.fromJson(Map<String, dynamic> json) {
    return GalleryItemModel(
      galleryId: json['galleryId'] as int?,
      eventName: json['eventName'] as String?,
      mediaType: json['mediaType'] as String?,
      mediaUrl: (json['mediaUrl'] ?? json['imageUrl'] ?? json['videoUrl']) as String?,
      caption: (json['caption'] ?? json['title'] ?? json['description']) as String?,
      uploadDate: (json['uploadDate'] ?? json['eventDate'] ?? json['createdAt'])?.toString(),
      active: (json['active'] ?? json['isActive']) as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (galleryId != null) 'galleryId': galleryId,
      'eventName': eventName,
      'mediaType': mediaType,
      'mediaUrl': mediaUrl,
      'imageUrl': mediaUrl,
      'caption': caption,
      'title': caption ?? eventName ?? 'Gallery Item',
      'description': caption,
      'uploadDate': uploadDate,
      'active': active,
      'isActive': active ?? true,
    };
  }

}
