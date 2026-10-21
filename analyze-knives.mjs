import sharp from 'sharp';

const dir = 'C:/Users/Windows/.gemini/antigravity-ide/brain/d6caf19b-3920-478c-b114-6e9ae1cf9eed';

const knives = [
  {
    name: 'ruby-platinum',
    src: 'ceo_ruby_platinum_1792605541151.jpg',
    dest: 'public/images/bespoke/ruby-platinum-ceo.png',
    ringCenter: { x: 875, y: 540 }
  },
  {
    name: 'gold-meteorite',
    src: 'ceo_gold_meteorite_1792605572645.jpg',
    dest: 'public/images/bespoke/gold-meteorite-ceo.png',
    ringCenter: { x: 875, y: 540 }
  },
  {
    name: 'diamond-sovereign',
    src: 'ceo_diamond_sovereign_1792605597823.jpg',
    dest: 'public/images/bespoke/diamond-sovereign-ceo.png',
    ringCenter: { x: 885, y: 545 }
  },
  {
    name: 'celestial-pink-diamond',
    src: 'ceo_celestial_pink_diamond_1792605644069.jpg',
    dest: 'public/images/bespoke/celestial-pink-diamond-ceo.png',
    ringCenter: { x: 875, y: 540 }
  }
];

async function processKnifePerfect(cfg) {
  const { data, info } = await sharp(dir + '/' + cfg.src).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // 1. Scan column envelopes across the whole image
  const topY = new Int32Array(w);
  const botY = new Int32Array(w);
  topY.fill(-1);
  botY.fill(-1);

  for (let x = 0; x < w; x++) {
    // Top spine: scan down from y=200 to y=755
    for (let y = 200; y < 755; y++) {
      const idx = (y * w + x) * 3;
      const v = Math.max(data[idx], data[idx + 1], data[idx + 2]);
      if (v >= 22) {
        topY[x] = y;
        break;
      }
    }
    // Bottom edge: scan up from y=755 to y=200
    for (let y = 755; y >= 200; y--) {
      const idx = (y * w + x) * 3;
      const v = Math.max(data[idx], data[idx + 1], data[idx + 2]);
      if (v >= 24) {
        botY[x] = y;
        break;
      }
    }
  }

  // 2. Identify the active horizontal range [minX, maxX]
  let minX = -1;
  let maxX = -1;
  for (let x = 0; x < w; x++) {
    if (topY[x] !== -1 && botY[x] !== -1 && topY[x] <= botY[x]) {
      if (minX === -1) minX = x;
      maxX = x;
    }
  }

  console.log(`Processing ${cfg.name} (${cfg.src}): knife active X range [${minX}, ${maxX}]`);

  // 3. Construct the comprehensive background mask (1 = background, 0 = foreground knife)
  const bgMask = new Uint8Array(w * h);

  // All columns strictly before minX or strictly after maxX are 100% background
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < minX; x++) {
      bgMask[y * w + x] = 1;
    }
    for (let x = maxX + 1; x < w; x++) {
      bgMask[y * w + x] = 1;
    }
  }

  // Global top and bottom margins beyond knife reach
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < 200; y++) {
      bgMask[y * w + x] = 1;
    }
    for (let y = 756; y < h; y++) {
      bgMask[y * w + x] = 1;
    }
  }

  // Column-wise envelope: everything above topY[x] and below botY[x] is background
  for (let x = minX; x <= maxX; x++) {
    const tY = topY[x];
    const bY = botY[x];

    if (tY !== -1 && bY !== -1 && tY <= bY) {
      for (let y = 0; y < tY; y++) {
        bgMask[y * w + x] = 1;
      }
      for (let y = bY + 1; y < h; y++) {
        bgMask[y * w + x] = 1;
      }
    } else {
      // Column has no knife pixel
      for (let y = 0; y < h; y++) {
        bgMask[y * w + x] = 1;
      }
    }
  }

  // 4. Ring Hole Masking
  if (cfg.ringCenter) {
    const cx = cfg.ringCenter.x;
    const cy = cfg.ringCenter.y;
    // Mark dark pixels inside the ring hole
    for (let dy = -44; dy <= 44; dy++) {
      for (let dx = -44; dx <= 44; dx++) {
        if (dx * dx + dy * dy <= 44 * 44) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < w && y >= 0 && y < h) {
            const idx = (y * w + x) * 3;
            const v = Math.max(data[idx], data[idx + 1], data[idx + 2]);
            if (v <= 26) {
              bgMask[y * w + x] = 1;
            }
          }
        }
      }
    }
  }

  // 5. Compute Euclidean / Manhattan Distance Transform to Background
  const distToBg = new Int16Array(w * h);
  for (let i = 0; i < w * h; i++) {
    distToBg[i] = bgMask[i] === 1 ? 0 : 999;
  }
  // Top-left pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (distToBg[idx] > 0) {
        let minD = distToBg[idx];
        if (x > 0) minD = Math.min(minD, distToBg[idx - 1] + 1);
        if (y > 0) minD = Math.min(minD, distToBg[idx - w] + 1);
        distToBg[idx] = minD;
      }
    }
  }
  // Bottom-right pass
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const idx = y * w + x;
      if (distToBg[idx] > 0) {
        let minD = distToBg[idx];
        if (x < w - 1) minD = Math.min(minD, distToBg[idx + 1] + 1);
        if (y < h - 1) minD = Math.min(minD, distToBg[idx + w] + 1);
        distToBg[idx] = minD;
      }
    }
  }

  // 6. Build RGBA Buffer with Advanced De-fringing and Color Bleed
  const outData = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const oIdx = idx * 4;
      const iIdx = idx * 3;
      const d = distToBg[idx];

      if (d === 0) {
        outData[oIdx] = 0;
        outData[oIdx + 1] = 0;
        outData[oIdx + 2] = 0;
        outData[oIdx + 3] = 0;
      } else if (d >= 2) {
        outData[oIdx] = data[iIdx];
        outData[oIdx + 1] = data[iIdx + 1];
        outData[oIdx + 2] = data[iIdx + 2];
        outData[oIdx + 3] = 255;
      } else {
        // d === 1: Edge transition pixel.
        // Sample interior clean color (d >= 2) to prevent dark premultiplied black halo.
        let sampleR = data[iIdx];
        let sampleG = data[iIdx + 1];
        let sampleB = data[iIdx + 2];
        let found = false;

        for (let rad = 1; rad <= 3 && !found; rad++) {
          for (let dy = -rad; dy <= rad && !found; dy++) {
            for (let dx = -rad; dx <= rad && !found; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nIdx = ny * w + nx;
                if (distToBg[nIdx] >= 2) {
                  sampleR = data[nIdx * 3];
                  sampleG = data[nIdx * 3 + 1];
                  sampleB = data[nIdx * 3 + 2];
                  found = true;
                }
              }
            }
          }
        }

        const v = Math.max(data[iIdx], data[iIdx + 1], data[iIdx + 2]);
        const alpha = Math.round(Math.min(255, Math.max(120, (v / 22.0) * 230)));

        outData[oIdx] = sampleR;
        outData[oIdx + 1] = sampleG;
        outData[oIdx + 2] = sampleB;
        outData[oIdx + 3] = alpha;
      }
    }
  }

  // 7. Component Filtering: Keep strictly the single largest connected component (knife)
  const visited = new Uint8Array(w * h);
  const compId = new Int32Array(w * h);
  compId.fill(-1);
  let currentId = 0;
  const compSizes = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (outData[idx * 4 + 3] > 0 && !visited[idx]) {
        let count = 0;
        const q = [idx];
        visited[idx] = 1;
        compId[idx] = currentId;

        let qHead = 0;
        while (qHead < q.length) {
          const cIdx = q[qHead++];
          count++;
          const cx = cIdx % w;
          const cy = Math.floor(cIdx / w);

          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nIdx = ny * w + nx;
              if (outData[nIdx * 4 + 3] > 0 && !visited[nIdx]) {
                visited[nIdx] = 1;
                compId[nIdx] = currentId;
                q.push(nIdx);
              }
            }
          }
        }
        compSizes.push(count);
        currentId++;
      }
    }
  }

  let maxComp = 0;
  let maxCompSize = 0;
  for (let i = 0; i < compSizes.length; i++) {
    if (compSizes[i] > maxCompSize) {
      maxCompSize = compSizes[i];
      maxComp = i;
    }
  }

  console.log(`  Identified ${compSizes.length} components, largest component has ${maxCompSize} pixels`);

  for (let i = 0; i < w * h; i++) {
    if (compId[i] !== maxComp) {
      outData[i * 4] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
      outData[i * 4 + 3] = 0;
    }
  }

  // 8. Auto-trim empty border padding and export high-fidelity transparent PNG
  await sharp(outData, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .trim({ threshold: 0 })
    .toFile(cfg.dest);

  const meta = await sharp(cfg.dest).metadata();
  console.log(`✓ Saved ${cfg.dest}: ${meta.width}x${meta.height}\n`);
}

for (const k of knives) {
  await processKnifePerfect(k);
}
console.log('All 4 Bespoke Karambit knives processed to absolute perfection!');
