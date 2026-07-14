export function getProductImage(slug: string): string | null {
  const map: Record<string, string> = {
    'shell-helix-ultra-5w40': '/img/products/shell-helix-ultra-5w40.png',
    'total-quartz-7000-10w40': '/img/products/total-quartz-7000-10w40.png',
    'yacco-lube-di-0w20-c6': '/img/products/yacco-lube-di-0w20-c6.png',
    'motul-300v-10w40': '/img/products/motul-300v-10w40.png',
    'castrol-edge-5w30-ll': '/img/products/castrol-edge-5w30-ll.png',
    'liqui-moly-ceratec': '/img/products/liqui-moly-ceratec.png',
    'huile-standard-v1-15w40': '/img/products/huile-standard-v1-15w40.png',
  }
  return map[slug] ?? null
}