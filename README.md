<div align="center">

# 🎓 Massar — Exam Management System

**A full-stack academic examination platform built for universities and higher institutes.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/i18n-Arabic%20%2F%20English-F59E0B)](https://www.i18next.com/)

> **Graduation Project** · Fourth Year · Information Systems · Delta Higher Institute for Computers, Egypt

| | |
|---|---|
| **Official Title** | Exam and Results Management System |
| **Project No.** | 115 |
| **Academic Year** | 2025 – 2026 |
| **Supervisor** | Dr. Ibrahim El-Hasanuni |
| **Assistant Supervisor** | Eng. Mohamed El-Salamoni |
| **Team Leader** | Kareem Amgad Abdel-Hady Mohamed Zarie — ID: 2202862 |

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Arabic README — النسخة العربية](#-نظام-مسار--نظام-إدارة-الاختبارات)

---

## Overview

**Massar** is a comprehensive, production-grade academic examination management system designed to digitise the full examination lifecycle — from exam creation and student registration to real-time result tracking and analytics.

The platform supports three distinct user roles (Admin, Teacher, Student), is fully bilingual (Arabic / English with automatic RTL/LTR switching), and integrates AI-powered question generation backed by multi-provider failover (Google Gemini → GPT-4o → Claude).

---

## Features

### 🎓 Student
- Personal dashboard with upcoming exams and activity feed
- Take exams with a real-time countdown timer, question bookmarking, and per-question navigation
- Supports **MCQ, True/False, Essay, and Code** question types
- View detailed results with per-question review and tutor feedback
- Enroll in courses and access course materials
- Personal exam schedule / calendar
- Profile management with academic info and security settings (2FA / TOTP)

### 👨‍🏫 Teacher
- Dashboard with course and student overview
- Full **Exam Creator** — configure timing, question order, and passing score
- **AI Question Generator** with multi-provider failover (Gemini · GPT-4o · Claude)
- Reusable **Question Bank** per course
- Upload and manage course materials
- View and grade student submissions
- Send notifications to enrolled students

### 🛡️ Admin
- System-wide dashboard with live statistics and growth charts
- Manage students and teachers — create, edit, suspend, or remove accounts
- Approve courses and course materials before publication
- Full **Audit Log** — every action recorded with timestamp and actor
- System settings and maintenance mode control
- Export exam results and submissions to **Excel (.xlsx)**
- Send broadcast notifications to all users or specific groups

### ⚙️ System-wide
- Role-Based Access Control enforced at both API and database level (Supabase RLS)
- Real-time notifications via WebSocket (Supabase Realtime)
- Full bilingual UI — Arabic (RTL) and English (LTR) with automatic browser detection
- Responsive design — desktop, tablet, and mobile
- Multi-factor authentication (TOTP / 2FA) via Supabase Auth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **Styling** | Tailwind CSS 3 (CSS logical properties for RTL/LTR) |
| **Routing** | React Router DOM 6 |
| **Server State** | TanStack React Query 5 |
| **Forms & Validation** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Toast Notifications** | react-hot-toast |
| **Internationalisation** | i18next + react-i18next (AR / EN) |
| **Backend / Database** | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| **AI Integration** | Google Gemini 1.5 Pro · GPT-4o · Claude 3.5 Sonnet |
| **Excel Export** | SheetJS (xlsx) |
| **Deployment** | PM2 + Nginx + Let's Encrypt |

---

## User Roles

```
Admin
 ├── Manages all users (students & teachers)
 ├── Approves course content before publication
 ├── Views audit logs & configures system settings
 └── Exports reports to Excel

Teacher
 ├── Creates and manages exams & courses
 ├── Uploads course materials
 ├── Grades student submissions
 └── Generates questions with AI assistance

Student
 ├── Takes exams with a live countdown timer
 ├── Reviews results and tutor feedback
 ├── Enrolls in courses and accesses materials
 └── Manages personal profile and security settings
```

---

## Getting Started

### Prerequisites
- Node.js 20 or later
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# Clone the repository
git clone https://github.com/kareemxamged/exam-management-system.git
cd exam-management-system

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env
```

### Environment Variables

Open `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
exam-management-system/
├── src/
│   ├── features/          # Feature-scoped components, hooks, and API calls
│   │   ├── admin/
│   │   ├── exam-creator/
│   │   ├── notifications/
│   │   ├── question-bank/
│   │   └── ...
│   ├── pages/             # Route-level page components
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── student/
│   ├── services/          # Shared Supabase service layer
│   ├── hooks/             # Shared custom hooks
│   ├── types/             # Global TypeScript types
│   └── i18n/              # Translation files (ar / en)
├── supabase/
│   └── migrations/        # PostgreSQL migration files
├── ecosystem.config.cjs   # PM2 process configuration
├── keep-alive.js          # Supabase keep-alive service (pings DB every 12 h)
└── massar.kareemamgad.com.nginx.conf  # Nginx reverse-proxy configuration
```

---

## Deployment

The project ships with a ready-made PM2 ecosystem file and Nginx configuration for production deployment on a VPS.

```bash
# Build the project
npm run build

# Start the app and the keep-alive service
pm2 start ecosystem.config.cjs

# Persist processes across server reboots
pm2 startup && pm2 save
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete step-by-step guide including Nginx setup and SSL with Let's Encrypt.

---
---

<div align="center">

# 🎓 نظام مسار | نظام إدارة الاختبارات

**منصة أكاديمية متكاملة لإدارة الاختبارات في الجامعات والمعاهد العليا**

> **مشروع تخرج** · الفرقة الرابعة · تخصص نظم المعلومات · معهد الدلتا العالي للحاسبات — مصر

| | |
|---|---|
| **عنوان المشروع الرسمي** | نظام إدارة الامتحانات والنتائج |
| **رقم المشروع** | 115 |
| **العام الدراسي** | 2025 – 2026 |
| **المشرف** | د / إبراهيم الحسنوني |
| **المشرف المساعد** | م.م / محمد السلاموني |
| **قائد الفريق** | كريم أمجد عبد الهادي محمد زريع — رقم الطالب: 2202862 |

</div>

---

## نظرة عامة

**مسار** هو نظام إدارة اختبارات أكاديمي متكامل، صُمِّم لرقمنة دورة الاختبار بالكامل — بدءاً من إنشاء الامتحان وتسجيل الطلاب، وصولاً إلى تتبع النتائج في الوقت الفعلي وعرض التحليلات الإحصائية.

تدعم المنصة ثلاثة أدوار (مدير، معلم، طالب)، وهي ثنائية اللغة بالكامل (عربي / إنجليزي مع تبديل تلقائي بين RTL وLTR)، وتدمج توليد الأسئلة بالذكاء الاصطناعي عبر مزودين متعددين (Google Gemini · GPT-4o · Claude).

---

## المميزات

### 🎓 الطالب
- لوحة تحكم شخصية تعرض الاختبارات القادمة وآخر النشاطات
- أداء الاختبارات مع عداد زمني لحظي، وضع إشارة مرجعية على الأسئلة، والتنقل بينها بحرية
- دعم أنواع الأسئلة: **اختيار متعدد، صح وخطأ، مقالي، وكود برمجي**
- مراجعة تفصيلية للنتائج مع تعليقات المعلم على كل إجابة
- التسجيل في المقررات والوصول إلى المواد التعليمية
- جدول امتحانات شخصي
- إدارة الملف الشخصي مع إعدادات الأمان والمصادقة الثنائية (2FA)

### 👨‍🏫 المعلم
- لوحة تحكم تعرض نظرة عامة على المقررات والطلاب
- **منشئ الاختبارات** — ضبط الوقت وترتيب الأسئلة ودرجة النجاح
- **مولّد أسئلة بالذكاء الاصطناعي** مع دعم احتياطي متعدد المزودين
- **بنك أسئلة** قابل لإعادة الاستخدام لكل مقرر
- رفع وإدارة المواد التعليمية
- مراجعة وتصحيح إجابات الطلاب
- إرسال إشعارات للطلاب المسجلين

### 🛡️ المدير
- لوحة تحكم شاملة مع إحصائيات حية ورسوم بيانية للنمو
- إدارة الطلاب والمعلمين — إنشاء الحسابات وتعديلها وتعليقها وحذفها
- الموافقة على المقررات والمواد التعليمية قبل نشرها
- **سجل تدقيق** كامل — كل إجراء مسجَّل بالتوقيت والمنفِّذ
- إعدادات النظام ووضع الصيانة
- تصدير نتائج الاختبارات إلى **Excel**
- إرسال إشعارات جماعية لجميع المستخدمين أو مجموعات محددة

### ⚙️ مميزات عامة
- التحكم في الصلاحيات على مستوى API وقاعدة البيانات (Supabase RLS)
- إشعارات لحظية عبر WebSocket (Supabase Realtime)
- واجهة ثنائية اللغة كاملة مع اكتشاف تلقائي للغة المتصفح
- تصميم متجاوب — سطح المكتب، الجهاز اللوحي، والجوال
- مصادقة ثنائية العوامل (TOTP / 2FA)

---

## المكدس التقني

| الطبقة | التقنية |
|--------|---------|
| **الواجهة الأمامية** | React 18، TypeScript 5، Vite 5 |
| **التنسيق** | Tailwind CSS 3 (خصائص منطقية لدعم RTL/LTR) |
| **التوجيه** | React Router DOM 6 |
| **إدارة حالة الخادم** | TanStack React Query 5 |
| **النماذج والتحقق** | React Hook Form + Zod |
| **الرسوم البيانية** | Recharts |
| **الترجمة** | i18next + react-i18next (عربي / إنجليزي) |
| **الخلفية / قاعدة البيانات** | Supabase (PostgreSQL، Auth، Realtime، Storage) |
| **الذكاء الاصطناعي** | Google Gemini 1.5 Pro · GPT-4o · Claude 3.5 Sonnet |
| **تصدير Excel** | SheetJS (xlsx) |
| **النشر** | PM2 + Nginx + Let's Encrypt |

---

## أدوار المستخدمين

| الدور | الصلاحيات الرئيسية |
|-------|-------------------|
| **المدير** | إدارة المستخدمين، الموافقة على المحتوى، سجلات التدقيق، إعدادات النظام، التصدير |
| **المعلم** | إنشاء الاختبارات والمقررات، توليد الأسئلة بالذكاء الاصطناعي، تصحيح الإجابات |
| **الطالب** | أداء الاختبارات، متابعة النتائج، التسجيل في المقررات، إدارة الملف الشخصي |

---

## تشغيل المشروع

```bash
# استنساخ المستودع
git clone https://github.com/kareemxamged/exam-management-system.git
cd exam-management-system

# تثبيت الاعتمادات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
# أدخل بيانات Supabase في ملف .env

# تشغيل بيئة التطوير
npm run dev

# بناء الإنتاج
npm run build
```

---

## النشر على السيرفر

```bash
# بناء المشروع
npm run build

# تشغيل التطبيق وخدمة الـ keep-alive عبر PM2
pm2 start ecosystem.config.cjs

# تشغيل تلقائي عند إعادة تشغيل السيرفر
pm2 startup && pm2 save
```

للاطلاع على دليل النشر الكامل بما يشمل إعداد Nginx وSSL عبر Let's Encrypt، راجع ملف [DEPLOYMENT.md](DEPLOYMENT.md).

---

<div align="center">

صُنع بـ ❤️ · معهد الدلتا العالي للحاسبات · مصر · 2026

</div>
