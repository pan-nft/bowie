import test from 'ava'
import fs from 'fs'
import crypto from 'crypto'

import {
  INFURA_RPC_URL,
  IMAGE_FILENAME,
  CONTRACT_ADDRESS,
  IMAGE_BYTES,
  IMAGE_SHA256,
} from './constants'

import { downloadImage } from './index'

test.before(async t => {
  console.log('Starting tests!')
})

test('can download the image', async t => {

  const TEST_FILE = `/tmp/bowie_test.jpg`

  if(fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE)
  }

  let result = await downloadImage({
    rpcUrl: INFURA_RPC_URL,
    fileName: TEST_FILE,
    contractAddress: CONTRACT_ADDRESS,
  })

  t.true(result)
  const stat = fs.statSync(TEST_FILE)
  t.true(stat.size == IMAGE_BYTES)
  const hash = crypto.createHash('sha256').update(fs.readFileSync(TEST_FILE)).digest('hex')
  t.true(hash == IMAGE_SHA256)  
})
