export default function formatUri(uri) {
  const ipfsGateway = "https://ipfs.io/ipfs/";
  const allowedProtocols = ["ftp", "http", "https", "ipfs"];
  if (!uri || uri === "") return "";
  if (uri.startsWith("Qm")) return `${ipfsGateway}${uri}`;
  if (uri.startsWith("http")) return uri;
  const schema = uri.split("://");
  if (schema[0] || allowedProtocols.includes(schema[0])) {
    if (schema[0] === "ipfs") return `${ipfsGateway}${schema[1]}`;
    // TODO: support for other protocols (schema[0])
  }
  return uri;
}
