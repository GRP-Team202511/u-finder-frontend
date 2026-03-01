// ─── Personal Info ────────────────────────────────────────────────────────────

export interface PersonalInfo {
  name: string
  gender: string
  birthday: string // YYYY-MM-DD; empty string when not set
}

// ─── Education Background ─────────────────────────────────────────────────────

export interface TimeRange {
  start: string // YYYY-MM
  end: string   // YYYY-MM
}

export interface EducationItem {
  type: 'undergraduate' | 'master' | 'phd' | string
  name: string
  time: TimeRange
  major: string
  ranking: string | null
  GPA: string
  'GPA-base': string
}

// ─── Academic Outcomes ────────────────────────────────────────────────────────

export interface ResearchPaperItem {
  type: 'research paper'
  title: string
  doi: string
  abstract: string
}

export interface PatentItem {
  type: 'patent'
  title: string
  patent_number: string
  region: string
  description: string
}

export type AcademicItem = ResearchPaperItem | PatentItem

// ─── Standardized Tests ───────────────────────────────────────────────────────

export interface IELTSScores {
  overall: string
  listening: string
  reading: string
  writing: string
  speaking: string
}

export interface TOEFLScores {
  total: string
  reading: string
  listening: string
  speaking: string
  writing: string
}

export interface GREScores {
  verbal: string
  quantitative: string
  analytical_writing: string
  total: string
}

export interface GMATScores {
  total: string
  verbal: string
  quantitative: string
  integrated_reasoning: string
  analytical_writing: string
}

export interface SATScores {
  total: string
  evidence_based_reading_writing: string
  math: string
}

export interface ACTScores {
  composite: string
  english: string
  math: string
  reading: string
  science: string
}

export interface DuolingoScores {
  overall: string
  literacy: string
  comprehension: string
  conversation: string
  production: string
}

export interface CAEScores {
  overall: string
  reading: string
  writing: string
  use_of_english: string
  listening: string
  speaking: string
}

export interface APScores {
  [subject: string]: string // subject name -> score (1-5)
}

export interface IBScores {
  total: string
  [subject: string]: string
}

export interface ALevelScores {
  [subject: string]: string // subject name -> grade (A*, A, B, ...)
}

export interface IELTSItem {
  type: 'IELTS'
  test_date: string // YYYY-MM-DD
  scores: IELTSScores
}

export interface TOEFLItem {
  type: 'TOEFL'
  test_date: string
  scores: TOEFLScores
}

export interface GREItem {
  type: 'GRE'
  test_date: string
  scores: GREScores
}

export interface GMATItem {
  type: 'GMAT'
  test_date: string
  scores: GMATScores
}

export interface SATItem {
  type: 'SAT'
  test_date: string
  scores: SATScores
}

export interface ACTItem {
  type: 'ACT'
  test_date: string
  scores: ACTScores
}

export interface DuolingoItem {
  type: 'Duolingo'
  test_date: string
  scores: DuolingoScores
}

export interface CAEItem {
  type: 'CAE'
  test_date: string
  scores: CAEScores
}

export interface APItem {
  type: 'AP'
  test_date: string
  scores: APScores
}

export interface IBItem {
  type: 'IB'
  test_date: string
  scores: IBScores
}

export interface ALevelItem {
  type: 'A-Level'
  test_date: string
  scores: ALevelScores
}

export type TestItem =
  | IELTSItem
  | TOEFLItem
  | GREItem
  | GMATItem
  | SATItem
  | ACTItem
  | DuolingoItem
  | CAEItem
  | APItem
  | IBItem
  | ALevelItem

// ─── Internship ───────────────────────────────────────────────────────────────

export interface TimeRangeWithTillNow {
  start: string  // YYYY-MM
  end: string    // YYYY-MM
  till_now: boolean
}

export interface InternshipItem {
  company: string
  role: string
  time: TimeRangeWithTillNow
  description?: string
}

// ─── Project Experience ───────────────────────────────────────────────────────

export interface ProjectItem {
  name: string
  role: string
  time: TimeRangeWithTillNow
  description?: string
}

// ─── Campus Experience ────────────────────────────────────────────────────────

export interface CampusItem {
  name: string
  description?: string
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export interface AwardItem {
  name: string
  description?: string
}

// ─── API Field Names ──────────────────────────────────────────────────────────

/** Valid field names accepted by /profile/array/{field} */
export type ProfileFieldName =
  | 'education'
  | 'academic'
  | 'test'
  | 'internship'
  | 'project'
  | 'campus'
  | 'award'

/** Maps each field name to its corresponding item type */
export interface ProfileFieldTypeMap {
  education: EducationItem
  academic: AcademicItem
  test: TestItem
  internship: InternshipItem
  project: ProjectItem
  campus: CampusItem
  award: AwardItem
}

// ─── Aggregated Profile ───────────────────────────────────────────────────────

/** Response structure for GET /profile (all profile data in one request) */
export interface AllProfile {
  personalInfo: PersonalInfo
  education: { data: EducationItem[] }
  academic: { data: AcademicItem[] }
  test: { data: TestItem[] }
  internship: { data: InternshipItem[] }
  project: { data: ProjectItem[] }
  campus: { data: CampusItem[] }
  award: { data: AwardItem[] }
}
