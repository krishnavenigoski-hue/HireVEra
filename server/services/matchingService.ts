import { CandidateResume, JobProfile, MatchResult, SuitabilityCategory } from '../types.js';

export interface SkillDefinition {
  canonicalName: string;
  aliases: string[];
  category: 'Language' | 'Framework' | 'Database' | 'Frontend' | 'Tool' | 'Concept' | 'Cloud';
}

export const SKILL_DICTIONARY: SkillDefinition[] = [
  {
    canonicalName: 'Java',
    aliases: ['java', 'core java', 'java 8', 'java 11', 'java 17', 'java 21', 'j2se'],
    category: 'Language',
  },
  {
    canonicalName: 'Python',
    aliases: ['python', 'python 3', 'python3', 'py'],
    category: 'Language',
  },
  {
    canonicalName: 'SQL',
    aliases: ['sql', 'structured query language', 'ansi sql'],
    category: 'Database',
  },
  {
    canonicalName: 'MySQL',
    aliases: ['mysql'],
    category: 'Database',
  },
  {
    canonicalName: 'PostgreSQL',
    aliases: ['postgresql', 'postgres'],
    category: 'Database',
  },
  {
    canonicalName: 'Spring Boot',
    aliases: ['spring boot', 'springboot'],
    category: 'Framework',
  },
  {
    canonicalName: 'Spring Framework',
    aliases: ['spring framework', 'spring mvc', 'spring core', 'spring data'],
    category: 'Framework',
  },
  {
    canonicalName: 'HTML',
    aliases: ['html', 'html5'],
    category: 'Frontend',
  },
  {
    canonicalName: 'CSS',
    aliases: ['css', 'css3', 'tailwind', 'bootstrap'],
    category: 'Frontend',
  },
  {
    canonicalName: 'JavaScript',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
    category: 'Language',
  },
  {
    canonicalName: 'TypeScript',
    aliases: ['typescript', 'ts'],
    category: 'Language',
  },
  {
    canonicalName: 'React',
    aliases: ['react', 'react.js', 'reactjs'],
    category: 'Frontend',
  },
  {
    canonicalName: 'Git',
    aliases: ['git', 'github', 'gitlab', 'version control'],
    category: 'Tool',
  },
  {
    canonicalName: 'REST APIs',
    aliases: ['rest apis', 'rest api', 'restful api', 'restful apis', 'rest web services'],
    category: 'Concept',
  },
  {
    canonicalName: 'Hibernate',
    aliases: ['hibernate', 'jpa', 'hibernate jpa'],
    category: 'Framework',
  },
  {
    canonicalName: 'Data Structures and Algorithms',
    aliases: ['data structures and algorithms', 'data structures & algorithms', 'dsa', 'data structures'],
    category: 'Concept',
  },
  {
    canonicalName: 'Machine Learning',
    aliases: ['machine learning', 'ml', 'scikit-learn'],
    category: 'Concept',
  },
  {
    canonicalName: 'NumPy',
    aliases: ['numpy'],
    category: 'Tool',
  },
  {
    canonicalName: 'Pandas',
    aliases: ['pandas'],
    category: 'Tool',
  },
  {
    canonicalName: 'Docker',
    aliases: ['docker', 'containerization'],
    category: 'Tool',
  },
  {
    canonicalName: 'Kubernetes',
    aliases: ['kubernetes', 'k8s'],
    category: 'Tool',
  },
  {
    canonicalName: 'JUnit',
    aliases: ['junit', 'junit 5', 'unit testing', 'test driven development', 'tdd'],
    category: 'Tool',
  },
  {
    canonicalName: 'Maven',
    aliases: ['maven', 'apache maven', 'mvn'],
    category: 'Tool',
  },
  {
    canonicalName: 'Linux',
    aliases: ['linux', 'unix', 'bash shell', 'bash scripting'],
    category: 'Tool',
  },
  {
    canonicalName: 'Redis',
    aliases: ['redis', 'in-memory cache'],
    category: 'Database',
  },
  {
    canonicalName: 'Apache Kafka',
    aliases: ['apache kafka', 'kafka', 'message queue'],
    category: 'Tool',
  },
  {
    canonicalName: 'MongoDB',
    aliases: ['mongodb', 'mongo', 'nosql'],
    category: 'Database',
  },
];

export class SkillMatchingService {
  /**
   * Normalizes a skill string: trims whitespace and maps known aliases to canonical name
   */
  public normalizeSkill(skillName: string): string {
    const cleaned = skillName.trim();
    if (!cleaned) return '';

    const lower = cleaned.toLowerCase();
    for (const def of SKILL_DICTIONARY) {
      if (def.canonicalName.toLowerCase() === lower) {
        return def.canonicalName;
      }
      for (const alias of def.aliases) {
        if (alias.toLowerCase() === lower) {
          return def.canonicalName;
        }
      }
    }
    return cleaned; // Preserve custom skills if not in standard dictionary
  }

  /**
   * Extracts skills from resume text using regex phrase matching and dictionary
   */
  public extractSkillsFromText(text: string): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const foundSkills = new Set<string>();
    const lowerText = ` ${text.toLowerCase().replace(/[\r\n\t]/g, ' ')} `;

    // Sort dictionary definitions so multi-word phrases (e.g. "Spring Boot") match before single words ("Spring")
    const sortedDefs = [...SKILL_DICTIONARY].sort((a, b) => {
      const maxLenA = Math.max(...a.aliases.map(x => x.length), a.canonicalName.length);
      const maxLenB = Math.max(...b.aliases.map(x => x.length), b.canonicalName.length);
      return maxLenB - maxLenA;
    });

    for (const def of sortedDefs) {
      const targets = [def.canonicalName, ...def.aliases];
      for (const target of targets) {
        // Safe regex with word boundaries
        const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Word boundary matching accommodating punctuation like C++, C#, .NET, REST APIs
        const regex = new RegExp(`(?:^|[\\s,;:.()/\\[\\]\\-—])${escaped}(?=[\\s,;:.()/\\[\\]\\-—]|$)`, 'i');
        if (regex.test(lowerText)) {
          foundSkills.add(def.canonicalName);
          break;
        }
      }
    }

    return Array.from(foundSkills);
  }

  /**
   * Calculate match result between candidate skills and job profile requirements
   */
  public calculateMatch(
    candidateResumeId: string,
    candidateSkills: string[],
    jobProfile: JobProfile
  ): MatchResult {
    const requiredSkillsRaw = jobProfile.requiredSkills || [];
    // Normalize and deduplicate required skills
    const normalizedRequired = Array.from(
      new Set(
        requiredSkillsRaw
          .map(s => this.normalizeSkill(s))
          .filter(Boolean)
      )
    );

    if (normalizedRequired.length === 0) {
      throw new Error('Job profile has no valid required skills. Cannot calculate matching percentage.');
    }

    // Normalize candidate skills
    const normalizedCandidate = Array.from(
      new Set(
        (candidateSkills || [])
          .map(s => this.normalizeSkill(s))
          .filter(Boolean)
      )
    );

    const candidateSkillSet = new Set(normalizedCandidate.map(s => s.toLowerCase()));

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const reqSkill of normalizedRequired) {
      if (candidateSkillSet.has(reqSkill.toLowerCase())) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    // Extra skills are candidate skills that are NOT in the required list
    const requiredSkillSet = new Set(normalizedRequired.map(s => s.toLowerCase()));
    const extraSkills = normalizedCandidate.filter(
      candSkill => !requiredSkillSet.has(candSkill.toLowerCase())
    );

    // Formula: (matched unique / total unique required) * 100
    const rawPercentage = (matchedSkills.length / normalizedRequired.length) * 100;
    const matchingPercentage = Math.round(rawPercentage * 10) / 10; // 1 decimal place

    const threshold = jobProfile.eligibilityThreshold || 75;
    const isEligible = matchingPercentage >= threshold;

    let suitabilityCategory: SuitabilityCategory;
    let recommendationExplanation: string;

    if (matchingPercentage >= threshold) {
      suitabilityCategory = 'BEST_SUITABLE';
      recommendationExplanation = `Eligible for the next review stage. Matches ${matchedSkills.length} of ${normalizedRequired.length} required skills (${matchingPercentage}%), meeting or exceeding the threshold (${threshold}%).`;
    } else if (matchingPercentage >= 50) {
      suitabilityCategory = 'MEDIUM_SUITABLE';
      recommendationExplanation = `Partial skill match. Matches ${matchedSkills.length} of ${normalizedRequired.length} required skills (${matchingPercentage}%). Missing: ${missingSkills.join(', ')}.`;
    } else {
      suitabilityCategory = 'LOW_SUITABLE';
      recommendationExplanation = `Low current skill match. Matches ${matchedSkills.length} of ${normalizedRequired.length} required skills (${matchingPercentage}%). Requires development in: ${missingSkills.join(', ')}.`;
    }

    return {
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      candidateResumeId,
      jobProfileId: jobProfile.id,
      matchedSkills,
      missingSkills,
      extraSkills,
      matchingPercentage,
      suitabilityCategory,
      recommendationExplanation,
      rank: 1, // Will be computed in batch ranking
      isEligible,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Applies standard competition ranking (e.g., 1, 1, 3) to a list of candidates
   */
  public rankCandidates(candidates: CandidateResume[]): CandidateResume[] {
    // Sort descending by matchingPercentage
    const sorted = [...candidates].sort((a, b) => {
      const scoreA = a.matchResult?.matchingPercentage ?? -1;
      const scoreB = b.matchResult?.matchingPercentage ?? -1;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return a.candidateName.localeCompare(b.candidateName);
    });

    let currentRank = 1;
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) {
        const prevScore = sorted[i - 1].matchResult?.matchingPercentage ?? -1;
        const currScore = sorted[i].matchResult?.matchingPercentage ?? -1;
        if (currScore === prevScore) {
          // Tied: assign same rank as previous candidate
          if (sorted[i].matchResult && sorted[i - 1].matchResult) {
            sorted[i].matchResult!.rank = sorted[i - 1].matchResult!.rank;
          }
        } else {
          // Competition ranking: rank becomes i + 1
          currentRank = i + 1;
          if (sorted[i].matchResult) {
            sorted[i].matchResult!.rank = currentRank;
          }
        }
      } else {
        if (sorted[i].matchResult) {
          sorted[i].matchResult!.rank = 1;
        }
      }
    }

    return sorted;
  }
}

export const skillMatchingService = new SkillMatchingService();
