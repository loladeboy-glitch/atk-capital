import 'package:flutter/material.dart';

class SignalScreen extends StatelessWidget {
  const SignalScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ATK Signals'),
        backgroundColor: Colors.green,
      ),
      body: const Center(
        child: Text(
          'Live Trading Signals Coming Soon!',
          style: TextStyle(fontSize: 18),
        ),
      ),
    );
  }
}
