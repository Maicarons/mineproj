#!/usr/bin/env node
import { main } from './commands';

process.exitCode = await main(process.argv.slice(2));
