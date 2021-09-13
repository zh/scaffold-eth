// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AwesomeAssets is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    mapping(string => uint256) hashes;
    mapping(uint256 => uint256) forSale;

    event Action(address sender, uint256 tokenId, string action);

    constructor() ERC721("Awesome Assets", "AWEA") {}

    function sellItem(uint256 tokenId, uint256 sellPrice) public onlyOwner {
        require(forSale[tokenId] == 0, "ALREADY FOR SELL"); // only items not already for sale
        require(sellPrice > 0, "ZERO PRICE");
        forSale[tokenId] = sellPrice;
        console.log("for sell: %s", tokenId);
        emit Action(msg.sender, tokenId, "sell");
    }

    function cancelSellItem(uint256 tokenId) public onlyOwner {
        require(forSale[tokenId] > 0, "NOT FOR SELL"); // only items already for sale
        forSale[tokenId] = 0;
        console.log("cancel sell: %s", tokenId);
        emit Action(msg.sender, tokenId, "cancel sell");
    }

    function buyItem(uint256 tokenId) public payable {
        require(forSale[tokenId] > 0, "NOT FOR SELL"); // only items already for sale
        require(msg.value >= forSale[tokenId], "PAY IS NOT ENOUGH");
        forSale[tokenId] = 0;
        console.log("buy: %s for %s -> %s", tokenId, msg.value, msg.sender);
        address payable itemOwner = payable(ownerOf(tokenId));
        _transfer(itemOwner, msg.sender, tokenId);
        itemOwner.transfer(msg.value);
    }

    function price(uint256 tokenId) public view returns (uint256) {
        return forSale[tokenId];
    }

    function mintItem(address to, string memory cid, string memory metadata) public {
        require(hashes[cid] == 0, "ALREADY MINTED");
        _tokenIdCounter.increment();
        uint256 newId = _tokenIdCounter.current();
        hashes[cid] = newId;
        forSale[newId] = 0;
        console.log("%s minted #%d with cid=%s", to, newId, cid);
        _safeMint(to, newId);
        super._setTokenURI(newId, metadata);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
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
