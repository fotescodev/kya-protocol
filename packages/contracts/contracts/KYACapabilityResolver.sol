// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

/// @title KYACapabilityResolver
/// @author KYA Protocol
/// @notice Resolver for KYA-Capability attestations that validates parent identity references
/// @dev Implements SchemaResolver to enforce capability→identity linking.
///      Key invariants:
///      - Every capability must reference a valid KYA-Identity via refUID
///      - Parent identity must use the correct schema (identitySchemaUID)
///      - Parent identity must not be revoked
///      - Parent identity must not be expired
///      This is a view-only resolver (no state modifications in onAttest)
contract KYACapabilityResolver is SchemaResolver {
    /// @notice The schema UID that parent identity attestations must match
    /// @dev Set at deployment and cannot be changed (immutable)
    bytes32 public immutable identitySchemaUID;

    /// @notice Thrown when refUID is zero or parent schema doesn't match identity schema
    error InvalidParentIdentity();

    /// @notice Thrown when the parent identity attestation has been revoked
    error ParentIdentityRevoked();

    /// @notice Thrown when the parent identity attestation has expired
    error ParentIdentityExpired();

    /// @notice Initializes the resolver with EAS address and identity schema reference
    /// @param eas The EAS contract address this resolver integrates with
    /// @param _identitySchemaUID The schema UID that valid parent identities must have
    constructor(
        IEAS eas,
        bytes32 _identitySchemaUID
    ) SchemaResolver(eas) {
        identitySchemaUID = _identitySchemaUID;
    }

    /// @notice Validates a capability attestation references a valid parent identity
    /// @dev Called by EAS during attestation creation. This is a view function
    ///      (no state modifications). Validation order:
    ///      1. Require non-zero refUID (must reference parent)
    ///      2. Fetch parent attestation from EAS
    ///      3. Validate parent uses identity schema
    ///      4. Validate parent is not revoked
    ///      5. Validate parent is not expired
    /// @param attestation The capability attestation being created
    /// @return True if attestation should be accepted, reverts otherwise
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

    /// @notice Handles capability attestation revocation
    /// @dev Always returns true - no additional validation needed for revocation.
    ///      Capabilities can be freely revoked by their attesters.
    /// @return True to allow the revocation to proceed
    function onRevoke(
        Attestation calldata,
        uint256 /* value */
    ) internal pure override returns (bool) {
        return true;
    }
}
