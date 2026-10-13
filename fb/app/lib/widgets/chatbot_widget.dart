import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../providers/api_service.dart';

class ChatMessage {
  final String sender; // 'user' or 'bot'
  final String text;
  final DateTime timestamp;

  ChatMessage({required this.sender, required this.text, DateTime? timestamp})
      : timestamp = timestamp ?? DateTime.now();
}

class ChatbotWidget extends StatefulWidget {
  const ChatbotWidget({super.key});

  @override
  State<ChatbotWidget> createState() => _ChatbotWidgetState();
}

class _ChatbotWidgetState extends State<ChatbotWidget> {
  bool _isOpen = false;
  final List<ChatMessage> _messages = [
    ChatMessage(
      sender: 'bot',
      text: 'Hello! I am your Physical Education & Sports Assistant. How can I help you today?',
    ),
  ];

  final TextEditingController _inputController = TextEditingController();
  bool _isTyping = false;

  final List<String> _quickOptions = [
    'Upcoming Events',
    'Equipment Booking',
    'Ground Reservation',
    'Contact Support'
  ];

  void _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsg = text.trim();
    _inputController.clear();

    setState(() {
      _messages.add(ChatMessage(sender: 'user', text: userMsg));
      _isTyping = true;
    });

    try {
      final response = await ApiService.sendChatbotMessage({'message': userMsg});
      String reply = 'Thank you for reaching out! How else can I assist you?';
      if (response != null && response is Map) {
        if (response.containsKey('message') && response['message'] != null && response['message'].toString().isNotEmpty) {
          reply = response['message'].toString();
        } else if (response.containsKey('reply') && response['reply'] != null && response['reply'].toString().isNotEmpty) {
          reply = response['reply'].toString();
        }
      } else if (response is String && response.isNotEmpty) {
        reply = response;
      }


      if (mounted) {
        setState(() {
          _messages.add(ChatMessage(sender: 'bot', text: reply));
          _isTyping = false;
        });
      }
    } catch (_) {
      // Fallback responses
      String fallback = 'Thank you for your message regarding "$userMsg". For immediate assistance, please visit the sports department desk.';
      if (userMsg.toLowerCase().contains('event') || userMsg.toLowerCase().contains('tournament')) {
        fallback = 'You can check all ongoing and upcoming tournaments in the Tournaments section on the sidebar!';
      } else if (userMsg.toLowerCase().contains('equipment') || userMsg.toLowerCase().contains('booking')) {
        fallback = 'You can request sports gear and equipment from the Equipment Bookings menu!';
      } else if (userMsg.toLowerCase().contains('ground')) {
        fallback = 'Ground and court reservations can be submitted directly under Ground Bookings!';
      }

      if (mounted) {
        setState(() {
          _messages.add(ChatMessage(sender: 'bot', text: fallback));
          _isTyping = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (_isOpen)
          Positioned(
            bottom: 84,
            right: 24,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: 360,
                height: 480,
                decoration: AppStyles.glassBoxDecoration(borderRadius: 16),
                child: Column(
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: const BoxDecoration(
                        color: AppColors.bgSecondary,
                        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                      ),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            backgroundColor: AppColors.primary,
                            radius: 16,
                            child: Text('🤖', style: TextStyle(fontSize: 16)),
                          ),
                          const SizedBox(width: 10),
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'PE Assistant',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'Online • Virtual Support',
                                style: TextStyle(
                                  color: AppColors.success,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                            onPressed: () => setState(() => _isOpen = false),
                          ),
                        ],
                      ),
                    ),

                    // Message List
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _messages.length + (_isTyping ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == _messages.length && _isTyping) {
                            return Align(
                              alignment: Alignment.centerLeft,
                              child: Container(
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.bgTertiary,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text(
                                  'Typing...',
                                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                                ),
                              ),
                            );
                          }

                          final msg = _messages[index];
                          final isUser = msg.sender == 'user';
                          return Align(
                            alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              constraints: const BoxConstraints(maxWidth: 260),
                              decoration: BoxDecoration(
                                color: isUser ? AppColors.primary : AppColors.bgTertiary,
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(12),
                                  topRight: const Radius.circular(12),
                                  bottomLeft: Radius.circular(isUser ? 12 : 2),
                                  bottomRight: Radius.circular(isUser ? 2 : 12),
                                ),
                              ),
                              child: Text(
                                msg.text,
                                style: TextStyle(
                                  color: isUser ? Colors.white : AppColors.textPrimary,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Quick Options
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      child: Row(
                        children: _quickOptions.map((opt) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: ActionChip(
                              label: Text(opt, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                              backgroundColor: AppColors.bgSecondary,
                              side: const BorderSide(color: AppColors.borderColor),
                              onPressed: () => _sendMessage(opt),
                            ),
                          );
                        }).toList(),
                      ),
                    ),

                    // Input Box
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.bgSecondary,
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _inputController,
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                              decoration: const InputDecoration(
                                hintText: 'Type your message...',
                                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(horizontal: 12),
                              ),
                              onSubmitted: _sendMessage,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send, color: AppColors.primary, size: 20),
                            onPressed: () => _sendMessage(_inputController.text),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

        // Floating Toggle Button
        Positioned(
          bottom: 24,
          right: 24,
          child: FloatingActionButton(
            backgroundColor: AppColors.primary,
            elevation: 8,
            onPressed: () => setState(() => _isOpen = !_isOpen),
            child: Icon(_isOpen ? Icons.close : Icons.chat_bubble_outline, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
