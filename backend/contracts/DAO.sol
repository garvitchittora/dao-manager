//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract DAO {
    using Counters for Counters.Counter;
    Counters.Counter private _eventId;
    Counters.Counter private _memberIds;

    struct Event{
        uint eventId;
        uint eventTimeStamp;
        string name;
        string description;
        string coverURL;
        address createdBy;
        address[] attendees;
    }

    struct Member{
        uint memberId;
        uint activityPoints;
        uint joinTimeStamp;
        string discordUsername;
        string role;
        string[] pastActivities;
        string profileURL;
        address memberAddress;
    }

    Event[] events;
    Member[] members;
    mapping(address => uint) private _memberIdsByAddress;

    event EventsList(Event[] events);
    event MembersList(Member[] members);

    constructor() {
        _eventId.increment();
        _memberIds.increment();
    }

    function getMembers() public {
        emit MembersList(members);
    }

    function getEvents() public {
        emit EventsList(events);
    }

    function login() public {
        require(_memberIdsByAddress[msg.sender] > 0, "Not the member of DAO");
    }

    function addEvent(string memory _name, string memory _description, string memory _coverURL) public {
        require(_memberIdsByAddress[msg.sender] > 0, "Not the member of DAO");

        uint256 newEventId = _eventId.current();
        address[] memory attendees;
        Event memory newEvent = Event(newEventId, block.timestamp, _name, _description, _coverURL, msg.sender, attendees);
        events.push(newEvent);
        _eventId.increment();
    }

    function addMember(string memory _discordUsername, string memory _role, string memory _profileURL) public {
        // check not already joined
        require(_memberIdsByAddress[msg.sender] == 0, "Member already exists");

        uint256 newMemberId = _memberIds.current();
        string[] memory activity;

        // 1 activity point for signup
        Member memory newMember = Member(newMemberId, 1, block.timestamp, _discordUsername, _role, activity, _profileURL, msg.sender);
        members.push(newMember);
        _memberIdsByAddress[msg.sender] = newMemberId;
        _memberIds.increment();
    }

    function joinEvent(uint16 _eventID) public {
        uint eventId = uint(_eventID) - 1;
        require(eventId < events.length, "Event does not exist");

        for (uint i = 0; i < events[eventId].attendees.length; i++) {
            require(events[eventId].attendees[i] != msg.sender, "Member already joined event");
        }

        require(_memberIdsByAddress[msg.sender] > 0, "Not the member of DAO");

        events[eventId].attendees.push(msg.sender);
        uint memberId = _memberIdsByAddress[msg.sender] - 1;

        // 2 activity point for joining event
        members[memberId].activityPoints+=2;
        members[memberId].pastActivities.push(events[eventId].name);
    }
}
