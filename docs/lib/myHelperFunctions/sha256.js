/* sha256-sync.js  —  single‑file, synchronous SHA‑256 (UTF‑8)  */

/* ===== Helper: rotate‑right 32‑bit word ===== */
const ROTR = (n, x) => (x >>> n) | (x << (32 - n));

/* ===== SHA‑256 constants ===== */
const K = Uint32Array.from([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
]);

/* ===== Core hash ===== */
function sha256Hex(text) {
  /* -- Step 1: UTF‑8 encode and build 32‑bit word array -- */
  const bytes = new TextEncoder().encode(text);
  const bitLen = bytes.length * 8;
  const words = new Uint32Array(((bitLen + 64 >> 9) << 4) + 16);      // padded size
  for (let i = 0; i < bytes.length; ++i) {
    words[i >> 2] |= bytes[i] << (24 - (i & 3) * 8);
  }
  words[bitLen >> 5] |= 0x80 << (24 - bitLen % 32);                   // append 1‑bit
  words[words.length - 1] = bitLen;                                   // append length

  /* -- Step 2: Initialise hash state -- */
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
      h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const W = new Uint32Array(64);
  /* -- Step 3: Process 512‑bit chunks -- */
  for (let i = 0; i < words.length; i += 16) {
    W.set(words.subarray(i, i + 16));
    for (let t = 16; t < 64; ++t) {
      const s0 = ROTR(7, W[t - 15]) ^ ROTR(18, W[t - 15]) ^ (W[t - 15] >>> 3);
      const s1 = ROTR(17, W[t - 2]) ^ ROTR(19, W[t - 2]) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; ++t) {
      const Σ1 = ROTR(6, e) ^ ROTR(11, e) ^ ROTR(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + Σ1 + ch + K[t] + W[t]) >>> 0;
      const Σ0 = ROTR(2, a) ^ ROTR(13, a) ^ ROTR(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (Σ0 + maj) >>> 0;

      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;  h1 = (h1 + b) >>> 0;  h2 = (h2 + c) >>> 0;  h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;  h5 = (h5 + f) >>> 0;  h6 = (h6 + g) >>> 0;  h7 = (h7 + h) >>> 0;
  }

  /* -- Step 4: Produce lowercase hex string -- */
  const toHex = n => n.toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) +
         toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

function sha256Hex32(text) {
  return sha256Hex(text).slice(0, 32);
}
