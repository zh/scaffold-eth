// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @notice Rentable is a contract who is ment to be inherited by other contract
 * that wants Rental capabilities
 */
contract Rentable {
    /**
     * @notice
     * RentHistory is a struct that is used to contain all rents performed by a certain account
     */
    struct RentHistory {
        bool has_rent;
        uint256 deposit;
        Rent[] rents;
    }

    /**
     * @notice Constructor since this contract is not ment to be used without inheritance
     * push once to renters for it to work proplerly
     */
    constructor() {
        // This push is needed so we avoid index 0 causing bug of index-1
        renters.push();
    }

    /**
     * @notice
     * A Rent struct is used to represent the way we store rents,
     * A Rent will contain the asset id, users address, deposit, price
     * and the timestamp, when the rent was made
     */
    struct Rent {
        address user;
        uint256 deposit;
        uint256 price;
        uint256 since;
    }

    /**
     * @notice Renter is a user that has active rent
     */
    struct Renter {
        address user;
        Rent[] address_rents;
    }

    /**
     * @notice
     *   This is a array where we store all Rents that are performed on the Contract
     *   The rents for each address are stored at a certain index, the index can be found using the rents mapping
     */
    Renter[] internal renters;

    /**
     * @notice
     * rents is used to keep track of the INDEX for the renters in the rents array
     */
    mapping(address => uint256) internal rents;

    /**
     * @notice Rented event is triggered whenever a user rent property,
     * address is indexed to make it filterable
     */
    event Rented(
        address indexed user,
        uint256 deposit,
        uint256 price,
        uint256 index,
        uint256 timestamp
    );

    /**
     * @notice Returned event is triggered whenever a user returns rented property,
     * address is indexed to make it filterable
     */
    event Returned(
        address indexed user,
        uint256 deposit,
        uint256 index,
        uint256 timestamp
    );

    /**
     * @notice Paid event is triggered whenever a user pay for rent,
     * address is indexed to make it filterable
     */
    event Paid(
        address indexed user,
        uint256 amount,
        uint256 index,
        uint256 timestamp
    );

    /**
     * @notice
     * calculateCosts is used to calculate how much a user pay for their rent
     * for the duration the rent has been active
     */
    function calculateCosts(Rent memory _current_rent)
        internal
        view
        returns (uint256)
    {
        // First calculate how long the rent has been active
        // Use current seconds since epoch - the seconds since epoch the rent was made
        // The output will be duration in SECONDS ,
        // We will charge the user 'price' per Hour So thats price per 3600 seconds
        return
            ((block.timestamp - _current_rent.since) / 1 minutes) *
            _current_rent.price;
    }

    /**
     * @notice _addRenter takes care of adding a renter to the renters array
     */
    function _addRenter(address renter) internal returns (uint256) {
        // Push a empty item to the Array to make space for our new renter
        renters.push();
        // Calculate the index of the last item in the array by Len-1
        uint256 userIndex = renters.length - 1;
        // Assign the address to the new index
        renters[userIndex].user = renter;
        // Add index to the stakeHolders
        rents[renter] = userIndex;
        return userIndex;
    }

    /**
     * @notice
     * _rent is used to make a rent for an sender.
     */
    function _rent(uint256 _deposit, uint256 _price)
        internal
        returns (uint256)
    {
        // Simple check so that user does not stake 0
        require(_deposit > 0, "Rentable: Cannot rent without deposit");
        require(_price > 0, "Rentable: Cannot rent for nothing");

        // Mappings in solidity creates all values, but empty, so we can just check the address
        uint256 index = rents[msg.sender];
        // block.timestamp = timestamp of the current block in seconds since the epoch
        uint256 timestamp = block.timestamp;
        // See if the renter already has a rent index or if its the first time
        if (index == 0) {
            index = _addRenter(msg.sender);
        }

        // Use the index to add a new Rent
        // push a newly created Rent with the current block timestamp.
        renters[index].address_rents.push(
            Rent(msg.sender, _deposit, _price, timestamp)
        );
        // Emit an event that the rent has occured
        emit Rented(msg.sender, _deposit, _price, index, timestamp);
        return index;
    }

    /**
     * @notice
     * _cancelRent return rented property. owner address is set to address(0)
     * costs are applied to the initial deposit and remaining is returned
     */
    function _cancelRent(uint256 index) internal returns (uint256) {
        // Grab user_index which is the index to use to grab the Rent[]
        uint256 user_index = rents[msg.sender];
        require(user_index > 0, "Rentable: Cannot cancel rent you not own");

        Rent memory current_rent = renters[user_index].address_rents[index];

        // Calculate current costs
        uint256 costs = calculateCosts(current_rent);
        uint256 remainer = 0;
        if (costs < current_rent.deposit) {
            remainer = current_rent.deposit - costs;
        }
        uint256 _now = block.timestamp;
        delete renters[user_index].address_rents[index];
        // Emit an event that the rent has returned
        emit Returned(msg.sender, remainer, index, _now);
        return remainer;
    }

    /**
     * @notice
     * _payRent adding value to the current rent deposit
     */
    function _payRent(uint256 index, uint256 amount)
        internal
        returns (uint256)
    {
        require(amount > 0, "Rentable: Cannot pay rent with nothing");

        // Grab user_index which is the index to use to grab the Rent[]
        uint256 user_index = rents[msg.sender];
        require(user_index > 0, "Rentable: Cannot pay rent you not own");

        Rent memory current_rent = renters[user_index].address_rents[index];

        // Calculate current costs
        uint256 costs = calculateCosts(current_rent);
        // If stake is empty, 0, then remove it from the array of stakes
        uint256 _now = block.timestamp;
        uint256 new_deposit = current_rent.deposit + amount;
        if (costs < new_deposit) {
            new_deposit = new_deposit - costs;
        } else {
            new_deposit = 0;
        }

        if (new_deposit > 0) {
            // If not empty then replace the value of it
            renters[user_index].address_rents[index].deposit = new_deposit;
            // Reset timer of rent
            renters[user_index].address_rents[index].since = _now;
        } else {
            delete renters[user_index].address_rents[index];
        }

        emit Paid(msg.sender, new_deposit, index, _now);
        return new_deposit;
    }

    /**
     * @notice
     * _deposited returns current rent deposit left
     */
    function _depositLeft(uint256 index) internal view returns (uint256) {
        // Grab user_index which is the index to use to grab the Rent[]
        uint256 user_index = rents[msg.sender];
        require(user_index > 0, "Rentable: Not existing rent");

        Rent memory current_rent = renters[user_index].address_rents[index];
        // Calculate current costs
        uint256 costs = calculateCosts(current_rent);

        if (costs > current_rent.deposit) {
            return 0;
        } else {
            return current_rent.deposit - costs;
        }
    }

    /**
     * @notice history is used to check if a account has rents
     */
    function _rentHistory(address _renter)
        internal
        view
        returns (RentHistory memory)
    {
        // Keep a summary in memory since we need to calculate this
        RentHistory memory history = RentHistory(
            false,
            0,
            renters[rents[_renter]].address_rents
        );
        uint256 depositLeft = 0;
        uint256 costs = 0;
        uint256 rentDeposit = 0;
        // Itterate all rents and check for active one
        for (uint256 r = 0; r < history.rents.length; r += 1) {
            if (history.rents[r].user != address(0)) {
                costs = calculateCosts(history.rents[r]);
                if (costs > history.rents[r].deposit) {
                    rentDeposit = 0;
                } else {
                    rentDeposit = history.rents[r].deposit - costs;
                }
                history.has_rent = true;
                depositLeft += rentDeposit;
            }
        }
        history.deposit = depositLeft;
        return history;
    }

    /**
     * @notice is the resoure already rented
     */
    function hasRent(address _renter) public view returns (bool) {
        RentHistory memory history = _rentHistory(_renter);
        return history.has_rent;
    }
}
