import type { ResultViewModel, ResultVirtueView } from './result-view-model';

export const SHARE_CARD_WIDTH = 920;
export const SHARE_CARD_HEIGHT = 1150;
const SCALE = 2;
const LOGICAL_WIDTH = SHARE_CARD_WIDTH / SCALE;
const LOGICAL_HEIGHT = SHARE_CARD_HEIGHT / SCALE;

export interface ShareCardArtifact {
  fileName: string;
  width: typeof SHARE_CARD_WIDTH;
  height: typeof SHARE_CARD_HEIGHT;
}

export function renderShareCard(
  canvas: HTMLCanvasElement,
  viewModel: ResultViewModel,
): ShareCardArtifact {
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D rendering is unavailable.');

  context.scale(SCALE, SCALE);
  context.fillStyle = '#101313';
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  context.strokeStyle = viewModel.color;
  context.lineWidth = 3;
  context.strokeRect(2, 2, LOGICAL_WIDTH - 4, LOGICAL_HEIGHT - 4);

  drawHeader(context, viewModel);
  if (viewModel.kind === 'standard') {
    drawStandardResult(context, viewModel);
  } else {
    drawSpecialResult(context, viewModel);
  }
  drawFooter(context, viewModel);

  return {
    fileName: viewModel.kind === 'standard'
      ? `undertale-soul-${viewModel.primary.code.toLowerCase()}${viewModel.isDevelopmentPreview ? '-development' : ''}.png`
      : `undertale-soul-${viewModel.specialId}${viewModel.isDevelopmentPreview ? '-development' : ''}.png`,
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
  };
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The result image could not be encoded.'));
    }, 'image/png');
  });
}

export function downloadBlob(
  blob: Blob,
  fileName: string,
  documentObject: Document = document,
  urlObject: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'> = URL,
): void {
  const objectUrl = urlObject.createObjectURL(blob);
  const link = documentObject.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.hidden = true;
  documentObject.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => urlObject.revokeObjectURL(objectUrl), 0);
}

function drawHeader(context: CanvasRenderingContext2D, viewModel: ResultViewModel): void {
  context.fillStyle = '#f7f7f2';
  context.font = '700 14px ui-monospace, monospace';
  context.fillText('UNDERTALE SOUL QUIZ', 28, 38);

  context.fillStyle = '#f2cf46';
  context.font = '700 10px ui-monospace, monospace';
  context.textAlign = 'right';
  context.fillText(
    viewModel.isDevelopmentPreview ? 'DEVELOPMENT PREVIEW' : 'ORIGINAL FAN QUIZ',
    LOGICAL_WIDTH - 28,
    38,
  );
  context.textAlign = 'left';

  drawHeart(context, LOGICAL_WIDTH / 2, 75, viewModel.color);
  context.fillStyle = '#f2cf46';
  context.font = '700 10px ui-monospace, monospace';
  context.textAlign = 'center';
  context.fillText(viewModel.eyebrow, LOGICAL_WIDTH / 2, 122);
  context.textAlign = 'left';
}

function drawStandardResult(
  context: CanvasRenderingContext2D,
  viewModel: Extract<ResultViewModel, { kind: 'standard' }>,
): void {
  context.fillStyle = '#f7f7f2';
  context.font = '700 30px ui-monospace, monospace';
  context.textAlign = 'center';
  context.fillText(viewModel.primary.label, LOGICAL_WIDTH / 2, 166);
  context.fillStyle = viewModel.primary.color;
  context.font = '700 16px ui-monospace, monospace';
  context.fillText(`${viewModel.primary.percentage}% PRIMARY`, LOGICAL_WIDTH / 2, 194);

  context.fillStyle = '#a9b5b1';
  context.font = '700 12px ui-monospace, monospace';
  context.fillText(
    `${viewModel.secondary.label} ${viewModel.secondary.percentage}% SECONDARY`,
    LOGICAL_WIDTH / 2,
    222,
  );
  context.textAlign = 'left';

  drawSpread(context, viewModel.spread, 258);
}

function drawSpecialResult(
  context: CanvasRenderingContext2D,
  viewModel: Extract<ResultViewModel, { kind: 'special' }>,
): void {
  context.fillStyle = '#f7f7f2';
  context.font = '700 25px ui-monospace, monospace';
  context.textAlign = 'center';
  context.fillText(viewModel.heading, LOGICAL_WIDTH / 2, 170);
  context.fillStyle = '#a9b5b1';
  context.font = '12px ui-monospace, monospace';
  drawWrappedText(context, viewModel.summary, LOGICAL_WIDTH / 2, 208, 360, 19, 3);
  context.textAlign = 'left';

  if (viewModel.spread.length > 0) {
    drawSpread(context, viewModel.spread, 294);
  } else {
    context.fillStyle = viewModel.color;
    context.font = '700 28px ui-monospace, monospace';
    context.textAlign = 'center';
    context.fillText('SPECIAL RESULT', LOGICAL_WIDTH / 2, 348);
    context.fillStyle = '#a9b5b1';
    context.font = '700 11px ui-monospace, monospace';
    context.fillText(viewModel.specialLabel, LOGICAL_WIDTH / 2, 374);
    context.textAlign = 'left';
  }
}

function drawSpread(
  context: CanvasRenderingContext2D,
  spread: ResultVirtueView[],
  startY: number,
): void {
  context.fillStyle = '#f7f7f2';
  context.font = '700 12px ui-monospace, monospace';
  context.fillText(spread.length === 7 ? 'FULL SOUL SPREAD' : 'SPECIAL RESULT SPREAD', 28, startY);

  spread.forEach((virtue, index) => {
    const y = startY + 28 + index * 36;
    context.fillStyle = virtue.color;
    context.fillRect(28, y - 12, 8, 14);
    context.fillStyle = '#f7f7f2';
    context.font = '700 11px ui-monospace, monospace';
    context.fillText(virtue.label.toUpperCase(), 44, y);
    context.textAlign = 'right';
    context.fillText(`${virtue.percentage}%`, LOGICAL_WIDTH - 28, y);
    context.textAlign = 'left';
    context.fillStyle = '#36413e';
    context.fillRect(28, y + 8, LOGICAL_WIDTH - 56, 5);
    context.fillStyle = virtue.color;
    context.fillRect(28, y + 8, (LOGICAL_WIDTH - 56) * (virtue.percentage / 100), 5);
  });
}

function drawFooter(context: CanvasRenderingContext2D, viewModel: ResultViewModel): void {
  context.strokeStyle = '#36413e';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(28, LOGICAL_HEIGHT - 58);
  context.lineTo(LOGICAL_WIDTH - 28, LOGICAL_HEIGHT - 58);
  context.stroke();

  context.fillStyle = '#a9b5b1';
  context.font = '10px ui-monospace, monospace';
  context.fillText('UNOFFICIAL FAN PROJECT', 28, LOGICAL_HEIGHT - 30);
  context.textAlign = 'right';
  context.fillText(viewModel.siteUrl.replace(/^https?:\/\//, ''), LOGICAL_WIDTH - 28, LOGICAL_HEIGHT - 30);
  context.textAlign = 'left';
}

function drawHeart(
  context: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(centerX - 24, topY);
  context.lineTo(centerX - 7, topY);
  context.lineTo(centerX, topY + 9);
  context.lineTo(centerX + 7, topY);
  context.lineTo(centerX + 24, topY);
  context.lineTo(centerX + 24, topY + 20);
  context.lineTo(centerX, topY + 46);
  context.lineTo(centerX - 24, topY + 20);
  context.closePath();
  context.fill();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): void {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && context.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  lines.slice(0, maxLines).forEach((line, index) => {
    context.fillText(line, centerX, startY + index * lineHeight);
  });
}
