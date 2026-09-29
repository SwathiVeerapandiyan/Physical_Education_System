import 'package:flutter_test/flutter_test.dart';
import 'package:app/main.dart';

void main() {
  testWidgets('App load test', (WidgetTester tester) async {
    await tester.pumpWidget(const PePortalApp());
    expect(find.byType(PePortalApp), findsOneWidget);
  });
}
