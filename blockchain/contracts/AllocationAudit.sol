// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AllocationAudit {

    event AllocationRecorded(
        bytes32 hash,
        uint256 timestamp
    );

    function recordAllocation(bytes32 _hash) public {
        emit AllocationRecorded(_hash, block.timestamp);
    }
}
