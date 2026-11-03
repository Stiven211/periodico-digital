export type PublicationStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'published'
  | 'rejected';

export type CheckStatus = 'pass' | 'warn' | 'fail';

export interface PublicationCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface PublicationWarning {
  code: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface PublicationMedia {
  id: string;
  src: string;
  width: number;
  height: number;
  status: 'cover' | 'used' | 'unused' | 'usable_with_warning' | 'rejected';
  reason: string;
  watermark: string[];
  caption: string;
  credit: string;
}

export interface PublicationImage {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  width?: number;
  height?: number;
}

export type PublicationBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | ({ type: 'image' } & PublicationImage)
  | { type: 'ai-disclosure'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] };

export interface PublicationSource {
  label: string;
  url?: string;
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  dateSource: 'document' | 'file';
  status: PublicationStatus;
  excerpt: string;
  readingMinutes: number;
  wordCount: number;
  cover: PublicationImage | null;
  blocks: PublicationBlock[];
  sources: PublicationSource[];
  media: PublicationMedia[];
  checks: PublicationCheck[];
  warnings: PublicationWarning[];
  source: {
    filename: string;
    format: string;
    profile: string;
    sizeBytes: number;
    modifiedAt: string;
  };
  createdAt: string;
  publishedAt: string | null;
}
