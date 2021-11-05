import test from 'ava'

import {
  INFURA_RPC_URL,
  IMAGE_FILENAME,
  CONTRACT_ADDRESS,
} from './constants'
import { downloadImage } from './index'

test.before(async t => {
  console.log('Starting tests!')
})

test('can download the image', async t => {

  let result = await downloadImage({
    rpcUrl: INFURA_RPC_URL,
    fileName: IMAGE_FILENAME,
    contractAddress: CONTRACT_ADDRESS,
  })

  t.true(result)
})
