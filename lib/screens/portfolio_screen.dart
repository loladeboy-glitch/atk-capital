import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  Map? balanceData;
  bool isLoading = true;
  String error = '';

  @override
  void initState() {
    super.initState();
    fetchBalance();
  }

  Future<void> fetchBalance() async {
    final response = await http.get(
      Uri.parse('https://atk-capital-production.up.railway.app/api/portfolio'),
    );
    if (response.statusCode == 200) {
      setState(() {
        balanceData = json.decode(response.body);
        isLoading = false;
      });
    } else {
      setState(() {
        error = 'Error ${response.statusCode}';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('ATK Capital Portfolio'),
        backgroundColor: Colors.black,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.green))
          : error.isNotEmpty
              ? Center(child: Text(error, style: const TextStyle(color: Colors.red)))
              : Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Balance', style: TextStyle(color: Colors.grey)),
                      Text(
                        '\$${balanceData!['balance']?.toString() ?? '0.00'}',
                        style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.green),
                      ),
                      const SizedBox(height: 30),
                      const Text('Assets', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
    );
  }
}
