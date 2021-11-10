const { BufferList } = require("bl");

const ipfsAPI = require("ipfs-http-client");
export const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

export const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    return content;
  }
};

export const getMetadata = async (id, uri, owner) => {
  const ipfsHash = uri.split("/").pop();
  const jsonManifestBuffer = await getFromIPFS(ipfsHash);
  try {
    const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
    return { id, uri, owner, ...jsonManifest };
  } catch (e) {
    console.log(e);
  }
  return null;
};

export const addToIPFS = async fileToUpload => {
  const result = await ipfs.add(fileToUpload);
  return result;
};
