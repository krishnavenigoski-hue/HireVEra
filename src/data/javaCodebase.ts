export interface JavaSourceFile {
  path: string;
  name: string;
  package: string;
  description: string;
  category: 'Configuration' | 'Entity' | 'Repository' | 'Service' | 'Controller' | 'Exception' | 'Test' | 'SQL';
  code: string;
}

export const JAVA_PROJECT_STRUCTURE: JavaSourceFile[] = [
  {
    path: 'pom.xml',
    name: 'pom.xml',
    package: 'Maven Configuration',
    category: 'Configuration',
    description: 'Maven build descriptor with Spring Boot 3.2, Apache PDFBox, Apache POI, Tess4J OCR, MySQL & JUnit 5.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/>
    </parent>
    <groupId>com.skillmatch</groupId>
    <artifactId>skillmatch-ai</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>SkillMatch AI</name>
    <description>Intelligent Resume Screening and Candidate Ranking System</description>

    <properties>
        <java.version>17</java.version>
        <pdfbox.version>3.0.2</pdfbox.version>
        <poi.version>5.2.5</poi.version>
        <tess4j.version>5.11.0</tess4j.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Database Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Document Processing: Apache PDFBox for PDF parsing -->
        <dependency>
            <groupId>org.apache.pdfbox</groupId>
            <artifactId>pdfbox</artifactId>
            <version>\${pdfbox.version}</version>
        </dependency>

        <!-- Document Processing: Apache POI for DOCX and DOC parsing -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>\${poi.version}</version>
        </dependency>

        <!-- OCR Engine: Tess4J wrapper for Tesseract OCR -->
        <dependency>
            <groupId>net.sourceforge.tess4j</groupId>
            <artifactId>tess4j</artifactId>
            <version>\${tess4j.version}</version>
        </dependency>

        <!-- Automated Testing: JUnit 5 & Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`,
  },
  {
    path: 'src/main/java/com/skillmatch/SkillMatchAiApplication.java',
    name: 'SkillMatchAiApplication.java',
    package: 'com.skillmatch',
    category: 'Configuration',
    description: 'Spring Boot main entry point with async processing and transactional support.',
    code: `package com.skillmatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * SkillMatch AI: Intelligent Resume Screening and Candidate Ranking System
 * Entry point for the Spring Boot application.
 */
@SpringBootApplication
@EnableAsync
@EnableTransactionManagement
public class SkillMatchAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillMatchAiApplication.class, args);
    }
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/entity/JobProfile.java',
    name: 'JobProfile.java',
    package: 'com.skillmatch.entity',
    category: 'Entity',
    description: 'JPA entity representing job specifications, required skills list, and eligibility threshold.',
    code: `package com.skillmatch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "job_profiles", indexes = {
    @Index(name = "idx_job_created_at", columnList = "created_at")
})
public class JobProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String title;

    @Size(max = 150)
    @Column(name = "company_name", length = 150)
    private String companyName;

    @Lob
    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_required_skills", joinColumns = @JoinColumn(name = "job_profile_id"))
    @Column(name = "skill_name", nullable = false)
    @NotEmpty(message = "At least one required skill must be defined")
    private List<String> requiredSkills = new ArrayList<>();

    @Min(1)
    @Max(100)
    @Column(name = "eligibility_threshold", nullable = false)
    private Double eligibilityThreshold = 75.0;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "jobProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScreeningSession> screeningSessions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters...
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/entity/CandidateResume.java',
    name: 'CandidateResume.java',
    package: 'com.skillmatch.entity',
    category: 'Entity',
    description: 'JPA entity storing parsed resume metadata, SHA-256 hash, extracted skills, and audit flags.',
    code: `package com.skillmatch.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_resumes", indexes = {
    @Index(name = "idx_resume_hash", columnList = "content_hash"),
    @Index(name = "idx_resume_session", columnList = "screening_session_id")
})
public class CandidateResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screening_session_id", nullable = false)
    private ScreeningSession screeningSession;

    @Column(name = "candidate_name", length = 120, nullable = false)
    private String candidateName;

    @Column(length = 120)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "file_type", length = 20, nullable = false)
    private String fileType; // PDF, DOCX, IMAGE, CAMERA

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "content_hash", length = 64, nullable = false)
    private String contentHash;

    @Lob
    @Column(name = "raw_text", columnDefinition = "LONGTEXT")
    private String rawText;

    @Enumerated(EnumType.STRING)
    @Column(name = "extraction_status", length = 30, nullable = false)
    private ExtractionStatus extractionStatus = ExtractionStatus.SUCCESS;

    @ElementCollection
    @CollectionTable(name = "resume_warnings", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "warning_message")
    private List<String> extractionWarnings = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "candidate_skills", joinColumns = @JoinColumn(name = "resume_id"))
    @Column(name = "skill_name")
    private List<String> identifiedSkills = new ArrayList<>();

    @OneToOne(mappedBy = "candidateResume", cascade = CascadeType.ALL, orphanRemoval = true)
    private MatchResult matchResult;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ExtractionStatus {
        SUCCESS, NEEDS_REVIEW, FAILED
    }

    // Getters and Setters...
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/entity/MatchResult.java',
    name: 'MatchResult.java',
    package: 'com.skillmatch.entity',
    category: 'Entity',
    description: 'JPA entity holding equal-weight calculation, rank, suitability category, and skill breakdown.',
    code: `package com.skillmatch.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "match_results")
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_resume_id", nullable = false, unique = true)
    private CandidateResume candidateResume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_profile_id", nullable = false)
    private JobProfile jobProfile;

    @ElementCollection
    @CollectionTable(name = "match_matched_skills", joinColumns = @JoinColumn(name = "match_result_id"))
    @Column(name = "skill_name")
    private List<String> matchedSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "match_missing_skills", joinColumns = @JoinColumn(name = "match_result_id"))
    @Column(name = "skill_name")
    private List<String> missingSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "match_extra_skills", joinColumns = @JoinColumn(name = "match_result_id"))
    @Column(name = "skill_name")
    private List<String> extraSkills = new ArrayList<>();

    @Column(name = "matching_percentage", nullable = false)
    private Double matchingPercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "suitability_category", length = 30, nullable = false)
    private SuitabilityCategory suitabilityCategory;

    @Column(name = "recommendation_explanation", columnDefinition = "TEXT")
    private String recommendationExplanation;

    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;

    @Column(name = "is_eligible", nullable = false)
    private Boolean isEligible;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SuitabilityCategory {
        BEST_SUITABLE, MEDIUM_SUITABLE, LOW_SUITABLE
    }

    // Getters and Setters...
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/matching/SkillMatchingService.java',
    name: 'SkillMatchingService.java',
    package: 'com.skillmatch.matching',
    category: 'Service',
    description: 'Implements equal-weight scoring formula, phrase normalization, alias lookup, and competition ranking.',
    code: `package com.skillmatch.matching;

import com.skillmatch.entity.CandidateResume;
import com.skillmatch.entity.JobProfile;
import com.skillmatch.entity.MatchResult;
import com.skillmatch.entity.MatchResult.SuitabilityCategory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SkillMatchingService {

    // Extensible canonical dictionary with alias mappings
    private final Map<String, List<String>> skillAliasMap = new HashMap<>();

    public SkillMatchingService() {
        skillAliasMap.put("Java", List.of("java", "core java", "java 8", "java 11", "java 17", "java 21", "j2se"));
        skillAliasMap.put("Spring Boot", List.of("spring boot", "springboot"));
        skillAliasMap.put("Spring Framework", List.of("spring framework", "spring mvc", "spring data", "spring core"));
        skillAliasMap.put("SQL", List.of("sql", "structured query language", "ansi sql"));
        skillAliasMap.put("MySQL", List.of("mysql"));
        skillAliasMap.put("PostgreSQL", List.of("postgresql", "postgres"));
        skillAliasMap.put("HTML", List.of("html", "html5"));
        skillAliasMap.put("CSS", List.of("css", "css3", "tailwind", "bootstrap"));
        skillAliasMap.put("JavaScript", List.of("javascript", "js", "es6"));
        skillAliasMap.put("TypeScript", List.of("typescript", "ts"));
        skillAliasMap.put("React", List.of("react", "react.js", "reactjs"));
        skillAliasMap.put("Git", List.of("git", "github", "gitlab"));
        skillAliasMap.put("REST APIs", List.of("rest apis", "rest api", "restful api", "restful apis"));
        skillAliasMap.put("Hibernate", List.of("hibernate", "jpa", "hibernate jpa"));
        skillAliasMap.put("Data Structures and Algorithms", List.of("data structures and algorithms", "dsa", "data structures"));
        skillAliasMap.put("Python", List.of("python", "python 3", "python3"));
        skillAliasMap.put("Docker", List.of("docker", "containerization"));
        skillAliasMap.put("JUnit", List.of("junit", "junit 5", "unit testing"));
    }

    /**
     * Canonicalizes skill name to prevent casing or minor wording discrepancies
     */
    public String normalizeSkill(String rawSkill) {
        if (rawSkill == null || rawSkill.trim().isEmpty()) return "";
        String trimmed = rawSkill.trim().toLowerCase();

        for (Map.Entry<String, List<String>> entry : skillAliasMap.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(trimmed) || entry.getValue().contains(trimmed)) {
                return entry.getKey();
            }
        }
        return rawSkill.trim();
    }

    /**
     * Evaluates candidate skills against job requirements using equal-weight formula.
     * Formula: (matched unique required skills / total unique required skills) * 100
     */
    public MatchResult evaluateCandidate(CandidateResume resume, JobProfile job) {
        List<String> requiredNormalized = job.getRequiredSkills().stream()
                .map(this::normalizeSkill)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (requiredNormalized.isEmpty()) {
            throw new IllegalArgumentException("Job profile must have at least one required skill.");
        }

        Set<String> candidateSkillSet = resume.getIdentifiedSkills().stream()
                .map(this::normalizeSkill)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String req : requiredNormalized) {
            if (candidateSkillSet.contains(req)) {
                matchedSkills.add(req);
            } else {
                missingSkills.add(req);
            }
        }

        List<String> extraSkills = candidateSkillSet.stream()
                .filter(s -> !requiredNormalized.contains(s))
                .sorted()
                .collect(Collectors.toList());

        double matchPct = ((double) matchedSkills.size() / requiredNormalized.size()) * 100.0;
        double roundedPct = Math.round(matchPct * 10.0) / 10.0;

        double threshold = job.getEligibilityThreshold() != null ? job.getEligibilityThreshold() : 75.0;
        boolean isEligible = roundedPct >= threshold;

        SuitabilityCategory category;
        String explanation;

        if (roundedPct >= threshold) {
            category = SuitabilityCategory.BEST_SUITABLE;
            explanation = String.format("Eligible for the next review stage. Matches %d of %d required skills (%.1f%%), meeting or exceeding threshold (%.1f%%).",
                    matchedSkills.size(), requiredNormalized.size(), roundedPct, threshold);
        } else if (roundedPct >= 50.0) {
            category = SuitabilityCategory.MEDIUM_SUITABLE;
            explanation = String.format("Partial skill match. Matches %d of %d required skills (%.1f%%). Missing: %s.",
                    matchedSkills.size(), requiredNormalized.size(), roundedPct, String.join(", ", missingSkills));
        } else {
            category = SuitabilityCategory.LOW_SUITABLE;
            explanation = String.format("Low current skill match. Matches %d of %d required skills (%.1f%%). Foundational skills missing: %s.",
                    matchedSkills.size(), requiredNormalized.size(), roundedPct, String.join(", ", missingSkills));
        }

        MatchResult result = new MatchResult();
        result.setCandidateResume(resume);
        result.setJobProfile(job);
        result.setMatchedSkills(matchedSkills);
        result.setMissingSkills(missingSkills);
        result.setExtraSkills(extraSkills);
        result.setMatchingPercentage(roundedPct);
        result.setSuitabilityCategory(category);
        result.setRecommendationExplanation(explanation);
        result.setIsEligible(isEligible);
        result.setRankPosition(1);

        return result;
    }

    /**
     * Ranks candidates using competition ranking (e.g. 1, 1, 3).
     */
    public List<CandidateResume> applyCompetitionRanking(List<CandidateResume> candidates) {
        List<CandidateResume> sorted = new ArrayList<>(candidates);
        sorted.sort((a, b) -> {
            Double scoreA = a.getMatchResult() != null ? a.getMatchResult().getMatchingPercentage() : -1.0;
            Double scoreB = b.getMatchResult() != null ? b.getMatchResult().getMatchingPercentage() : -1.0;
            return scoreB.compareTo(scoreA);
        });

        int currentRank = 1;
        for (int i = 0; i < sorted.size(); i++) {
            if (i > 0) {
                Double prevScore = sorted.get(i - 1).getMatchResult().getMatchingPercentage();
                Double currScore = sorted.get(i).getMatchResult().getMatchingPercentage();
                if (currScore.equals(prevScore)) {
                    sorted.get(i).getMatchResult().setRankPosition(sorted.get(i - 1).getMatchResult().getRankPosition());
                } else {
                    currentRank = i + 1;
                    sorted.get(i).getMatchResult().setRankPosition(currentRank);
                }
            } else {
                sorted.get(i).getMatchResult().setRankPosition(1);
            }
        }
        return sorted;
    }
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/extraction/DocumentExtractionService.java',
    name: 'DocumentExtractionService.java',
    package: 'com.skillmatch.extraction',
    category: 'Service',
    description: 'Handles Apache PDFBox for digital/scanned PDFs, Apache POI for Word DOCX, and Tess4J OCR fallback.',
    code: `package com.skillmatch.extraction;

import com.skillmatch.entity.CandidateResume;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DocumentExtractionService {

    private final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}");
    private final Pattern PHONE_PATTERN = Pattern.compile("(?:\\\\+?\\\\d{1,3}[-.\\\\s]?)?\\\\(?\\\\d{3}\\\\)?[-.\\\\s]?\\\\d{3}[-.\\\\s]?\\\\d{4}");

    public CandidateResume parseResume(MultipartFile file, Long sessionId) throws Exception {
        byte[] bytes = file.getBytes();
        String hash = computeSha256(bytes);
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        String rawText = "";
        CandidateResume.ExtractionStatus status = CandidateResume.ExtractionStatus.SUCCESS;
        CandidateResume resume = new CandidateResume();
        resume.setOriginalFilename(filename);
        resume.setContentHash(hash);
        resume.setFileSizeBytes(file.getSize());

        if (filename.toLowerCase().endsWith(".pdf")) {
            resume.setFileType("PDF");
            try (PDDocument document = Loader.loadPDF(bytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                rawText = stripper.getText(document);
                if (rawText.trim().length() < 50) {
                    resume.getExtractionWarnings().add("PDF text layer was empty or scanned. Applying OCR fallback.");
                    rawText = extractViaOCR(bytes);
                }
            }
        } else if (filename.toLowerCase().endsWith(".docx")) {
            resume.setFileType("DOCX");
            try (InputStream is = file.getInputStream();
                 XWPFDocument doc = new XWPFDocument(is)) {
                StringBuilder sb = new StringBuilder();
                for (XWPFParagraph p : doc.getParagraphs()) {
                    sb.append(p.getText()).append("\\n");
                }
                rawText = sb.toString();
            }
        } else {
            resume.setFileType("IMAGE");
            rawText = extractViaOCR(bytes);
            resume.getExtractionWarnings().add("Image resume processed through OCR. Review recommended.");
        }

        resume.setRawText(rawText);
        resume.setCandidateName(extractCandidateName(rawText, filename));
        resume.setEmail(extractRegex(rawText, EMAIL_PATTERN));
        resume.setPhone(extractRegex(rawText, PHONE_PATTERN));

        return resume;
    }

    private String extractViaOCR(byte[] imageBytes) {
        try {
            ITesseract tesseract = new Tesseract();
            return tesseract.doOCR(new java.io.ByteArrayInputStream(imageBytes));
        } catch (Exception e) {
            return "OCR processing failed: " + e.getMessage();
        }
    }

    private String computeSha256(byte[] data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data);
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    private String extractCandidateName(String text, String filename) {
        String[] lines = text.split("\\\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() > 3 && trimmed.length() < 40 && trimmed.matches("^[A-Z][a-zA-Z\\\\s.'-]+$")) {
                return trimmed;
            }
        }
        return filename.replaceFirst("[.][^.]+$", "").replace("_", " ");
    }

    private String extractRegex(String text, Pattern pattern) {
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : "Not specified";
    }
}`,
  },
  {
    path: 'src/main/java/com/skillmatch/controller/ScreeningController.java',
    name: 'ScreeningController.java',
    package: 'com.skillmatch.controller',
    category: 'Controller',
    description: 'REST controller handling multipart batch uploads, analysis triggers, and CSV streaming.',
    code: `package com.skillmatch.controller;

import com.skillmatch.dto.ScreeningResponseDTO;
import com.skillmatch.entity.ScreeningSession;
import com.skillmatch.service.ScreeningWorkflowService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/screenings")
@CrossOrigin(origins = "*")
public class ScreeningController {

    private final ScreeningWorkflowService workflowService;

    public ScreeningController(ScreeningWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @PostMapping
    public ResponseEntity<ScreeningSession> createScreening(@RequestParam Long jobProfileId) {
        ScreeningSession session = workflowService.createSession(jobProfileId);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @PostMapping(value = "/{id}/resumes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ScreeningResponseDTO> uploadResumes(
            @PathVariable Long id,
            @RequestPart("resumes") List<MultipartFile> files) {
        ScreeningResponseDTO response = workflowService.uploadBatch(id, files);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/analyse")
    public ResponseEntity<ScreeningSession> triggerAnalysis(@PathVariable Long id) {
        ScreeningSession session = workflowService.executeAnalysis(id);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{id}/export.csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable Long id) {
        byte[] csvData = workflowService.generateCsvReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"screening_results.csv\\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                .body(csvData);
    }
}`,
  },
  {
    path: 'src/test/java/com/skillmatch/matching/SkillMatchingServiceTest.java',
    name: 'SkillMatchingServiceTest.java',
    package: 'com.skillmatch.matching',
    category: 'Test',
    description: 'JUnit 5 unit test suite validating formula, ties, aliases, threshold checks, and edge cases.',
    code: `package com.skillmatch.matching;

import com.skillmatch.entity.CandidateResume;
import com.skillmatch.entity.JobProfile;
import com.skillmatch.entity.MatchResult;
import com.skillmatch.entity.MatchResult.SuitabilityCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SkillMatchingService Automated Test Suite")
class SkillMatchingServiceTest {

    private SkillMatchingService matchingService;
    private JobProfile sampleJob;

    @BeforeEach
    void setUp() {
        matchingService = new SkillMatchingService();

        sampleJob = new JobProfile();
        sampleJob.setTitle("Java Backend Intern");
        sampleJob.setRequiredSkills(List.of("Java", "SQL", "Spring Boot", "HTML"));
        sampleJob.setEligibilityThreshold(75.0);
    }

    @Test
    @DisplayName("Should calculate 75% score for 3 of 4 skills matched (Candidate A from prompt)")
    void testStandardMatchingCalculation() {
        CandidateResume candidate = new CandidateResume();
        candidate.setCandidateName("Candidate A");
        candidate.setIdentifiedSkills(List.of("Java", "SQL", "HTML", "Python", "Git"));

        MatchResult result = matchingService.evaluateCandidate(candidate, sampleJob);

        assertEquals(75.0, result.getMatchingPercentage(), 0.01);
        assertEquals(SuitabilityCategory.BEST_SUITABLE, result.getSuitabilityCategory());
        assertTrue(result.getIsEligible());
        assertTrue(result.getMatchedSkills().containsAll(List.of("Java", "SQL", "HTML")));
        assertTrue(result.getMissingSkills().contains("Spring Boot"));
        assertTrue(result.getExtraSkills().containsAll(List.of("Python", "Git")));
    }

    @Test
    @DisplayName("Should assign identical rank for tied candidates using competition ranking (1, 1, 3)")
    void testCompetitionRankingTies() {
        CandidateResume cand1 = createCandidateWithScore("Cand 1", 75.0);
        CandidateResume cand2 = createCandidateWithScore("Cand 2", 75.0);
        CandidateResume cand3 = createCandidateWithScore("Cand 3", 50.0);

        List<CandidateResume> ranked = matchingService.applyCompetitionRanking(List.of(cand1, cand2, cand3));

        assertEquals(1, ranked.get(0).getMatchResult().getRankPosition());
        assertEquals(1, ranked.get(1).getMatchResult().getRankPosition());
        assertEquals(3, ranked.get(2).getMatchResult().getRankPosition(), "Third candidate must receive Rank 3, skipping 2");
    }

    @Test
    @DisplayName("Should normalize aliases correctly (e.g., 'springboot' -> 'Spring Boot')")
    void testSkillAliasNormalization() {
        assertEquals("Spring Boot", matchingService.normalizeSkill("springboot"));
        assertEquals("Spring Boot", matchingService.normalizeSkill("spring boot"));
        assertEquals("Java", matchingService.normalizeSkill("java 17"));
        assertEquals("SQL", matchingService.normalizeSkill("structured query language"));
    }

    private CandidateResume createCandidateWithScore(String name, double pct) {
        CandidateResume resume = new CandidateResume();
        resume.setCandidateName(name);
        MatchResult mr = new MatchResult();
        mr.setMatchingPercentage(pct);
        resume.setMatchResult(mr);
        return resume;
    }
}`,
  },
  {
    path: 'src/main/resources/schema.sql',
    name: 'schema.sql',
    package: 'MySQL DDL Schema',
    category: 'SQL',
    description: 'Production MySQL schema with relational foreign keys, cascade deletes, and composite indexes.',
    code: `-- SkillMatch AI — Production MySQL Database Schema
-- Compatible with MySQL 8.0+ / Spring Data JPA & Hibernate

CREATE DATABASE IF NOT EXISTS \`skillmatch_db\`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE \`skillmatch_db\`;

-- 1. Job Profiles Table
CREATE TABLE IF NOT EXISTS \`job_profiles\` (
    \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
    \`title\` VARCHAR(150) NOT NULL,
    \`company_name\` VARCHAR(150) NULL,
    \`job_description\` TEXT NULL,
    \`eligibility_threshold\` DECIMAL(5,2) NOT NULL DEFAULT 75.00,
    \`notes\` VARCHAR(500) NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_job_created\` (\`created_at\` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Job Required Skills (ElementCollection mapping)
CREATE TABLE IF NOT EXISTS \`job_required_skills\` (
    \`job_profile_id\` BIGINT NOT NULL,
    \`skill_name\` VARCHAR(100) NOT NULL,
    PRIMARY KEY (\`job_profile_id\`, \`skill_name\`),
    CONSTRAINT \`fk_jrs_job\` FOREIGN KEY (\`job_profile_id\`)
        REFERENCES \`job_profiles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Screening Sessions
CREATE TABLE IF NOT EXISTS \`screening_sessions\` (
    \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
    \`job_profile_id\` BIGINT NOT NULL,
    \`session_status\` VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    \`total_uploaded_files\` INT NOT NULL DEFAULT 0,
    \`successfully_processed_files\` INT NOT NULL DEFAULT 0,
    \`failed_files\` INT NOT NULL DEFAULT 0,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`completed_at\` TIMESTAMP NULL,
    CONSTRAINT \`fk_ss_job\` FOREIGN KEY (\`job_profile_id\`)
        REFERENCES \`job_profiles\` (\`id\`) ON DELETE CASCADE,
    INDEX \`idx_session_status\` (\`session_status\`),
    INDEX \`idx_session_created\` (\`created_at\` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Candidate Resumes Table
CREATE TABLE IF NOT EXISTS \`candidate_resumes\` (
    \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
    \`screening_session_id\` BIGINT NOT NULL,
    \`candidate_name\` VARCHAR(120) NOT NULL,
    \`email\` VARCHAR(120) NULL,
    \`phone\` VARCHAR(50) NULL,
    \`original_filename\` VARCHAR(255) NOT NULL,
    \`file_type\` VARCHAR(20) NOT NULL,
    \`file_size_bytes\` BIGINT NULL,
    \`content_hash\` CHAR(64) NOT NULL,
    \`raw_text\` LONGTEXT NULL,
    \`extraction_status\` VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_cr_session\` FOREIGN KEY (\`screening_session_id\`)
        REFERENCES \`screening_sessions\` (\`id\`) ON DELETE CASCADE,
    INDEX \`idx_resume_hash\` (\`content_hash\`),
    INDEX \`idx_resume_name\` (\`candidate_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Match Results Table
CREATE TABLE IF NOT EXISTS \`match_results\` (
    \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
    \`candidate_resume_id\` BIGINT NOT NULL UNIQUE,
    \`job_profile_id\` BIGINT NOT NULL,
    \`matching_percentage\` DECIMAL(5,2) NOT NULL,
    \`suitability_category\` VARCHAR(30) NOT NULL,
    \`recommendation_explanation\` TEXT NULL,
    \`rank_position\` INT NOT NULL,
    \`is_eligible\` BOOLEAN NOT NULL,
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT \`fk_mr_resume\` FOREIGN KEY (\`candidate_resume_id\`)
        REFERENCES \`candidate_resumes\` (\`id\`) ON DELETE CASCADE,
    CONSTRAINT \`fk_mr_job\` FOREIGN KEY (\`job_profile_id\`)
        REFERENCES \`job_profiles\` (\`id\`) ON DELETE CASCADE,
    INDEX \`idx_mr_rank\` (\`rank_position\` ASC),
    INDEX \`idx_mr_category\` (\`suitability_category\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  },
];
