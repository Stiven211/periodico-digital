import type { PublicationCheck, PublicationWarning } from "./publication"

export type DriveStatus = "ready" | "review" | "blocked" | "published"

export interface DriveFile {
  id: string
  name: string
  driveId: string
  driveUrl: string
  kind: "docx" | "pdf"
  sizeBytes: number
  modifiedAt: string
  slug: string
  status: DriveStatus
  title: string
  date: string
  dateSource: "document" | "file"
  excerpt: string
  cover: string | null
  errorCount: number
  warningCount: number
  checks: PublicationCheck[]
  warnings: PublicationWarning[]
  publishedAt?: string
}

export interface DriveIndex {
  folderUrl: string
  syncedAt: string
  files: DriveFile[]
}
