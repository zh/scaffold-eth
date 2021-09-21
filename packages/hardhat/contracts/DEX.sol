// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {

  using SafeMath for uint256;
  IERC20 token;

  uint256 public totalLiquidity;
  mapping (address => uint256) public liquidity;

  event Action(address sender, string action, uint256 tokens, uint256 price);

  constructor(address token_addr) {
    token = IERC20(token_addr);
  }

  function init(uint256 tokens) public payable returns (uint256) {
    require(totalLiquidity==0, "DEX:init - already has liquidity");
    totalLiquidity = msg.value;
    liquidity[msg.sender] = totalLiquidity;
    require(token.transferFrom(msg.sender, address(this), tokens));
    return totalLiquidity;
  }

  function price(uint256 input_amount, uint256 input_reserve, uint256 output_reserve) public pure returns (uint256) {
    uint256 input_amount_with_fee = input_amount.mul(997);
    uint256 numerator = input_amount_with_fee.mul(output_reserve);
    uint256 denominator = input_reserve.mul(1000).add(input_amount_with_fee);
    return numerator / denominator;
  }

  function bchToToken() public payable returns (uint256) {
    uint256 token_reserve = token.balanceOf(address(this));
    uint256 tokens_bought = price(msg.value, address(this).balance.sub(msg.value), token_reserve);
    console.log("%s bought %s tokens for %s bch", msg.sender, tokens_bought, msg.value);
    require(token.transfer(msg.sender, tokens_bought));
    emit Action(msg.sender, "buy", tokens_bought, msg.value);
    return tokens_bought;
  }

  function tokenToBch(uint256 tokens) public returns (uint256) {
    uint256 token_reserve = token.balanceOf(address(this));
    uint256 bch_bought = price(tokens, token_reserve, address(this).balance);
    payable(msg.sender).transfer(bch_bought);
    console.log("%s sell %s tokens for %s bch", msg.sender, tokens, bch_bought);
    require(token.transferFrom(msg.sender, address(this), tokens));
    emit Action(msg.sender, "sell", tokens, bch_bought);
    return bch_bought;
  }

  function deposit() public payable returns (uint256) {
    uint256 bch_reserve = address(this).balance.sub(msg.value);
    uint256 token_reserve = token.balanceOf(address(this));
    uint256 token_amount = (msg.value.mul(token_reserve) / bch_reserve).add(1);
    uint256 liquidity_minted = msg.value.mul(totalLiquidity) / bch_reserve;
    console.log("%s deposited %s tokens and %s bch", msg.sender, token_amount, liquidity_minted);
    liquidity[msg.sender] = liquidity[msg.sender].add(liquidity_minted);
    totalLiquidity = totalLiquidity.add(liquidity_minted);
    console.log("[liquidity] user: %s, total: %s", liquidity[msg.sender], totalLiquidity);
    require(token.transferFrom(msg.sender, address(this), token_amount));
    emit Action(msg.sender, "deposit", token_amount, liquidity_minted);
    return liquidity_minted;
  }

  function withdraw(uint256 amount) public returns (uint256, uint256) {
    uint256 token_reserve = token.balanceOf(address(this));
    uint256 bch_amount = amount.mul(address(this).balance) / totalLiquidity;
    uint256 token_amount = amount.mul(token_reserve) / totalLiquidity;
    console.log("[withdraw] user: %s, bch: %s", liquidity[msg.sender], bch_amount);
    require(liquidity[msg.sender] > bch_amount, "Liquidity is not enough");
    liquidity[msg.sender] = liquidity[msg.sender].sub(bch_amount);
    totalLiquidity = totalLiquidity.sub(bch_amount);
    payable(msg.sender).transfer(bch_amount);
    require(token.transfer(msg.sender, token_amount));
    console.log("%s withdraw %s tokens and %s bch", msg.sender, token_amount, bch_amount);
    console.log("[liquidity] user: %s, total: %s", liquidity[msg.sender], totalLiquidity);
    emit Action(msg.sender, "withdraw", token_amount, bch_amount);
    return (bch_amount, token_amount);
  }
}
