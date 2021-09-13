pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
* @title Stacker Contract
* @author scaffold-eth
* @notice A contract that allow users to stack ETH
*/
contract Staker is Ownable {
    // External contract that will old stacked funds
    ExampleExternalContract public externalContract;

    // Staking threshold
    uint256 public constant threshold = 1 ether;
    // deadline = now + period parameter
    uint256 public deadline;
    // total amount staked
    uint256 private totalAmount;

    mapping(address => uint256) public balances;

    event Stake(address indexed sender, uint256 amount);

    /**
     * @notice Contract Constructor
     * @param externalContractAddress Address of the external contract that will hold stacked funds
     */
    constructor(address externalContractAddress) {
        externalContract = ExampleExternalContract(externalContractAddress);
        deadline = block.timestamp + 1 days;
        totalAmount = 0 ether;
    }

    function balanceOf() public view returns (uint256) {
        return totalAmount;
    }

    /**
     * @notice Stake method that update the user's balance
     */
    function stake() public payable {
        balances[msg.sender] += msg.value;
        emit Stake(msg.sender, msg.value);
        totalAmount += msg.value;
    }

    /**
     * @notice Users can withdraw BEFORE the deadline and below treshold
     * @param user address payable User to receive the funds
     */
    function withdraw(address payable user) public {
        require(msg.sender == user, "Only own funds");
        require(balances[user] > 0, "Zero balance");
        require(address(this).balance < threshold, "Under threshold");
        require(block.timestamp < deadline, "Deadline reached");
        uint256 amount = balances[user];
        balances[user] = 0;
        totalAmount -= amount;
        user.transfer(amount);
    }
}
