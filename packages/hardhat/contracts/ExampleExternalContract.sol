pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";

contract ExampleExternalContract is Ownable {

    bool public completed;

    function complete() external payable {
        completed = true;
    }

    function reset() external onlyOwner {
        completed = false;
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "amount of ETH must be > 0");
        uint256 exampleBalance = address(this).balance;
        require(exampleBalance >= amount, "Vendor does not own enough ETH");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "ETH transfer failed");
    }
}
