class FeedbackItemModel {
  final int? feedbackId;
  final int? userId;
  final String? subject;
  final String? message;
  final int? rating;
  final String? status; // OPEN, RESOLVED

  FeedbackItemModel({
    this.feedbackId,
    this.userId,
    this.subject,
    this.message,
    this.rating,
    this.status,
  });

  factory FeedbackItemModel.fromJson(Map<String, dynamic> json) {
    return FeedbackItemModel(
      feedbackId: json['feedbackId'] as int?,
      userId: json['userId'] as int?,
      subject: json['subject'] as String?,
      message: json['message'] as String?,
      rating: json['rating'] as int?,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (feedbackId != null) 'feedbackId': feedbackId,
      'userId': userId,
      'subject': subject,
      'message': message,
      'rating': rating,
      'status': status,
    };
  }
}
