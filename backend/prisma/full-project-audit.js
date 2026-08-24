const fs = require('fs')
const path = require('path')

// Scan all frontend files for API calls and href links
function scanDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        scanDirectory(filePath, fileList)
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(file)) {
      fileList.push(filePath)
    }
  }
  return fileList
}

async function auditFrontend() {
  const frontendDir = path.resolve(__dirname, '../../frontend')
  const backendDir = path.resolve(__dirname, '../../backend/src')

  const frontendFiles = scanDirectory(frontendDir)
  const backendFiles = scanDirectory(backendDir)

  console.log(`Scanning ${frontendFiles.length} frontend files and ${backendFiles.length} backend files...`)

  // 1. Extract all backend controller endpoints
  const backendEndpoints = []
  for (const f of backendFiles) {
    if (f.includes('.controller.ts')) {
      const content = fs.readFileSync(f, 'utf8')
      const controllerMatch = content.match(/@Controller\(['"]?([^'")]*)['"]?\)/)
      const baseRoute = controllerMatch ? controllerMatch[1] : ''
      
      const methodRegex = /@(Get|Post|Put|Patch|Delete)\(['"]?([^'")]*)['"]?\)/g
      let m
      while ((m = methodRegex.exec(content)) !== null) {
        const httpMethod = m[1].toUpperCase()
        const subRoute = m[2]
        const fullRoute = subRoute ? `/${baseRoute}/${subRoute}`.replace(/\/+/g, '/') : `/${baseRoute}`.replace(/\/+/g, '/')
        backendEndpoints.push({
          method: httpMethod,
          route: fullRoute,
          file: path.relative(backendDir, f)
        })
      }
    }
  }

  // 2. Extract all API calls in frontend
  const apiCalls = []
  const deadLinks = []
  const emptyHandlers = []

  for (const f of frontendFiles) {
    const relPath = path.relative(frontendDir, f)
    const content = fs.readFileSync(f, 'utf8')

    // Find api.get, api.post, apiGet, apiPost, fetch
    const apiRegex = /(?:api\.(get|post|put|patch|delete)|api(Get|Post|Put|Patch|Delete)|fetch)\s*(?:<[^>]+>)?\s*\(\s*[`'"]([^`'"]+)[`'"]/g
    let match
    while ((match = apiRegex.exec(content)) !== null) {
      const httpMethod = (match[1] || match[2] || 'GET').toUpperCase()
      const rawPath = match[3]
      if (rawPath.startsWith('http') && !rawPath.includes('localhost') && !rawPath.includes('/api')) {
        continue // external url
      }
      apiCalls.push({
        method: httpMethod,
        path: rawPath,
        file: relPath,
        line: content.substring(0, match.index).split('\n').length
      })
    }

    // Find href="#" or placeholder links
    const hrefRegex = /href\s*=\s*["'{](?:[`'"](#[^`'"]*)[`'"]|\{["'](#[^"']*)["']\})/g
    let hMatch
    while ((hMatch = hrefRegex.exec(content)) !== null) {
      const hash = hMatch[1] || hMatch[2]
      if (hash === '#' || hash === '#!' || hash === 'javascript:void(0)') {
        deadLinks.push({
          file: relPath,
          line: content.substring(0, hMatch.index).split('\n').length,
          link: hash
        })
      }
    }

    // Find empty onClick handlers (e.g. onClick={() => {}} or onClick={() => null})
    const emptyClickRegex = /onClick\s*=\s*\{(?:\(\)\s*=>\s*\{(?:\s*)\}|\(\)\s*=>\s*undefined|\(\)\s*=>\s*null)\}/g
    let eMatch
    while ((eMatch = emptyClickRegex.exec(content)) !== null) {
      emptyHandlers.push({
        file: relPath,
        line: content.substring(0, eMatch.index).split('\n').length
      })
    }
  }

  // 3. Match API calls against backend endpoints
  const unmatchedApiCalls = []
  for (const call of apiCalls) {
    let cleanPath = call.path.replace(/^\/api/, '').replace(/\$\{[^}]+\}/g, ':param').replace(/:[a-zA-Z0-9_]+/g, ':param').split('?')[0]
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath

    // Check if matches any backend endpoint
    const matched = backendEndpoints.some(be => {
      let bRoute = be.route.replace(/:[a-zA-Z0-9_]+/g, ':param')
      if (!bRoute.startsWith('/')) bRoute = '/' + bRoute
      return bRoute === cleanPath || cleanPath.startsWith(bRoute.replace(':param', '')) || bRoute.startsWith(cleanPath.replace(':param', ''))
    })

    if (!matched && !call.path.startsWith('/uploads') && !call.path.startsWith('/api/health') && !call.path.startsWith('/api/auth') && !call.path.startsWith('/api/products/best-sellers')) {
      unmatchedApiCalls.push(call)
    }
  }

  const results = {
    totalBackendEndpoints: backendEndpoints.length,
    totalFrontendApiCalls: apiCalls.length,
    backendEndpointsSample: backendEndpoints.slice(0, 15),
    unmatchedApiCalls,
    deadLinks,
    emptyHandlers
  }

  fs.writeFileSync(path.resolve(__dirname, 'audit-results.json'), JSON.stringify(results, null, 2))
  console.log(`Audit finished! Found ${unmatchedApiCalls.length} unmatched API calls, ${deadLinks.length} dead '#' links, ${emptyHandlers.length} empty click handlers.`)
}

auditFrontend().catch(console.error)
