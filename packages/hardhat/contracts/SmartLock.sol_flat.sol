// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _setOwner(newOwner);
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract SmartLock is Ownable {
    bool private _locked;
    bool private _for_rent;
    address private _renter;
    // deadline = now + period parameter
    uint256 private _deadline;
    // price per hour;
    uint256 private _price;

    event State(address user, string state);

    constructor() {
        _for_rent = true;
        _locked = false;
        _deadline = block.timestamp;
        _price = 0;
    }

    // ownership related functions

    modifier onlyRenter() {
        require(
            _renter == msg.sender,
            "SmartLock: only renter can call this function"
        );
        // This _; is not a TYPO, It is important for the compiler;
        _;
    }

    modifier beforeDeadline() {
        uint256 _now = block.timestamp;
        require(
            _now < _deadline,
            "SmartLock: only renter can call this function"
        );
        // This _; is not a TYPO, It is important for the compiler;
        _;
    }

    function forRent() external view returns (bool) {
        return _for_rent;
    }

    function rentBy() external view returns (address) {
        return _renter;
    }

    function _rent(address _user, uint256 _period) internal {
        require(_price > 0, "Smart Lock: cannot rent for nothing");
        require(
            _period >= 5 minutes && _period <= 24 hours,
            "Smart Lock: rent between 5 minutes and 24 hours"
        );
        uint256 _now = block.timestamp;
        if (_now >= _deadline) {
            _for_rent = true;
        }
        require(_for_rent == true, "Smart Lock: already rent");
        _for_rent = false;
        _renter = _user;
        setState(false);
        _deadline = _now + _period;
    }

    function _cancel() internal {
        require(_for_rent == false, "Smart Lock: still not rent");
        _reset();
    }

    function _reset() internal {
        _for_rent = true;
        _renter = address(0);
        setState(false);
        _deadline = block.timestamp;
    }

    function setPrice(uint256 _price_per_hour) external onlyOwner {
        require(_for_rent == true, "Smart Lock: no price changes when rent");
        _price = _price_per_hour;
    }

    function price() external view returns (uint256) {
        return _price;
    }

    function setRenter(address _user, uint256 _period) external onlyOwner {
        _rent(_user, _period);
    }

    function setForRent() external onlyOwner {
        uint256 _now = block.timestamp;
        if (_now >= _deadline) {
            _reset();
        }
    }

    function rent(uint256 _period) external payable {
        require(
            msg.value >= (_price * _period) / 3600, // price_per_hour * period_in_hours
            "Smart Lock: not enough for rent"
        );
        _rent(msg.sender, _period);
    }

    function cancel() external onlyRenter {
        _cancel();
    }

    function timeLeft() public view returns (uint256) {
        uint256 _now = block.timestamp;
        if (_now >= _deadline || _for_rent == true) {
            return 0;
        }
        return _deadline - _now;
    }

    // hardware related functions

    function locked() external view returns (bool) {
        return _locked;
    }

    function setState(bool _state) internal {
        _locked = _state;
        if (_locked == true) {
            emit State(msg.sender, "close");
        } else {
            emit State(msg.sender, "open");
        }
    }

    function open() external onlyRenter beforeDeadline {
        setState(false);
    }

    function close() external onlyRenter beforeDeadline {
        setState(true);
    }

    function balanceOf() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "amount of ETH must be > 0");
        uint256 exampleBalance = address(this).balance;
        require(exampleBalance >= amount, "Contract does not own enough funds");
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Funds transfer failed");
    }
}
