// @ts-check
/*
 * This script fixes TypeScript's compiled output when using the root-alias import (~).
 *
 * For example:
 *
 * `import { x } from '~/module'`
 *
 * compiles into something like:
 *
 * `const x_1 = require('~/module')`
 *
 * This will fail to resolve at runtime. This script fixes that to something like:
 *
 * `const x_1 = require('../../module')`
 *
 * with the correct number of dots.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Crawl a directory recursively, returning file info.
 * @param {string} dir The path of the directory to scan (relative or absolute).
 * @param {number} depth The number of directories above this level of the crawl.
 * @returns {Array<[ string, number ]>} For each file: its path and depth from root as a tuple.
 */
function crawlDir(dir, depth = 0) {
  /** @type Array<[ string, number ]> */
  const empty = []
  // For each entity in this directory...
  return readdirSync(dir).reduce((acc, curr) => {
    const currPath = join(dir, curr)
    if (statSync(currPath).isDirectory()) {
      // Directory: recurse and accumulate result.
      acc.concat(crawlDir(currPath, depth + 1))
    } else {
      // File: accumulate it.
      acc.push([currPath, depth])
    }
    return acc
  }, empty)
}

/** Regex for all root-alias imports. */
const regex = /require\("~\//g

/**
 * Fixes all root-alias imports in a file.
 * @param {[string, number]} fileInfo file path and its depth from root
 */
function fixImports([file, depth]) {
  const text = readFileSync(file, 'utf-8')
  const fix = text.match(regex).length > 0
  if (fix) {
    const dots = depth === 0 ? './' : '../'.repeat(depth)
    const next = text.replace(regex, `require("${dots}`)
    writeFileSync(file, next)
  }
  return fix
}

function main() {
  // Look in `dist` for js files.
  const jsFiles = crawlDir('dist').filter(([file, _]) => file.endsWith('.js'))
  // Fix imports.
  const changed = jsFiles.filter(fixImports)
  // Print results.
  if (changed.length > 0) {
    const s = changed.length > 1 ? 's' : ''
    console.log(`Fixed ${changed.length} file${s} (of ${jsFiles.length}).`)
  } else {
    console.log(`No files modified (of ${jsFiles.length}).`)
  }
}

try {
  main()
} catch (error) {
  console.error(error.stack)
}
