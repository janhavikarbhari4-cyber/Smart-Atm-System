package com.smartatm.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class User {
    private String username;
    private String pin;
    private double balance;
    private double savingsGoal;
    private LocalDateTime createdAt;
    private List<Transaction> transactionHistory;

    public User(String username, String pin, double balance, double savingsGoal) {
        this.username = username;
        this.pin = pin;
        this.balance = balance;
        this.savingsGoal = savingsGoal;
        this.createdAt = LocalDateTime.now();
        this.transactionHistory = new ArrayList<>();
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public double getSavingsGoal() {
        return savingsGoal;
    }

    public void setSavingsGoal(double savingsGoal) {
        this.savingsGoal = savingsGoal;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<Transaction> getTransactionHistory() {
        return transactionHistory;
    }

    public void addTransaction(Transaction transaction) {
        this.transactionHistory.add(transaction);
    }

    public double getGoalProgress() {
        return (balance / savingsGoal) * 100;
    }
}

