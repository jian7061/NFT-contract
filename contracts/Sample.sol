//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Sample {
    string public name = "Sample";

    function initialize(string memory _name) external returns (bool) {
        name = _name;
        return true;
    }
}
