// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

/// @title KYAIdentityResolver
/// @author KYA Protocol
/// @notice Resolver for KYA-Identity attestations that enforces identity registration rules
/// @dev Implements SchemaResolver to validate attestations during creation and revocation.
///      Key invariants:
///      - One identity per agent address (prevents duplicate registrations)
///      - Non-zero owner and agent addresses required
///      - Optional attester whitelist for permissioned mode
///      - 2-step admin transfer to prevent accidental lockout
contract KYAIdentityResolver is SchemaResolver {
    /// @notice Maps agent addresses to their identity attestation UIDs
    /// @dev Zero value indicates no identity registered for that agent
    mapping(address => bytes32) public agentToIdentity;

    /// @notice Maps addresses to their attester authorization status
    /// @dev Only checked when whitelistEnabled is true
    mapping(address => bool) public authorizedAttesters;

    /// @notice Current admin address with privileged access
    address public admin;

    /// @notice Pending admin for 2-step transfer process
    address public pendingAdmin;

    /// @notice Whether attester whitelist is enforced
    /// @dev When false, any address can create attestations (permissionless mode)
    bool public whitelistEnabled;

    /// @notice Emitted when a new agent identity is registered
    /// @param agent The agent address that was registered
    /// @param uid The attestation UID for the identity
    event IdentityRegistered(address indexed agent, bytes32 uid);

    /// @notice Emitted when an agent identity is revoked
    /// @param agent The agent address that was revoked
    /// @param uid The attestation UID that was revoked
    event IdentityRevoked(address indexed agent, bytes32 uid);

    /// @notice Emitted when an attester is added to the whitelist
    /// @param attester The address added as authorized attester
    event AttesterAdded(address indexed attester);

    /// @notice Emitted when an attester is removed from the whitelist
    /// @param attester The address removed from authorized attesters
    event AttesterRemoved(address indexed attester);

    /// @notice Emitted when whitelist enforcement is toggled
    /// @param enabled The new whitelist state
    event WhitelistToggled(bool enabled);

    /// @notice Emitted when admin transfer is initiated
    /// @param currentAdmin The current admin initiating the transfer
    /// @param pendingAdmin The proposed new admin
    event AdminTransferStarted(address indexed currentAdmin, address indexed pendingAdmin);

    /// @notice Emitted when admin transfer is completed
    /// @param previousAdmin The outgoing admin
    /// @param newAdmin The new admin who accepted the transfer
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    /// @notice Thrown when a non-whitelisted attester tries to create attestation
    error UnauthorizedAttester();

    /// @notice Thrown when trying to register an identity for an already-registered agent
    error AgentAlreadyRegistered();

    /// @notice Thrown when owner address is zero
    error InvalidOwnerAddress();

    /// @notice Thrown when agent address is zero
    error InvalidAgentAddress();

    /// @notice Thrown when caller is not the admin
    error OnlyAdmin();

    /// @notice Thrown when caller is not the pending admin
    error OnlyPendingAdmin();

    /// @notice Initializes the resolver with EAS address and admin configuration
    /// @param eas The EAS contract address this resolver integrates with
    /// @param _admin The initial admin address for privileged operations
    /// @param _whitelistEnabled Whether to enforce attester whitelist from deployment
    constructor(
        IEAS eas,
        address _admin,
        bool _whitelistEnabled
    ) SchemaResolver(eas) {
        admin = _admin;
        whitelistEnabled = _whitelistEnabled;
    }

    /// @dev Restricts function access to the current admin
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    /// @notice Validates and registers a new agent identity attestation
    /// @dev Called by EAS during attestation creation. Validation order:
    ///      1. Check attester whitelist (if enabled)
    ///      2. Validate agent address is non-zero
    ///      3. Validate owner address is non-zero
    ///      4. Ensure agent doesn't already have an identity
    ///      5. Record agent→UID mapping and emit event
    /// @param attestation The attestation being created, containing encoded identity data
    /// @return True if attestation should be accepted, reverts otherwise
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

        // Enforce agent is not zero address
        if (agentAddress == address(0)) {
            revert InvalidAgentAddress();
        }

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

    /// @notice Cleans up state when an identity attestation is revoked
    /// @dev Called by EAS during attestation revocation. Clears the agent→UID mapping
    ///      to allow the agent address to register a new identity if needed.
    /// @param attestation The attestation being revoked
    /// @return True to allow the revocation to proceed
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

    /// @notice Adds an address to the authorized attesters whitelist
    /// @dev Only callable by admin. Has no effect if whitelist is disabled.
    /// @param attester The address to authorize as an attester
    function addAuthorizedAttester(address attester) external onlyAdmin {
        authorizedAttesters[attester] = true;
        emit AttesterAdded(attester);
    }

    /// @notice Removes an address from the authorized attesters whitelist
    /// @dev Only callable by admin. Does not affect existing attestations.
    /// @param attester The address to remove from authorized attesters
    function removeAuthorizedAttester(address attester) external onlyAdmin {
        authorizedAttesters[attester] = false;
        emit AttesterRemoved(attester);
    }

    /// @notice Toggles the attester whitelist enforcement
    /// @dev Only callable by admin. When disabled, any address can create attestations.
    ///      WARNING: Disabling whitelist enables permissionless mode - use with caution.
    /// @param enabled True to enforce whitelist, false for permissionless mode
    function setWhitelistEnabled(bool enabled) external onlyAdmin {
        whitelistEnabled = enabled;
        emit WhitelistToggled(enabled);
    }

    /// @notice Initiates a 2-step admin transfer
    /// @dev Only callable by current admin. The new admin must call acceptAdmin() to complete.
    ///      Calling this again with a different address overwrites the pending admin.
    /// @param newAdmin The address to transfer admin rights to
    function transferAdmin(address newAdmin) external onlyAdmin {
        pendingAdmin = newAdmin;
        emit AdminTransferStarted(admin, newAdmin);
    }

    /// @notice Completes the 2-step admin transfer
    /// @dev Only callable by the pending admin set via transferAdmin().
    ///      Resets pendingAdmin to zero after successful transfer.
    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) revert OnlyPendingAdmin();
        emit AdminTransferred(admin, pendingAdmin);
        admin = pendingAdmin;
        pendingAdmin = address(0);
    }
}
