pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";

contract SmartLock is Ownable {
    bool private _locked;
    bool private _for_rent;
    address private _renter;
    // deadline = now + period parameter
    uint256 private _deadline;

    event State(address user, string state);

    constructor() {
        _for_rent = true;
        _locked = false;
        _deadline = block.timestamp;
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
        require(_period <= 24 hours, "Smart Lock: more then 24 hours rent");
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

    function setRenter(address _user, uint256 _period) external onlyOwner {
        _rent(_user, _period);
    }

    function setForRent() external onlyOwner {
        uint256 _now = block.timestamp;
        if (_now >= _deadline) {
            _reset();
        }
    }

    function rent(uint256 _period) external {
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
}
