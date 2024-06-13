//Get funds from user
//Withdraw funds
//Set a minimum funding value in USD

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public donorAddress;
    mapping(address => uint256) public addressToAmount;

    address public immutable i_owner;

    AggregatorV3Interface public priceFeed;

    // Constructor is called whenever the contract is deployed. It is called Once
    constructor(address priceFeedAddress) {
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough"
        ); // This means that the user have to send minimum 1eth(e18 means 10 to the power 18Wei ie 1ether)
        // What is revreting??
        // If the requirement is not fulfil then the action taken by the function before the require will get undo
        donorAddress.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 donorIndex;
            donorIndex < donorAddress.length;
            donorIndex++
        ) {
            address donor = donorAddress[donorIndex];
            addressToAmount[donor] = 0;
        }
        // Set array to 0 means setting array to its initial state(Reset the array)
        donorAddress = new address[](0);
        // actually withdraw the funds

        // transfer
        // payable(msg.sender).transfer(address(this).balance); // transfer if fail it revret the transaction

        //send(it doesn't automatically revert by itself like transfer)
        // bool sendSucess = payable(msg.sender).send(address(this).balance);
        // require(sendSucess, "Send failed");

        //call
        // the call function returns two objects one is boolean that tells about callSucess as in sendSucess in previous and dataReturned that is an array return from a function which is called by call
        (bool callSucess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("" /* if you want any function to be called that goes here*/);
        require(callSucess, "Call Failed");
    }

    modifier onlyOwner() {
        if (i_owner != msg.sender) {
            revert NotOwner();
        }

        // this if statement is same as requrie statement written below only difference is the require statement takes more gas.
        // require(i_owner == msg.sender, "Owner is not matched");
        _;
    }

    // Here _; means all code in the function which have onlyOwner will get excuted their

    // fallback() external payable {
    //     fund();
    // }

    // receive() external payable {
    //     fund();
    // }
}
// Note that when we use msg.value.anyLibraryFunction() then as msg.value is a uint526 so we can use is library and the first parameter in the libraryfunction is always the varialble that called it.
// Eg. name.anyLibrariesVariable() here first parameter is name.
// Eg. name.anyLibrariesVariable(123) here first parameter is name second parameter is 123.
// Eg. name.anyLibrariesVariable(123, ram) here first parameter is name second parameter is 123 and third parameter is ram.

// "immutable" and "constant" keyword is used to lower the gas estimation.

// special function named receive() and fallback();

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly

// Explainer from: https://solidity-by-example.org/fallback/
// Ether is sent to contract
//      is msg.data empty?
//          /   \
//         yes  no
//         /     \
//    receive()?  fallback()
//     /   \
//   yes   no
//  /        \
//receive()  fallback()
