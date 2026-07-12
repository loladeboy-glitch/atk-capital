import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class PortfolioScreen extends StatefulWidget {
  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  Map? balanceData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchBalance();
  }

  Future<void> fetchBalance() async {
    final response = await http.get(
      Uri.parse('https://atk-capital-production.up.railway.app/api/binance/balance'),
    );
    if (response.statusCode == 200) {
      setState(() {
        balanceData = json.decode(response.body);
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Portfolio'), backgroundColor: Colors.black),
      body: Center(
        child: isLoading
            ? CircularProgressIndicator(color: Colors.green)
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Total Balance', style: TextStyle(fontSize: 20, color: Colors.grey)),
                  Text('\$${balanceData!['total']}', style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.green)),
                  SizedBox(height: 20),
                  Text('BTC: ${balanceData!['btc']}', style: TextStyle(fontSize: 24)),
                ],
              ),
      ),
    );
  }
}
