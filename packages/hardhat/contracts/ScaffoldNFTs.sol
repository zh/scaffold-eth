// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ScaffoldNFTs is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(bytes32[] memory assetsForSale) ERC721("Scaffold NFTs", "SNFT") {
        for(uint256 i=0; i<assetsForSale.length; i++) {
            forSale[assetsForSale[i]] = true;
        }
    }

    //this marks an item in IPFS as "forsale"
    mapping (bytes32 => bool) public forSale;
    //this lets you look up a token by the uri (assuming there is only one of each uri for now)
    mapping (bytes32 => uint256) public uriToTokenId;

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function safeMint(address to, string memory cid) public {
        bytes32 uriHash = keccak256(abi.encodePacked(cid));
        //make sure they are only minting something that is marked "forsale"
        require(forSale[uriHash],"NOT FOR SALE");
        forSale[uriHash] = false;
        console.log("Mint %s for %s", cid, to);

        _tokenIdCounter.increment();
        _safeMint(to, _tokenIdCounter.current());
        super._setTokenURI(_tokenIdCounter.current(), cid);
        uriToTokenId[uriHash] = _tokenIdCounter.current();
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
