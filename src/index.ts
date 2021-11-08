import fs from 'fs'
import path from 'path'
import {
  providers,
  BigNumber,
  Contract,
} from 'ethers'

const ABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi.json'), 'utf8'))

import {
  Bowie,
} from './Bowie'

import {
  ETH_STORAGE_SLOT_BYTES,
} from './constants'

export interface DownloadConfig {
  // what eth rpc server to connect to (default: infura)
  rpcUrl: string,

  // write the file to here (default: stdout)
  fileName: string,

  // the token contract address
  contractAddress: string,
}

const getFilePath = (filename: string): string => {
  let resolvedPath = path.resolve(filename)
  if(resolvedPath.indexOf('/') !== 0) {
    resolvedPath = path.resolve(process.cwd(), filename)
  }
  const folder = path.dirname(resolvedPath)
  if(!fs.existsSync(folder)) {
    throw new Error(`folder does not exist to write image ${folder}`)
  }
  if(fs.existsSync(resolvedPath)) {
    throw new Error(`output file already exists ${resolvedPath}`)
  }
  return resolvedPath
}

const getContract = (rpcUrl: string, contractAddress: string): Bowie => {
  const provider = new providers.JsonRpcProvider(rpcUrl)
  const contract = new Contract(contractAddress, ABI, provider)
  return contract as Bowie
}

export const hexToNumbers = (hex: string): number[] => {
  const data = hex.replace(/^0x/, '')
  const numbers: number[] = []
  for(var i = 0; i < data.length; i += 2) {
    const byte = data[i] + data[i+1]
    numbers.push(parseInt(byte, 16))
  }
  return numbers
}

export const decodeFile = (data: BigNumber[], filesize: BigNumber): Uint8Array => {
  const lastSlotSize = (filesize.toNumber() - ((data.length - 1) * ETH_STORAGE_SLOT_BYTES))
  let numbers: number[] = data.reduce<number[]>((all, storageSlot, slotIndex) => {
    let hexString = storageSlot.toHexString().replace(/^0x/, '')
    const slotBytes = slotIndex == data.length - 1 ?
      lastSlotSize :
      ETH_STORAGE_SLOT_BYTES
    while(hexString.length < slotBytes * 2) {
      hexString = '00' + hexString
    }
    return all.concat(hexToNumbers(hexString))
  }, [])

  return Uint8Array.from(numbers)
}

export const downloadImage = async (config: DownloadConfig): Promise<boolean> => {

  if(!config.fileName) throw new Error(`--filename required`)
  if(!config.rpcUrl) throw new Error(`--url required`)
  if(!config.contractAddress) throw new Error(`--contract required`)

  const filepath = getFilePath(config.fileName)
  const contract = getContract(config.rpcUrl, config.contractAddress)
  const fileSize = await contract.imageSize()

  const batchData: BigNumber[][] = []
  const batchCount = (await contract.imageBatches()).toNumber()

  if(batchCount <= 0) throw new Error(`no image batches were found`)
  for(let i=0; i<batchCount; i++) {
    const batch = await contract.imageData(BigNumber.from(i))
    batchData.push(batch)
    console.error(`downloaded image slice ${i}`)
  }

  const imageData = batchData.reduce((all, batch) => {
    return all.concat(batch)
  }, [])

  const image = decodeFile(imageData, fileSize)

  fs.writeFileSync(filepath, image)

  console.error(`written image to ${config.fileName}`)

  return true
}
