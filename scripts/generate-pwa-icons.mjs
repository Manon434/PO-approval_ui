import { mkdir, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";

const outputDir = new URL("../public/icons/", import.meta.url);

const crcTable = new Uint32Array(256).map((_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}

function setPixel(buffer, width, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= width) {
    return;
  }
  const index = (y * width + x) * 4;
  buffer[index] = color[0];
  buffer[index + 1] = color[1];
  buffer[index + 2] = color[2];
  buffer[index + 3] = color[3];
}

function fillRoundedRect(buffer, width, x, y, w, h, radius, color) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      const dx = px < x + radius ? x + radius - px : px >= x + w - radius ? px - (x + w - radius - 1) : 0;
      const dy = py < y + radius ? y + radius - py : py >= y + h - radius ? py - (y + h - radius - 1) : 0;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(buffer, width, px, py, color);
      }
    }
  }
}

function fillRect(buffer, width, x, y, w, h, color) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      setPixel(buffer, width, px, py, color);
    }
  }
}

function drawLine(buffer, width, x1, y1, x2, y2, thickness, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const x = Math.round(x1 + ((x2 - x1) * i) / steps);
    const y = Math.round(y1 + ((y2 - y1) * i) / steps);
    fillRoundedRect(buffer, width, x - thickness / 2, y - thickness / 2, thickness, thickness, thickness / 2, color);
  }
}

function createIcon(size, maskable = false) {
  const pixels = Buffer.alloc(size * size * 4);
  const blue = [0, 112, 177, 255];
  const darkBlue = [0, 95, 153, 255];
  const white = [255, 255, 255, 255];
  const green = [15, 159, 110, 255];
  const transparent = [0, 0, 0, 0];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const mix = y / size;
      setPixel(pixels, size, x, y, [
        Math.round(blue[0] * (1 - mix) + darkBlue[0] * mix),
        Math.round(blue[1] * (1 - mix) + darkBlue[1] * mix),
        Math.round(blue[2] * (1 - mix) + darkBlue[2] * mix),
        255
      ]);
    }
  }

  if (maskable) {
    fillRoundedRect(pixels, size, size * 0.08, size * 0.08, size * 0.84, size * 0.84, size * 0.18, [255, 255, 255, 18]);
  }

  const docX = Math.round(size * 0.22);
  const docY = Math.round(size * 0.25);
  const docW = Math.round(size * 0.48);
  const docH = Math.round(size * 0.5);
  fillRoundedRect(pixels, size, docX, docY, docW, docH, Math.round(size * 0.055), white);
  fillRect(pixels, size, docX + size * 0.09, docY + size * 0.13, docW * 0.58, size * 0.045, blue);
  fillRect(pixels, size, docX + size * 0.09, docY + size * 0.25, docW * 0.46, size * 0.045, blue);
  fillRect(pixels, size, docX + size * 0.09, docY + size * 0.37, docW * 0.32, size * 0.045, blue);
  drawLine(pixels, size, size * 0.58, size * 0.65, size * 0.69, size * 0.76, size * 0.055, green);
  drawLine(pixels, size, size * 0.69, size * 0.76, size * 0.85, size * 0.52, size * 0.055, green);

  const scanlines = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const scanlineOffset = y * (size * 4 + 1);
    scanlines[scanlineOffset] = 0;
    pixels.copy(scanlines, scanlineOffset + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(scanlines)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

await mkdir(outputDir, { recursive: true });
await writeFile(new URL("icon-144.png", outputDir), createIcon(144));
await writeFile(new URL("icon-192.png", outputDir), createIcon(192));
await writeFile(new URL("icon-256.png", outputDir), createIcon(256));
await writeFile(new URL("icon-384.png", outputDir), createIcon(384));
await writeFile(new URL("icon-512.png", outputDir), createIcon(512));
await writeFile(new URL("maskable-512.png", outputDir), createIcon(512, true));
await writeFile(new URL("apple-touch-icon-120.png", outputDir), createIcon(120));
await writeFile(new URL("apple-touch-icon-152.png", outputDir), createIcon(152));
await writeFile(new URL("apple-touch-icon-167.png", outputDir), createIcon(167));
await writeFile(new URL("apple-touch-icon.png", outputDir), createIcon(180));
