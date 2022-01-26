// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AwesomeAssets is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    Ownable
{
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    string baseURI;

    mapping(string => uint256) private hashes;
    mapping(uint256 => uint256) public forSale;

    event Action(address sender, uint256 tokenId, string action, uint256 price);

    constructor() ERC721("Awesome Assets", "AWEA") {
        baseURI = "https://ipfs.io/ipfs/";
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory newURI) external onlyOwner {
        baseURI = newURI;
    }

    function sellItem(uint256 tokenId, uint256 sellPrice) external {
        require(forSale[tokenId] == 0, "ALREADY FOR SELL"); // only items not already for sale
        require(sellPrice > 0, "ZERO PRICE");
        require(msg.sender == ownerOf(tokenId), "NOT OWNER");
        emit Action(msg.sender, tokenId, "sell", sellPrice);
        forSale[tokenId] = sellPrice;
    }

    function cancelSellItem(uint256 tokenId) external {
        require(forSale[tokenId] > 0, "NOT FOR SELL"); // only items already for sale
        require(msg.sender == ownerOf(tokenId), "NOT OWNER");
        emit Action(msg.sender, tokenId, "cancel", forSale[tokenId]);
        forSale[tokenId] = 0;
    }

    function buyItem(uint256 tokenId) external payable {
        require(forSale[tokenId] > 0, "NOT FOR SELL"); // only items already for sale
        require(forSale[tokenId] == msg.value, "WRONG PRICE");
        forSale[tokenId] = 0;
        address payable itemOwner = payable(ownerOf(tokenId));
        (bool sent, ) = itemOwner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        _transfer(itemOwner, msg.sender, tokenId);
        emit Action(msg.sender, tokenId, "buy", msg.value);
    }

    function price(uint256 tokenId) external view returns (uint256) {
        return forSale[tokenId];
    }

    function lastId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function mintItem(
        address to,
        string memory cid, // media CID - uniqness check
        string memory metadata // JSON metadata hash
    ) external {
        require(hashes[cid] == 0, "ALREADY MINTED");
        _tokenIdCounter.increment();
        uint256 newId = _tokenIdCounter.current();
        hashes[cid] = newId;
        forSale[newId] = 0;
        _safeMint(to, newId);
        super._setTokenURI(newId, metadata);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
