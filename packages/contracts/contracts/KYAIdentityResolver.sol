// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

/// @title KYAIdentityResolver
/// @notice Resolver for KYA-Identity attestations. Enforces one identity per agent
///         address and validates owner is non-zero. Supports optional attester whitelist.
contract KYAIdentityResolver is SchemaResolver {
    mapping(address => bytes32) public agentToIdentity;
    mapping(address => bool) public authorizedAttesters;
    address public admin;
    bool public whitelistEnabled;

    event IdentityRegistered(address indexed agent, bytes32 uid);
    event IdentityRevoked(address indexed agent, bytes32 uid);

    error UnauthorizedAttester();
    error AgentAlreadyRegistered();
    error InvalidOwnerAddress();
    error OnlyAdmin();

    constructor(
        IEAS eas,
        address _admin,
        bool _whitelistEnabled
    ) SchemaResolver(eas) {
        admin = _admin;
        whitelistEnabled = _whitelistEnabled;
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override returns (bool) {
        // Enforce whitelist if enabled
        if (whitelistEnabled && !authorizedAttesters[attestation.attester]) {
            revert UnauthorizedAttester();
        }

        // Decode attestation data
        (
            , // agentDID
            address agentAddress,
            address ownerAddress,
            , , , ,  // displayNameHash, descriptionHash, createdAt, version, metadataURI
        ) = abi.decode(
            attestation.data,
            (bytes32, address, address, bytes32, bytes32, uint64, uint8, bytes32)
        );

        // Enforce owner is not zero address
        if (ownerAddress == address(0)) {
            revert InvalidOwnerAddress();
        }

        // Enforce one identity per agent address
        if (agentToIdentity[agentAddress] != bytes32(0)) {
            revert AgentAlreadyRegistered();
        }

        // Record mapping
        agentToIdentity[agentAddress] = attestation.uid;

        emit IdentityRegistered(agentAddress, attestation.uid);

        return true;
    }

    function onRevoke(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal override returns (bool) {
        // Decode to get agent address
        (, address agentAddress, , , , , , ) = abi.decode(
            attestation.data,
            (bytes32, address, address, bytes32, bytes32, uint64, uint8, bytes32)
        );

        // Clear mapping on revocation
        delete agentToIdentity[agentAddress];

        emit IdentityRevoked(agentAddress, attestation.uid);

        return true;
    }

    function addAuthorizedAttester(address attester) external onlyAdmin {
        authorizedAttesters[attester] = true;
    }

    function removeAuthorizedAttester(address attester) external onlyAdmin {
        authorizedAttesters[attester] = false;
    }

    function setWhitelistEnabled(bool enabled) external onlyAdmin {
        whitelistEnabled = enabled;
    }
}
