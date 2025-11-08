import { BookFormat } from '@/types/book';

export type DocumentFile = File;

export type Location = {
  current: number;
  next: number;
  total: number;
};

export interface TOCItem {
  id: number;
  label: string;
  href: string;
  cfi?: string;
  location?: Location;
  subitems?: TOCItem[];
}

export interface SectionItem {
  id: string;
  cfi: string;
  size: number;
  linear: string;
  location?: Location;
  pageSpread?: 'left' | 'right' | 'center' | '';

  createDocument: () => Promise<Document>;
}

export type BookMetadata = {
  // NOTE: the title and author fields should be formatted
  title: string;
  author: string;
  language: string | string[];
  editor?: string;
  publisher?: string;
  published?: string;
  description?: string;
  subject?: string | string[];
  identifier?: string;
  altIdentifier?: string | string[];

  subtitle?: string;
  series?: string;
  seriesIndex?: number;
  seriesTotal?: number;

  coverImageFile?: string;
  coverImageUrl?: string;
  coverImageBlobUrl?: string;
};

export interface BookDoc {
  metadata: BookMetadata;
  rendition?: {
    layout?: 'pre-paginated' | 'reflowable';
    spread?: 'auto' | 'none';
    viewport?: { width: number; height: number };
  };
  dir: string;
  toc?: Array<TOCItem>;
  sections?: Array<SectionItem>;
  transformTarget?: EventTarget;
  splitTOCHref(href: string): Array<string | number>;
  getCover(): Promise<Blob | null>;
}

export const EXTS: Record<BookFormat, string> = {
  EPUB: 'epub',
  PDF: 'pdf',
  MOBI: 'mobi',
  AZW: 'azw',
  AZW3: 'azw3',
  CBZ: 'cbz',
  FB2: 'fb2',
  FBZ: 'fbz',
};

export class DocumentLoader {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  private async isZip(): Promise<boolean> {
    const arr = new Uint8Array(await this.file.slice(0, 4).arrayBuffer());
    return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04;
  }

  private async isPDF(): Promise<boolean> {
    const arr = new Uint8Array(await this.file.slice(0, 5).arrayBuffer());
    return arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2d;
  }

  private async makeZipLoader() {
    const getComment = async (): Promise<string | null> => {
      const EOCD_SIGNATURE = [0x50, 0x4b, 0x05, 0x06];
      const maxEOCDSearch = 1024 * 64;

      const sliceSize = Math.min(maxEOCDSearch, this.file.size);
      const tail = await this.file.slice(this.file.size - sliceSize, this.file.size).arrayBuffer();
      const bytes = new Uint8Array(tail);

      for (let i = bytes.length - 22; i >= 0; i--) {
        if (bytes[i] === EOCD_SIGNATURE[0] && bytes[i + 1] === EOCD_SIGNATURE[1] && bytes[i + 2] === EOCD_SIGNATURE[2] && bytes[i + 3] === EOCD_SIGNATURE[3]) {
          const commentLength = bytes[i + 20]! + (bytes[i + 21]! << 8);
          const commentStart = i + 22;
          const commentBytes = bytes.slice(commentStart, commentStart + commentLength);
          return new TextDecoder().decode(commentBytes);
        }
      }

      return null;
    };

    const { configure, ZipReader, BlobReader, TextWriter, BlobWriter } = await import('@zip.js/zip.js');
    type Entry = import('@zip.js/zip.js').Entry;
    configure({ useWebWorkers: false });
    const reader = new ZipReader(new BlobReader(this.file));
    const entries = await reader.getEntries();
    return { entries, getComment, sha1: undefined };
  }

  private isCBZ(): boolean {
    return this.file.type === 'application/vnd.comicbook+zip' || this.file.name.endsWith(`.${EXTS.CBZ}`);
  }

  private isFB2(): boolean {
    return this.file.type === 'application/x-fictionbook+xml' || this.file.name.endsWith(`.${EXTS.FB2}`);
  }

  private isFBZ(): boolean {
    return this.file.type === 'application/x-zip-compressed-fb2' || this.file.name.endsWith('.fb.zip') || this.file.name.endsWith('.fb2.zip') || this.file.name.endsWith(`.${EXTS.FBZ}`);
  }
}

export const getDirection = (doc: Document) => {
  const { defaultView } = doc;
  const { writingMode, direction } = defaultView!.getComputedStyle(doc.body);
  const vertical = writingMode === 'vertical-rl' || writingMode === 'vertical-lr';
  const rtl = doc.body.dir === 'rtl' || direction === 'rtl' || doc.documentElement.dir === 'rtl';
  return { vertical, rtl };
};
