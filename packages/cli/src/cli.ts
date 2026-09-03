#!/usr/bin/env node
import { VERSION } from '@mineproj/core'

function main(argv: string[]): void {
  const [cmd] = argv
  const commands = new Set(['dev', 'build', 'audit'])
  if (cmd && commands.has(cmd)) {
    console.log(`mineproj: command '${cmd}' is not implemented yet (M0 pending).`)
    return
  }
  console.log(`mineproj v${VERSION}`)
  console.log('Usage: mineproj <dev|build|audit>')
}

main(process.argv.slice(2))
