package com.smartatm.service;

import com.smartatm.model.User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AtmService {

    private Map<String, User> userStore = new HashMap<>();

    public void signup(String username, String pin, double balance, double goal) {
        if (username == null || username.isEmpty()) {
            throw new RuntimeException("Username cannot be empty");
        }
        if (pin == null || !pin.matches("\\d{4}")) {
            throw new RuntimeException("PIN must be exactly 4 digits");
        }
        if (balance < 0) {
            throw new RuntimeException("Initial balance cannot be negative");
        }
        if (goal <= 0) {
            throw new RuntimeException("Savings goal must be a positive value");
        }
        if (userStore.containsKey(username)) {
            throw new RuntimeException("Username already exists");
        }

        String pinHash = hashPin(pin);
        User user = new User(username, pinHash, balance, goal);
        userStore.put(username, user);
    }

    public User login(String username, String pin) {
        User user = userStore.get(username);
        if (user == null || !user.getPinHash().equals(hashPin(pin))) {
            throw new RuntimeException("Invalid username or PIN");
        }
        return user;
    }

    public void executeTransaction(User user, String type, double amount) {
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if (!"DEPOSIT".equals(type) && !"WITHDRAWAL".equals(type)) {
            throw new RuntimeException("Transaction type must be DEPOSIT or WITHDRAWAL");
        }
        if (amount <= 0) {
            throw new RuntimeException("Transaction amount must be positive");
        }

        if ("WITHDRAWAL".equals(type)) {
            if (user.getBalance() < amount) {
                throw new RuntimeException("Insufficient balance");
            }
            user.setBalance(user.getBalance() - amount);
        } else {
            user.setBalance(user.getBalance() + amount);
        }

        User.Transaction transaction = new User.Transaction(type, amount, user.getBalance());
        user.addTransaction(transaction);
    }

    public void updateGoal(User user, double goal) {
        if (goal <= 0) {
            throw new RuntimeException("Savings goal must be a positive value");
        }
        user.setGoal(goal);
    }

    public Map<String, Object> getInsights(User user) {
        Map<String, Object> insights = new HashMap<>();

        double balance = user.getBalance();
        double goal = user.getGoal();

        if (balance >= goal) {
            insights.put("status", "ACHIEVED");
        } else {
            double needed = goal - balance;
            insights.put("needed", needed);

            double avgDeposit = calculateAverageDeposit(user);
            if (avgDeposit > 0) {
                insights.put("status", "ON_TRACK");
                long cycles = (long) Math.ceil(needed / avgDeposit);
                insights.put("cycles", cycles);
            } else {
                insights.put("status", "STALLED");
            }
        }

        insights.put("highFrequency", isHighWithdrawalFrequency(user));
        return insights;
    }

    private double calculateAverageDeposit(User user) {
        List<User.Transaction> transactions = user.getTransactions();
        double total = 0;
        int count = 0;
        for (User.Transaction t : transactions) {
            if ("DEPOSIT".equals(t.getType())) {
                total += t.getAmount();
                count++;
            }
        }
        return count > 0 ? total / count : 0;
    }

    private boolean isHighWithdrawalFrequency(User user) {
        List<User.Transaction> transactions = user.getTransactions();
        int size = transactions.size();
        if (size == 0) return false;

        int start = Math.max(0, size - 10);
        List<User.Transaction> recent = transactions.subList(start, size);

        long withdrawals = recent.stream()
                .filter(t -> "WITHDRAWAL".equals(t.getType()))
                .count();

        return withdrawals > recent.size() / 2.0;
    }

    private String hashPin(String pin) {
        return Integer.toHexString(pin.hashCode());
    }
}
