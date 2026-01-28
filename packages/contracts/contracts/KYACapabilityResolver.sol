// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

/// @title KYACapabilityResolver
/// @notice Resolver for KYA-Capability attestations. Validates that the referenced
///         parent attestation is a valid, non-revoked, non-expired KYA-Identity.
contract KYACapabilityResolver is SchemaResolver {
    bytes32 public immutable identitySchemaUID;

    error InvalidParentIdentity();
    error ParentIdentityRevoked();
    error ParentIdentityExpired();

    constructor(
        IEAS eas,
        bytes32 _identitySchemaUID
    ) SchemaResolver(eas) {
        identitySchemaUID = _identitySchemaUID;
    }

    function onAttest(
        Attestation calldata attestation,
        uint256 /* value */
    ) internal view override returns (bool) {
        // Require valid refUID pointing to identity attestation
        if (attestation.refUID == bytes32(0)) {
            revert InvalidParentIdentity();
        }

        // Fetch parent attestation
        Attestation memory parent = _eas.getAttestation(attestation.refUID);

        // Validate parent is correct schema
        if (parent.schema != identitySchemaUID) {
            revert InvalidParentIdentity();
        }

        // Validate parent is not revoked
        if (parent.revocationTime != 0) {
            revert ParentIdentityRevoked();
        }

        // Validate parent is not expired
        if (
            parent.expirationTime != 0 &&
            parent.expirationTime < block.timestamp
        ) {
            revert ParentIdentityExpired();
        }

        return true;
    }

    function onRevoke(
        Attestation calldata,
        uint256 /* value */
    ) internal pure override returns (bool) {
        return true;
    }
}
