// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DEX is Pausable, Ownable {
    using SafeMath for uint256;
    IERC20 token;

    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    event Action(address sender, string action, uint256 tokens, uint256 price);

    constructor(address _addr) {
        token = IERC20(_addr);
    }

    function init(uint256 _tokens) external payable returns (uint256) {
        require(totalLiquidity == 0, "DEX:init - already has liquidity");
        totalLiquidity = msg.value;
        liquidity[msg.sender] = totalLiquidity;
        require(token.transferFrom(msg.sender, address(this), _tokens));
        return totalLiquidity;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function price(
        uint256 _amount,
        uint256 _reserve,
        uint256 _output
    ) public pure returns (uint256) {
        uint256 amountWithFee = _amount.mul(997);
        uint256 numerator = amountWithFee.mul(_output);
        uint256 denominator = _reserve.mul(1000).add(amountWithFee);
        return numerator / denominator;
    }

    function buyToken() external payable whenNotPaused returns (uint256) {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokensBought = price(
            msg.value,
            address(this).balance.sub(msg.value),
            tokenReserve
        );
        emit Action(msg.sender, "buy", tokensBought, msg.value);
        require(token.transfer(msg.sender, tokensBought));
        return tokensBought;
    }

    function sellToken(uint256 _tokens)
        external
        whenNotPaused
        returns (uint256)
    {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethBought = price(_tokens, tokenReserve, address(this).balance);
        emit Action(msg.sender, "sell", _tokens, ethBought);
        payable(msg.sender).transfer(ethBought);
        require(token.transferFrom(msg.sender, address(this), _tokens));
        return ethBought;
    }

    function deposit() external payable whenNotPaused returns (uint256) {
        uint256 ethReserve = address(this).balance.sub(msg.value);
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 tokenAmount = (msg.value.mul(tokenReserve) / ethReserve).add(1);
        uint256 liquidityMinted = msg.value.mul(totalLiquidity) / ethReserve;
        liquidity[msg.sender] = liquidity[msg.sender].add(liquidityMinted);
        totalLiquidity = totalLiquidity.add(liquidityMinted);
        emit Action(msg.sender, "deposit", tokenAmount, liquidityMinted);
        require(token.transferFrom(msg.sender, address(this), tokenAmount));
        return liquidityMinted;
    }

    function withdraw(uint256 _amount)
        external
        whenNotPaused
        returns (uint256, uint256)
    {
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethAmount = _amount.mul(address(this).balance) / totalLiquidity;
        uint256 tokenAmount = _amount.mul(tokenReserve) / totalLiquidity;
        require(liquidity[msg.sender] > ethAmount, "Liquidity is not enough");
        liquidity[msg.sender] = liquidity[msg.sender].sub(ethAmount);
        totalLiquidity = totalLiquidity.sub(ethAmount);
        emit Action(msg.sender, "withdraw", tokenAmount, ethAmount);
        payable(msg.sender).transfer(ethAmount);
        require(token.transfer(msg.sender, tokenAmount));
        return (ethAmount, tokenAmount);
    }
}
