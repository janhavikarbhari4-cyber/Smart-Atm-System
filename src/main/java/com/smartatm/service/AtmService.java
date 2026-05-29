package com.smartatm.service;

import com.smartatm.model.User;
import com.smartatm.model.Transaction;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AtmService {
    private Map<String, User> userDatabase = new HashMap<>();

    public void signup(String username, String pin, double balance, double goal) throws Exception {
        if (userDatabase.containsKey(username)) {
            throw new Exception("User already exists");
        }
        if (pin.length() != 4 || !pin.matches("\\d+")) {
            throw new Exception("PIN must be 4 digits");
        }
        if (balance < 0 || goal < 0) {
            throw new Exception("Balance and goal must be non-negative");
        }
        userDatabase.put(username, new User(username, pin, balance, goal));
    }

    public User login(String username, String pin) throws Exception {
        User user = userDatabase.get(username);
        if (user == null) {
            throw new Exception("User not found");
        }
        if (!user.getPin().equals(pin)) {
            throw new Exception("Invalid PIN");
        }
        return user;
    }

    public void executeTransaction(User user, String type, double amount) throws Exception {
        if (amount <= 0) {
            throw new Exception("Amount must be positive");
        }
        if ("WITHDRAWAL".equals(type)) {
            if (user.getBalance() < amount) {
                throw new Exception("Insufficient funds");
            }
            user.setBalance(user.getBalance() - amount);
        } else if ("DEPOSIT".equals(type)) {
            user.setBalance(user.getBalance() + amount);
        } else {
            throw new Exception("Invalid transaction type");
        }
        user.addTransaction(new Transaction(type, amount, user.getBalance()));
    }

    public void updateGoal(User user, double newGoal) throws Exception {
        if (newGoal < 0) {
            throw new Exception("Goal must be non-negative");
        }
        user.setSavingsGoal(newGoal);
    }

    public Map<String, Object> getInsights(User user) {
        Map<String, Object> insights = new HashMap<>();
        insights.put("totalTransactions", user.getTransactionHistory().size());
        insights.put("currentBalance", user.getBalance());
        insights.put("savingsGoal", user.getSavingsGoal());
        insights.put("goalProgress", user.getGoalProgress());
        
        double totalDeposits = user.getTransactionHistory().stream()
            .filter(t -> "DEPOSIT".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
        
        double totalWithdrawals = user.getTransactionHistory().stream()
            .filter(t -> "WITHDRAWAL".equals(t.getType()))
            .mapToDouble(Transaction::getAmount)
            .sum();
        
        insights.put("totalDeposits", totalDeposits);
        insights.put("totalWithdrawals", totalWithdrawals);
        
        return insights;
    }
}

