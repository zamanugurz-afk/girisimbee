import type {
  CvBoundingBox,
  CvColumnRegion,
  CvDocumentBlock,
  CvDocumentModel,
  CvDocumentPage,
} from './cv-document-model';

export interface RawSpatialToken {
  text: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontName?: string;
  isBold?: boolean;
  isItalic?: boolean;
}

export interface SpatialLayoutConfig {
  minColumnGap?: number;
  headerNoiseThresholdY?: number;
  footerNoiseThresholdY?: number;
  lineMergeThresholdY?: number;
  pageWidth?: number;
  pageHeight?: number;
}

const DEFAULT_CONFIG: Required<SpatialLayoutConfig> = {
  minColumnGap: 18,
  headerNoiseThresholdY: 45,
  footerNoiseThresholdY: 780,
  lineMergeThresholdY: 4.5,
  pageWidth: 595,
  pageHeight: 842,
};

/**
 * Spatial Layout Engine:
 * Analyzes 2D bounding boxes and coordinates of tokens, performs gutter detection,
 * separates sidebar/multi-column content, filters recurring header/footer noise,
 * and reconstructs the true human reading order.
 */
export function reconstructDocumentLayout(
  tokens: RawSpatialToken[],
  format: 'pdf' | 'docx' | 'txt' = 'pdf',
  config: SpatialLayoutConfig = {},
): CvDocumentModel {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!tokens || tokens.length === 0) {
    return {
      pages: [],
      fullText: '',
      readingOrderText: '',
      format,
      isMultiColumn: false,
      totalPages: 0,
    };
  }

  // 1. Group tokens by page
  const pageMap = new Map<number, RawSpatialToken[]>();
  for (const token of tokens) {
    const p = token.page || 1;
    if (!pageMap.has(p)) pageMap.set(p, []);
    pageMap.get(p)!.push(token);
  }

  // 2. Multi-page recurring header/footer noise detection
  const totalPages = Math.max(...Array.from(pageMap.keys()), 1);
  const textFrequencyAtTop = new Map<string, number>();
  const textFrequencyAtBottom = new Map<string, number>();

  if (totalPages > 1) {
    for (const [, pTokens] of pageMap.entries()) {
      for (const t of pTokens) {
        const clean = t.text.trim().toLowerCase();
        if (!clean || clean.length < 3) continue;

        if (t.y <= cfg.headerNoiseThresholdY) {
          textFrequencyAtTop.set(clean, (textFrequencyAtTop.get(clean) || 0) + 1);
        } else if (t.y >= cfg.footerNoiseThresholdY) {
          textFrequencyAtBottom.set(clean, (textFrequencyAtBottom.get(clean) || 0) + 1);
        }
      }
    }
  }

  const documentPages: CvDocumentPage[] = [];
  let isAnyPageMultiColumn = false;
  const readingOrderPageTexts: string[] = [];
  const fullTextPageTexts: string[] = [];

  for (let pNum = 1; pNum <= totalPages; pNum++) {
    const pTokens = pageMap.get(pNum) || [];
    if (pTokens.length === 0) continue;

    // Filter out top/bottom recurring noise across pages (e.g. page numbers or recurring template headers)
    const filteredTokens = pTokens.filter((t) => {
      const clean = t.text.trim().toLowerCase();
      if (!clean) return false;

      // Filter page numbers (e.g., "1 / 3", "Sayfa 2", "Page 2 of 4")
      if (/^(sayfa\s*\d+|\d+\s*\/\s*\d+|page\s*\d+(\s*of\s*\d+)?)$/i.test(clean)) {
        return false;
      }

      if (
        t.y <= cfg.headerNoiseThresholdY &&
        totalPages > 1 &&
        (textFrequencyAtTop.get(clean) || 0) >= totalPages - 1
      ) {
        return false;
      }

      if (
        t.y >= cfg.footerNoiseThresholdY &&
        totalPages > 1 &&
        (textFrequencyAtBottom.get(clean) || 0) >= totalPages - 1
      ) {
        return false;
      }

      return true;
    });

    // Gutter / Column Detection
    const { columns, isMultiColumn } = detectPageColumns(filteredTokens, cfg);
    if (isMultiColumn) isAnyPageMultiColumn = true;

    // Group horizontal tokens into cohesive line blocks
    const lineBlocks = groupTokensIntoLines(filteredTokens, columns, cfg, pNum);

    // Reorder blocks by Column Reading Order
    const sortedBlocks = sortBlocksByReadingOrder(lineBlocks, columns);

    documentPages.push({
      pageNumber: pNum,
      width: cfg.pageWidth,
      height: cfg.pageHeight,
      blocks: sortedBlocks,
      columns,
    });

    const pageReadingText = sortedBlocks.map((b) => b.text).join('\n');
    readingOrderPageTexts.push(pageReadingText);

    // Also construct simple top-to-bottom for comparison
    const simpleText = filteredTokens
      .sort((a, b) => (Math.abs(a.y - b.y) <= cfg.lineMergeThresholdY ? a.x - b.x : a.y - b.y))
      .map((t) => t.text)
      .join(' ');
    fullTextPageTexts.push(simpleText);
  }

  const readingOrderText = readingOrderPageTexts.join('\n\n');
  const fullText = fullTextPageTexts.join('\n\n');

  return {
    pages: documentPages,
    fullText,
    readingOrderText: readingOrderText.trim() || fullText.trim(),
    format,
    isMultiColumn: isAnyPageMultiColumn,
    totalPages,
  };
}

/**
 * Gutter & Column Detection:
 * Analyzes X-axis distribution of text blocks to detect multi-column layouts (e.g. 2-column or sidebar CVs).
 */
function detectPageColumns(
  tokens: RawSpatialToken[],
  cfg: Required<SpatialLayoutConfig>,
): { columns: CvColumnRegion[]; isMultiColumn: boolean } {
  if (tokens.length < 8) {
    return {
      columns: [{ id: 1, minX: 0, maxX: cfg.pageWidth, isSidebar: false, blockCount: tokens.length }],
      isMultiColumn: false,
    };
  }

  // Create X histogram with 20pt bins
  const binSize = 20;
  const numBins = Math.ceil(cfg.pageWidth / binSize);
  const xBins = new Array(numBins).fill(0);

  for (const t of tokens) {
    const startBin = Math.max(0, Math.min(numBins - 1, Math.floor(t.x / binSize)));
    const endBin = Math.max(
      0,
      Math.min(numBins - 1, Math.floor((t.x + Math.max(t.width, 10)) / binSize)),
    );
    for (let b = startBin; b <= endBin; b++) {
      xBins[b]++;
    }
  }

  // Look for a significant gutter (valleys where text density drops to zero or near zero between two populated peaks)
  let bestSplitX = -1;
  let maxValleyQuality = 0;

  for (let i = 4; i < numBins - 5; i++) {
    const xPos = i * binSize;
    // Check if there is significant text on the left (e.g. sidebar or left column)
    const leftCount = xBins.slice(0, i).reduce((a, b) => a + b, 0);
    // Check if there is significant text on the right
    const rightCount = xBins.slice(i + 1).reduce((a, b) => a + b, 0);

    if (leftCount >= tokens.length * 0.15 && rightCount >= tokens.length * 0.25) {
      // Check for low density in the gutter area (i-1 .. i+1)
      const valleyDensity = (xBins[i - 1] || 0) + xBins[i] + (xBins[i + 1] || 0);
      const quality = (leftCount + rightCount) / (valleyDensity + 1);

      if (quality > maxValleyQuality && quality > 15) {
        maxValleyQuality = quality;
        bestSplitX = xPos;
      }
    }
  }

  if (bestSplitX > 100 && bestSplitX < cfg.pageWidth - 100) {
    const isLeftSidebar = bestSplitX <= cfg.pageWidth * 0.42;
    const isRightSidebar = bestSplitX >= cfg.pageWidth * 0.58;

    const leftBlocks = tokens.filter((t) => t.x + t.width <= bestSplitX + 15).length;
    const rightBlocks = tokens.filter((t) => t.x >= bestSplitX - 15).length;

    const col1: CvColumnRegion = {
      id: 1,
      minX: 0,
      maxX: bestSplitX,
      isSidebar: isLeftSidebar,
      blockCount: leftBlocks,
    };
    const col2: CvColumnRegion = {
      id: 2,
      minX: bestSplitX,
      maxX: cfg.pageWidth,
      isSidebar: isRightSidebar,
      blockCount: rightBlocks,
    };

    return {
      columns: [col1, col2],
      isMultiColumn: true,
    };
  }

  return {
    columns: [{ id: 1, minX: 0, maxX: cfg.pageWidth, isSidebar: false, blockCount: tokens.length }],
    isMultiColumn: false,
  };
}

/**
 * Groups raw spatial tokens sharing the same line and column into cohesive line blocks.
 */
function groupTokensIntoLines(
  tokens: RawSpatialToken[],
  columns: CvColumnRegion[],
  cfg: Required<SpatialLayoutConfig>,
  pageNumber: number,
): CvDocumentBlock[] {
  // 1. Assign each token to its column
  const columnTokens = new Map<number, RawSpatialToken[]>();
  for (const col of columns) {
    columnTokens.set(col.id, []);
  }

  for (const t of tokens) {
    let assignedColId = columns[0].id;
    for (const col of columns) {
      if (t.x >= col.minX - 10 && t.x <= col.maxX + 10) {
        assignedColId = col.id;
        break;
      }
    }
    columnTokens.get(assignedColId)!.push(t);
  }

  const blocks: CvDocumentBlock[] = [];
  let blockIndex = 0;

  for (const col of columns) {
    const cTokens = columnTokens.get(col.id) || [];
    if (cTokens.length === 0) continue;

    // Sort tokens by Y ascending (or descending depending on coordinate origin), then X ascending
    const sorted = [...cTokens].sort((a, b) => {
      const dy = a.y - b.y;
      if (Math.abs(dy) <= cfg.lineMergeThresholdY) {
        return a.x - b.x;
      }
      return dy;
    });

    // Group into horizontal lines
    let currentLineTokens: RawSpatialToken[] = [];
    let currentLineY = -9999;

    for (const token of sorted) {
      if (currentLineTokens.length === 0) {
        currentLineTokens.push(token);
        currentLineY = token.y;
      } else {
        if (Math.abs(token.y - currentLineY) <= cfg.lineMergeThresholdY) {
          currentLineTokens.push(token);
        } else {
          // Flush line
          blocks.push(buildBlockFromLineTokens(currentLineTokens, col.id, pageNumber, blockIndex++));
          currentLineTokens = [token];
          currentLineY = token.y;
        }
      }
    }

    if (currentLineTokens.length > 0) {
      blocks.push(buildBlockFromLineTokens(currentLineTokens, col.id, pageNumber, blockIndex++));
    }
  }

  return blocks;
}

function buildBlockFromLineTokens(
  tokens: RawSpatialToken[],
  columnId: number,
  page: number,
  index: number,
): CvDocumentBlock {
  const sorted = [...tokens].sort((a, b) => a.x - b.x);
  const text = sorted
    .map((t) => t.text.trim())
    .filter(Boolean)
    .join(' ');

  const minX = Math.min(...sorted.map((t) => t.x));
  const maxX = Math.max(...sorted.map((t) => t.x + (t.width || 10)));
  const minY = Math.min(...sorted.map((t) => t.y));
  const maxY = Math.max(...sorted.map((t) => t.y + (t.height || 12)));

  const avgFontSize =
    sorted.reduce((acc, t) => acc + (t.fontSize || 10), 0) / Math.max(sorted.length, 1);
  const isBold = sorted.some((t) => Boolean(t.isBold));
  const isItalic = sorted.some((t) => Boolean(t.isItalic));

  return {
    id: `blk_${page}_${columnId}_${index}`,
    text,
    page,
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
    fontSize: avgFontSize,
    isBold,
    isItalic,
    columnId,
    type: isBold && avgFontSize >= 12 ? 'heading' : 'paragraph',
  };
}

/**
 * Orders blocks following correct reading order:
 * If multi-column: processes primary content column first (or left-to-right as appropriate),
 * preventing left sidebar skills from polluting right-side experience timelines.
 */
function sortBlocksByReadingOrder(
  blocks: CvDocumentBlock[],
  columns: CvColumnRegion[],
): CvDocumentBlock[] {
  if (columns.length <= 1) {
    return [...blocks].sort((a, b) => {
      const dy = a.y - b.y;
      if (Math.abs(dy) <= 4.5) return a.x - b.x;
      return dy;
    });
  }

  // Multi-column: Order by Column ID first (e.g. Left column top-to-bottom, then Right column top-to-bottom)
  // or Header blocks first if across both columns (x spans full width)
  const fullWidthBlocks = blocks.filter((b) => b.width >= 350 && b.y <= 150);
  const nonHeaderBlocks = blocks.filter((b) => !fullWidthBlocks.includes(b));

  const sortedColumns = [...columns].sort((a, b) => a.minX - b.minX);
  const columnOrderedBlocks: CvDocumentBlock[] = [];

  for (const col of sortedColumns) {
    const cBlocks = nonHeaderBlocks.filter((b) => b.columnId === col.id);
    cBlocks.sort((a, b) => a.y - b.y);
    columnOrderedBlocks.push(...cBlocks);
  }

  return [...fullWidthBlocks.sort((a, b) => a.y - b.y), ...columnOrderedBlocks];
}
