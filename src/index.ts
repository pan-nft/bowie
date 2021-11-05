export interface DownloadConfig {
  // what eth rpc server to connect to (default: infura)
  rpcUrl: string,

  // write the file to here (default: stdout)
  fileName: string,

  // the token contract address
  contractAddress: string,
}

export async function downloadImage (config: DownloadConfig): Promise<boolean> {
  console.log('--------------------------------------------')
  console.dir(config)
  return true
}
