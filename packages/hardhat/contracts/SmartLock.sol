// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Ownable.sol";
import "./Rentable.sol";

/**
 * @notice SmartLock is a contract for rent assets with lock/unlock properties
 * (cars, bikes, rooms, lockers etc.)
 */
contract SmartLock is Ownable, Rentable {
    /**
     * @notice initial deposit and price per hour need for rent
     */
    uint256 private _deposit;
    uint256 private _price;

    bool private _rented;
    bool private _rentable;

    /**
     * @notice lock state
     */
    bool private _locked;

    /**
     * @notice lock renter
     */
    address private _renter;
    uint256 private _rent_index;

    /**
     * @notice Events are created below.
     */
    event Open();
    event Close();

    /**
     * @notice only renter allowed
     */
    modifier onlyRenter() {
        require(
            _renter == msg.sender,
            "SmartLock: only renter can call this function"
        );
        // This _; is not a TYPO, It is important for the compiler;
        _;
    }

    /**
     * @notice constructor will be triggered when we create the Smart contract
     * _name = name of the smart lock
     */
    constructor() {
        _deposit = 0;
        _price = 0;
        _rented = false;
        _rentable = false;
        _locked = false;
    }

    /**
     * @notice getOwner just calls Ownables owner function.
     * returns owner of the token
     *
     */
    function getOwner() external view returns (address) {
        return owner();
    }

    /**
     * @notice rented will return is the lock for rent or already rented
     */
    function rented() external view returns (bool) {
        return _rented;
    }

    /**
     * @notice rentable will return is the lock available for renting
     */
    function rentable() external view returns (bool) {
        return _rentable;
    }

    /**
     * @notice return current renter
     */
    function renter() external view returns (address) {
        return _renter;
    }

    /**
     * @notice return the initial deposit needed
     */
    function initialDeposit() external view returns (uint256) {
        return _deposit;
    }

    /**
     * @notice return the price per hour
     */
    function price() external view returns (uint256) {
        return _price;
    }

    /**
     * @notice return lock state
     */
    function locked() external view returns (bool) {
        return _locked;
    }

    /**
     * @notice owner can set lock state
     */
    function setState(bool _state) external onlyRenter {
        _locked = _state;
        if (_state == true) {
            emit Close();
        } else {
            emit Open();
        }
    }

    /**
     * @notice for calls from external contracts
     */
    function open() external onlyRenter {
        _locked = false;
        emit Open();
    }

    function close() external onlyRenter {
        _locked = true;
        emit Close();
    }

    /**
     * @notice owner can declare asset available or not for renting
     */
    function setRentable(bool _available) external onlyOwner {
        require(
            _rented == false,
            "SmartLock: Cannot change rentable on rented asset"
        );
        _rentable = _available;
    }

    /**
     * @notice owner can set initial deposit needed
     */
    function setDeposit(uint256 new_deposit) external onlyOwner {
        require(
            _rented == false,
            "SmartLock: Cannot change deposit on rented asset"
        );
        _deposit = new_deposit;
    }

    /**
     * @notice owner can set price per hour needed
     */
    function setPrice(uint256 new_price) external onlyOwner {
        require(
            _rented == false,
            "SmartLock: Cannot change price on rented asset"
        );
        _price = new_price;
    }

    /**
     * @notice Declare some lock for rent
     */
    function forRent(uint256 new_deposit, uint256 new_price)
        external
        onlyOwner
    {
        require(
            _rented == false,
            "SmartLock: Cannot declare for rent already rented asset"
        );
        _rentable = true;
        _deposit = new_deposit;
        _price = new_price;
    }

    /**
     * @notice Rent smart lock
     */
    function rent(uint256 initial_deposit) external {
        require(
            _deposit > 0 && _price > 0,
            "SmartLock: Cannot rent for nothing"
        );
        require(
            _rented == false,
            "SmartLock: Cannot rent already rented asset"
        );
        require(_rentable == true, "SmartLock: Cannot rent non-rentable asset");
        require(
            initial_deposit >= _deposit,
            "SmartLock: Initial deposit is not enough"
        );
        bool hasRent = hasRent(msg.sender);
        require(hasRent == false, "SmartLock: Cannot rent twice same asset");
        _renter = msg.sender;
        _rented = true;
        _rentable = false;
        _rent(initial_deposit, _price);
    }

    /**
     * @notice cancelRent is used to cancel rents from the account holder
     * and return the deposit remainer after costs calculations
     */
    function cancelRent() external onlyRenter returns (uint256) {
        _rented = false;
        _renter = address(0);
        return _cancelRent(0);
    }

    /**
     * @notice payRent is used to pay for rents
     * and return the current deposit after costs calculations
     */
    function payRent(uint256 _amount) external onlyRenter returns (uint256) {
        return _payRent(0, _amount);
    }

    /**
     * @notice paid report if the asset still have deposit left
     */
    function renterDeposit() external view returns (uint256) {
        if (_renter == address(0)) {
            return 0;
        } else {
            RentHistory memory history = _rentHistory(_renter);
            return history.deposit;
        }
    }

    /**
     * @notice Owner can see rent history
     *
     */
    function rentHistory(address some_renter)
        external
        view
        returns (RentHistory memory)
    {
        return _rentHistory(some_renter);
    }
}
