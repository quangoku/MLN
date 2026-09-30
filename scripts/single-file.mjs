// Gộp bản build trong dist/ thành một file HTML duy nhất (JS + CSS nhúng thẳng vào trang),
// để mở được bằng cách nhấp đúp (file://) mà không cần web server.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
let html = readFileSync(join(dist, 'index.html'), 'utf8')

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g, (_, file) => {
  const css = readFileSync(join(dist, file), 'utf8')
  return `<style>\n${css}\n</style>`
})

html = html.replace(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/g, (_, file) => {
  // "</script" trong mã JS sẽ đóng thẻ sớm → thoát ký tự
  const js = readFileSync(join(dist, file), 'utf8').replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})

if (/src="\.\/assets|href="\.\/assets/.test(html)) {
  console.error('Còn tham chiếu tới assets/ chưa được nhúng:', readdirSync(join(dist, 'assets')))
  process.exit(1)
}

writeFileSync('PhiloVerse.html', html)
console.log(`PhiloVerse.html: ${(html.length / 1024).toFixed(0)} KB`)
