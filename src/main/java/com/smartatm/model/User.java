package com.smartatm.model;

import java.util.ArrayList;
import java.util.List;

public class User {

    private String username;
    private String pinHash;
    private double balance;
    private double goal;
    private List<Transaction> transactions;

    public User(String username, String pinHash, double balance, double goal) {
        this.username = username;
        this.pinHash = pinHash;
        this.balance = balance;
        this.goal = goal;
        this.transactions = new ArrayList<>();
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public double getGoal() {
        return goal;
    }

    public void setGoal(double goal) {
        this.goal = goal;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<Transaction> transactions) {
        this.transactions = transactions;
    }

    public void addTransaction(Transaction transaction) {
        this.transactions.add(transaction);
    }

    public static class Transaction {

        private String type;
        private double amount;
        private double balance;
        private long timestamp;

        public Transaction(String type, double amount, double balance) {
            this.type = type;
            this.amount = amount;
            this.balance = balance;
            this.timestamp = System.currentTimeMillis();
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }

        public double getBalance() {
            return balance;
        }

        public void setBalance(double balance) {
            this.balance = balance;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}
