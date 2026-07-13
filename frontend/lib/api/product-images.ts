export function getProductImage(slug: string): string | null {
  const map: Record<string, string> = {
    'shell-helix-ultra-5w40': '/img/products/shell-helix-ultra-5w40.jpg',
    'total-quartz-7000-10w40': '/img/products/total-quartz-7000-10w40.jpg',
    'yacco-lube-di-0w20-c6': '/img/products/yacco-lube-di-0w20-c6.jpg',
    'motul-300v-10w40': '/img/products/motul-300v-10w40.jpg',
    'castrol-edge-5w30-ll': '/img/products/castrol-edge-5w30-ll.jpg',
    'liqui-moly-ceratec': '/img/products/liqui-moly-ceratec.jpg',
    'huile-standard-v1-15w40': '/img/products/huile-standard-v1-15w40.jpg',
  }
  return map[slug] ?? null
}