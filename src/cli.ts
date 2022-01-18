#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
    // Use the commands directory to scaffold.
    .commandDir('commands')
    // Useful aliases.
    .alias({ h: 'help' })
    .argv;
