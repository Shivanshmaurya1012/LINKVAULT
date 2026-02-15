# Database Schema – LinkVault

## Overview

LinkVault uses **MongoDB** as the database and **Mongoose** for schema modeling.  
The system contains two primary collections:

- User
- Content

---

# 1. User Collection

This collection stores all registered users of the platform.

## Fields

| Field Name | Type   | Required | Unique | Description |
|------------|--------|----------|--------|-------------|
| name       | String | Yes      | No     | Full name of the user |
| email      | String | Yes      | Yes    | Email used for login |
| password   | String | Yes      | No     | Hashed password |
| createdAt  | Date   | Auto     | No     | Account creation timestamp |
| updatedAt  | Date   | Auto     | No     | Last updated timestamp |

---

## Mongoose Schema

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
