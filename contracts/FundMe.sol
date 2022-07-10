// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import "hardhat/console.sol";
error FundMe__NotOwner();




/** @title A contract for crowd funding
 *  @author Rohit Singh
 *  @notice This is to dema a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmount;

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

	/**
	 * @notice This function funds this contract
	 * @dev This implements price feeds as our library
	 */
    function fund() public payable {
        // require(getConversionRate(msg.value) >= minimumUsd, "Ditn't send enough! reverting changes");
		console.log("Ether amount is: %s", msg.value);
		console.log("Converted price is %s and minimumUsd is %s", msg.value.getConversionRate(s_priceFeed), MINIMUM_USD);
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
			"Ditn't send enough! reverting changes"

		);
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_addressToAmount[funder] = 0;
        }

        // Empty array with 0 elements;
        s_funders = new address[](0);

        // // transfer
        // payable(msg.sender).transfer(address(this).balance);

        // // send
        // bool sendSuccess payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");

        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

	function cheaperWithdraw() public payable onlyOwner {
		address[] memory funders = s_funders;
		for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++){
			address funder = funders[funderIndex];
			s_addressToAmount[funder] = 0;
		}

		s_funders = new address[](0);
		
		(bool success, ) = i_owner.call{value: address(this).balance}("");
		require(success);
	}

	function getOwner() public view returns(address){
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmount(address funder) public view returns(uint256){
		return s_addressToAmount[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}

	function getPriceFeedConverted(uint256 ethAmount) public view returns(uint256) {
		return ethAmount.getConversionRate(s_priceFeed);
	}

	function getMinimumUSD() public pure returns(uint256) {
		return MINIMUM_USD;
	}

	function getEthPrice() public view  returns(uint256) {
		(, int price, , ,) = s_priceFeed.latestRoundData();
        return uint256(price * 1e10);
	}

}
