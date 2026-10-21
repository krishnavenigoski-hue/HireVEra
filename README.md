# SkillMatch AI — Intelligent Resume Screening and Candidate Ranking System

> **A Complete Full-Stack Portfolio Application for Java/Backend Software Engineering Internships**  
> *Developed by a Final-Year BSc Data Science Student*

---

## 1. Project Overview

Recruiters spend considerable time manually reviewing hundreds of incoming resumes for job postings. Opening each file, identifying technical skills, comparing them with role requirements, and ranking candidates is repetitive and prone to cognitive bias.

**SkillMatch AI** automates this entire pipeline. A recruiter creates or selects a job profile, uploads mixed-format resumes in one batch (digital PDFs, Word documents, scanned photos, or captures a paper resume using a camera), and initiates automated screening with one click. The application extracts candidate details, matches competencies using a transparent equal-weight scoring formula, and groups candidates into **Best Suitable** ($\ge 75\%$), **Medium Suitable** ($50\% - 74\%$), and **Low Suitable** ($< 50\%$) with competition ranking ($1, 1, 3$).

---

## 2. Key Features

- **Multi-Format Document Ingestion:**
  - **PDF:** Digital PDFs (Apache PDFBox) and scanned documents with OCR fallback.
  - **Word:** Microsoft Word DOCX (Apache POI).
  - **Image & Scans:** JPG, JPEG, and PNG via Tesseract OCR engine.
  - **Camera Capture:** In-browser viewfinder using the MediaDevices API with live freeze preview and OCR extraction.
  - **Mixed-Batch Processing:** Upload different document formats simultaneously in a single session.
- **Automated Text & Entity Extraction:**
  - Candidate name identification with fallback to sanitized filename.
  - Contact extraction (Email, Phone number).
  - Extracted Education & Work Experience highlights.
  - Audit warnings for unreadable text or low-confidence scans.
- **Dictionary-Based Skill Extraction & Normalization:**
  - Extensible 27+ canonical skill dictionary with multi-word phrase matching (e.g., `"Spring Boot"`, `"Data Structures and Algorithms"`).
  - Case-insensitive matching, whitespace trimming, and alias mapping.
- **Deterministic Equal-Weight Matching Engine:**
  - Strict mathematical formula:
    $$\text{Match Percentage} = \left(\frac{\text{Number of Matched Unique Required Skills}}{\text{Total Unique Required Skills}}\right) \times 100$$
  - Additional candidate skills are recognized but do not artificially inflate the required score.
- **Competition Ranking System:**
  - Candidates with identical percentages share identical rank numbers (e.g., $1, 1, 3$).
- **Recruiter Analytics Dashboard:**
  - Real-time KPI counters, suitability distribution bars, recent sessions, and candidate rankings.
- **Job Profiles CRUD:**
  - Create and edit roles with custom required skill tags and configurable eligibility thresholds (default 75%).
- **Reporting & CSV Export:**
  - One-click CSV export with formula-injection sanitization and detailed match breakdown.
- **Java Spring Boot Showcase:**
  - In-app interactive explorer containing compilable Spring Boot 3.2 Java source files, JPA entities, repositories, controllers, JUnit 5 unit test suites, and MySQL DDL schema.

---

## 3. Technology Stack

### Backend
- **Java 17** & **Spring Boot 3.2.4**
- **Spring Web** for RESTful API controllers
- **Spring Data JPA & Hibernate** for ORM persistence
- **Jakarta Bean Validation** for request payload constraints
- **Apache PDFBox 3.0** for PDF text extraction
- **Apache POI 5.2** for Word DOCX processing
- **Tesseract OCR (Tess4J 5.11)** for optical character recognition
- **JUnit 5 & AssertJ** for automated unit and integration tests
- **Maven** for build lifecycle management

### Frontend
- **React 19** & **TypeScript**
- **Tailwind CSS v4** with a custom dark navy and violet theme
- **HTML5 File API & Canvas API**
- **Browser MediaDevices API** for camera document scanning
- **Lucide React** icons

### Database
- **MySQL 8.0+** with 3NF relational schema, cascading foreign keys, and indexes.

---

## 4. System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                   React 19 SPA (Client)                  │
│   (Dashboard • Batch Drag-and-Drop • Camera Scanner)     │
└────────────────────────────┬─────────────────────────────┘
                             │ REST / multipart/form-data
┌────────────────────────────▼─────────────────────────────┐
│                 Spring Boot Controller Tier               │
│   (JobController • ScreeningController • CandidateCtrl)  │
└────────────────────────────┬─────────────────────────────┘
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
┌───────────────────────────┐         ┌────────────────────────────┐
│ DocumentExtractionService │         │    SkillMatchingService    │
│  - Apache PDFBox (PDF)    │         │  - Canonical Dictionary    │
│  - Apache POI (DOCX)      │         │  - Phrase Normalization    │
│  - Tess4J OCR (Scans)     │         │  - Equal-Weight Formula    │
│  - Regex Entity Parser    │         │  - Competition Rank (1,1,3)│
└────────────┬──────────────┘         └──────────────┬─────────────┘
             │                                       │
             └───────────────────┬───────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────┐
│               Spring Data JPA & Hibernate                │
│         (JobProfile • CandidateResume • MatchResult)      │
└────────────────────────────────┬─────────────────────────┘
                                 │ HikariCP JDBC
┌────────────────────────────────▼─────────────────────────┐
│                    MySQL 8.0 Database                    │
└──────────────────────────────────────────────────────────┘
```

---

## 5. REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard KPIs and suitability counts |
| `GET` | `/api/jobs` | List all configured job profiles |
| `POST` | `/api/jobs` | Create a new job profile with required skills |
| `PUT` | `/api/jobs/{id}` | Update existing job profile and threshold |
| `DELETE` | `/api/jobs/{id}` | Delete job profile |
| `GET` | `/api/screenings` | Retrieve past screening sessions from database |
| `POST` | `/api/screenings` | Initialize a new screening session |
| `POST` | `/api/screenings/{id}/resumes` | Multipart batch upload of resumes |
| `POST` | `/api/screenings/{id}/camera-resume` | Upload base64 photo captured via webcam/phone |
| `POST` | `/api/screenings/{id}/analyse` | Trigger automated extraction, matching, and ranking |
| `GET` | `/api/screenings/{id}/candidates` | List ranked candidates for session |
| `GET` | `/api/screenings/{id}/export.csv` | Download CSV ranking report |
| `GET` | `/api/candidates/{id}/report` | Detailed evaluation report with skill breakdown |
| `GET` | `/api/candidates/{id}/resume` | Stream original resume document or extracted text |

---

## 6. Database Schema (MySQL)

```sql
-- 1. Job Profiles
CREATE TABLE job_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NULL,
    job_description TEXT NULL,
    eligibility_threshold DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Screening Sessions
CREATE TABLE screening_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_profile_id BIGINT NOT NULL,
    session_status VARCHAR(30) NOT NULL,
    total_uploaded_files INT NOT NULL DEFAULT 0,
    successfully_processed_files INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_profile_id) REFERENCES job_profiles(id) ON DELETE CASCADE
);

-- 3. Candidate Resumes
CREATE TABLE candidate_resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    screening_session_id BIGINT NOT NULL,
    candidate_name VARCHAR(120) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(50),
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    content_hash CHAR(64) NOT NULL,
    raw_text LONGTEXT,
    extraction_status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (screening_session_id) REFERENCES screening_sessions(id) ON DELETE CASCADE
);

-- 4. Match Results
CREATE TABLE match_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_resume_id BIGINT NOT NULL UNIQUE,
    job_profile_id BIGINT NOT NULL,
    matching_percentage DECIMAL(5,2) NOT NULL,
    suitability_category VARCHAR(30) NOT NULL,
    rank_position INT NOT NULL,
    is_eligible BOOLEAN NOT NULL,
    FOREIGN KEY (candidate_resume_id) REFERENCES candidate_resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_profile_id) REFERENCES job_profiles(id) ON DELETE CASCADE
);
```

---

## 7. How to Run Locally

### Prerequisites
- Node.js 18+ & npm
- JDK 17+ (for running Java Spring Boot services)
- MySQL 8.0+

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/skillmatch-ai.git
cd skillmatch-ai
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Run Full-Stack Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Run Automated Tests
```bash
npm run lint
```
For Maven / Spring Boot tests:
```bash
mvn clean test
```

---

## 8. Limitations & Future Roadmap

- **Optical Character Recognition (OCR):** Handwritten resumes or severely skewed smartphone photos may result in character substitutions; flagged for human audit.
- **Future NLP Enhancements:** Integration of semantic embeddings and context-aware relation extraction (e.g. distinguishing 5 years of Java experience from hobby projects).
- **Anti-Bias Guarantee:** Scored purely on technical skills matched against configured criteria.
