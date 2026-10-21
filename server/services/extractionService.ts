import crypto from 'crypto';
import mammoth from 'mammoth';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import { createWorker } from 'tesseract.js';
import { CandidateResume, ExtractionStatus, FileType } from '../types.js';
import { skillMatchingService } from './matchingService.js';

export class DocumentExtractionService {
  /**
   * Generates a SHA-256 hash of file buffer for deduplication
   */
  public generateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Detects file type from filename or mimetype
   */
  public detectFileType(filename: string, mimetype?: string): FileType {
    const ext = filename.toLowerCase().split('.').pop() || '';
    if (ext === 'pdf' || mimetype === 'application/pdf') return 'PDF';
    if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(ext) || mimetype?.startsWith('image/')) return 'IMAGE';
    return 'TEXT';
  }

  /**
   * Main extraction method dispatching by file type
   */
  public async extractResume(
    buffer: Buffer,
    originalFilename: string,
    screeningSessionId: string,
    mimetype?: string,
    forceType?: FileType
  ): Promise<CandidateResume> {
    const fileType = forceType || this.detectFileType(originalFilename, mimetype);
    const contentHash = this.generateHash(buffer);
    const fileSizeBytes = buffer.length;
    const warnings: string[] = [];
    let rawText = '';
    let extractionStatus: ExtractionStatus = 'SUCCESS';

    try {
      if (fileType === 'PDF') {
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text || '';
        // If digital PDF extracted almost nothing, it might be a scanned PDF -> attempt OCR
        if (rawText.trim().length < 50) {
          warnings.push('Digital PDF text layer was sparse. Applying OCR fallback.');
          try {
            const ocrText = await this.performOCR(buffer);
            if (ocrText.trim().length > rawText.trim().length) {
              rawText = ocrText;
              warnings.push('Text extracted via OCR fallback engine.');
            }
          } catch (ocrErr: any) {
            warnings.push(`OCR fallback encountered: ${ocrErr.message || 'unknown error'}`);
          }
        }
      } else if (fileType === 'DOCX') {
        const result = await mammoth.extractRawText({ buffer });
        rawText = result.value || '';
        if (result.messages && result.messages.length > 0) {
          warnings.push(`Word document parsing note: ${result.messages[0].message}`);
        }
      } else if (fileType === 'IMAGE' || fileType === 'CAMERA') {
        warnings.push('Photograph/Scanned resume processed via Tesseract OCR engine.');
        rawText = await this.performOCR(buffer);
      } else {
        rawText = buffer.toString('utf-8');
      }
    } catch (err: any) {
      warnings.push(`Document reading error: ${err.message || 'Failed to parse file format'}`);
      extractionStatus = 'FAILED';
      rawText = '';
    }

    // Clean up raw text
    const cleanedText = this.cleanText(rawText);

    // If text is still practically empty
    if (cleanedText.length < 30) {
      if (extractionStatus !== 'FAILED') {
        extractionStatus = 'NEEDS_REVIEW';
      }
      warnings.push('Extracted text is very short or unreadable. Manual review is strongly required.');
    }

    // Extract Entities
    const { candidateName, isNameFallback } = this.extractCandidateName(cleanedText, originalFilename);
    if (isNameFallback) {
      warnings.push('Candidate name could not be reliably parsed from resume header; inferred from filename.');
      if (extractionStatus === 'SUCCESS') {
        extractionStatus = 'NEEDS_REVIEW';
      }
    }

    const email = this.extractEmail(cleanedText);
    const phone = this.extractPhone(cleanedText);
    const extractedEducation = this.extractEducation(cleanedText);
    const extractedExperience = this.extractExperience(cleanedText);
    const identifiedSkills = skillMatchingService.extractSkillsFromText(cleanedText);

    if (identifiedSkills.length === 0 && extractionStatus === 'SUCCESS') {
      extractionStatus = 'NEEDS_REVIEW';
      warnings.push('No recognized technical skills found in resume text. Candidate requires human review.');
    }

    return {
      id: `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      screeningSessionId,
      candidateName,
      email,
      phone,
      originalFilename,
      fileType,
      fileSizeBytes,
      contentHash,
      rawText: cleanedText,
      extractionStatus,
      extractionWarnings: warnings,
      extractedEducation,
      extractedExperience,
      identifiedSkills,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Perform Tesseract OCR on image buffer
   */
  private async performOCR(buffer: Buffer): Promise<string> {
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();
      return ret.data.text || '';
    } catch (err: any) {
      console.warn('OCR processing error:', err.message);
      return '';
    }
  }

  /**
   * Text sanitization without losing structural meaning
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // remove control chars
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Candidate name heuristic
   */
  private extractCandidateName(text: string, originalFilename: string): { candidateName: string; isNameFallback: boolean } {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .slice(0, 10); // inspect first 10 non-empty lines

    const ignoreKeywords = [
      'resume',
      'curriculum vitae',
      'cv',
      'profile',
      'bio',
      'email',
      'phone',
      'github',
      'linkedin',
      'address',
      'summary',
      'page 1',
      'page',
      'objective',
      'education',
      'skills',
      'experience',
      'contact',
    ];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (ignoreKeywords.some(kw => lower === kw || lower.startsWith(`${kw}:`))) {
        continue;
      }
      if (line.includes('@') || line.includes('http') || /\d{3,}/.test(line)) {
        continue;
      }

      // Candidate names are typically 2 to 4 capitalized words, 3 to 40 characters
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && line.length >= 4 && line.length <= 40) {
        const isLikelyName = words.every(w => /^[A-Z][a-zA-Z.'-]*$/.test(w) || w === 'de' || w === 'von');
        if (isLikelyName) {
          return { candidateName: line, isNameFallback: false };
        }
      }
    }

    // Fallback: clean filename
    const cleanedFilename = originalFilename
      .replace(/\.[^/.]+$/, '') // remove extension
      .replace(/[-_]/g, ' ')
      .replace(/\b(resume|cv|updated|final|v\d+|\d+)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedFilename.length >= 2) {
      // Capitalize words
      const titleCased = cleanedFilename
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      return { candidateName: titleCased || 'Candidate (Unnamed)', isNameFallback: true };
    }

    return { candidateName: 'Candidate (Unnamed)', isNameFallback: true };
  }

  /**
   * Extract email via regex
   */
  private extractEmail(text: string): string {
    const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0] : 'Not specified';
  }

  /**
   * Extract phone via regex
   */
  private extractPhone(text: string): string {
    const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return match ? match[0] : 'Not specified';
  }

  /**
   * Extract education highlights
   */
  private extractEducation(text: string): string[] {
    const lines = text.split('\n').map(l => l.trim());
    const eduKeywords = [
      'b.sc',
      'bsc',
      'b.tech',
      'btech',
      'bachelor',
      'm.sc',
      'msc',
      'm.tech',
      'master',
      'ph.d',
      'computer science',
      'data science',
      'information technology',
      'university',
      'institute',
      'college',
      'cgpa',
      'gpa',
    ];
    const results: string[] = [];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (eduKeywords.some(k => lower.includes(k)) && line.length > 5 && line.length < 120) {
        if (!results.includes(line)) {
          results.push(line.replace(/^[•\-\*]\s*/, ''));
        }
      }
      if (results.length >= 3) break;
    }
    return results.length > 0 ? results : ['Education details in resume text'];
  }

  /**
   * Extract experience highlights
   */
  private extractExperience(text: string): string[] {
    const lines = text.split('\n').map(l => l.trim());
    const expKeywords = [
      'intern',
      'developer',
      'engineer',
      'software engineer',
      'backend developer',
      'full stack',
      'analyst',
      'years experience',
      'built',
      'developed',
      'designed and implemented',
    ];
    const results: string[] = [];
    for (const line of lines) {
      const lower = line.toLowerCase();
      if (expKeywords.some(k => lower.includes(k)) && line.length > 10 && line.length < 140) {
        if (!results.includes(line)) {
          results.push(line.replace(/^[•\-\*]\s*/, ''));
        }
      }
      if (results.length >= 3) break;
    }
    return results.length > 0 ? results : ['Experience details in resume text'];
  }
}

export const documentExtractionService = new DocumentExtractionService();
