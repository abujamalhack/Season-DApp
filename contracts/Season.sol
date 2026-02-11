// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SeasonYear {
    string private season;
    address public lastUpdatedBy;
    uint256 public updateCount;

    string[5] public lastSeasons;
    address[5] public lastUpdaters;

    event SeasonUpdated(string newSeason, address indexed updatedBy);

    function setSeason(string memory _season) public {
        require(bytes(_season).length > 0, "Season cannot be empty");
        require(bytes(_season).length <= 30, "Season too long (max 30 chars)");

        season = _season;
        lastUpdatedBy = msg.sender;
        updateCount++;

        uint idx = updateCount % 5;
        lastSeasons[idx] = _season;
        lastUpdaters[idx] = msg.sender;

        emit SeasonUpdated(_season, msg.sender);
    }

    function getSeason() public view returns (string memory) {
        return season;
    }

    function getLastSeasons() public view returns (string[5] memory, address[5] memory) {
        return (lastSeasons, lastUpdaters);
    }
}
