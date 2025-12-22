// 轻量级可复现 RNG（xorshift32），用于大量 mock 数据的“按需生成”
export function createSeededRng(seed: number) {
  let x = seed | 0
  return () => {
    // xorshift32
    x ^= x << 13
    x ^= x >> 17
    x ^= x << 5
    // 转成 [0, 1)
    return ((x >>> 0) & 0xffffffff) / 0x100000000
  }
}

export function pickOne<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}


