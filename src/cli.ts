#!/usr/bin/env node

import program from 'commander'

import {
  INFURA_RPC_URL,
  IMAGE_FILENAME,
  CONTRACT_ADDRESS,
} from './constants'

import { downloadImage } from './index'
 
program
  .version('1.0.0')
  .option('-u, --url <url>', `The ethereum RPC URL to connect to`, INFURA_RPC_URL)
  .option('-f, --filename <filename>', `The file path to write to`, IMAGE_FILENAME)
  .option('-c, --contract <contract>', `The token contract to read from`, CONTRACT_ADDRESS)
  .parse(process.argv)

//console.dir(program)
downloadImage({
  rpcUrl: program.url,
  fileName: program.filename,
  contractAddress: program.contract,
})
  .then(result => {
  
  })
  .catch(err => {
    console.error(err.toString())
    process.exit(1)
  })
