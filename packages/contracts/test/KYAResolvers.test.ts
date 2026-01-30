import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ContractTransactionResponse } from "ethers";

// Schema strings matching the KYA specification
const IDENTITY_SCHEMA =
  "bytes32 agentDID,address agentAddress,address ownerAddress,bytes32 displayNameHash,bytes32 descriptionHash,uint64 createdAt,uint8 version,bytes32 metadataURI";
const CAPABILITY_SCHEMA =
  "bytes32 capabilityId,uint256 permissions,address targetContract,uint64 grantedAt,uint64 expiresAt,bytes32 conditionsHash,uint8 trustLevel";

// Extract attestation UID from the Attested event
async function getUIDFromAttestTx(tx: ContractTransactionResponse): Promise<string> {
  const receipt = await tx.wait();
  // EAS Attested event: Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUid)
  // uid is the 3rd topic (non-indexed param encoded in data) — actually uid is NOT indexed,
  // so it's in the log data. Let me parse it properly.
  // The event signature: Attested(address,address,bytes32,bytes32)
  // indexed: recipient (topic1), attester (topic2), schemaUid (topic3)
  // data: uid
  const attestedTopic = ethers.id("Attested(address,address,bytes32,bytes32)");
  const log = receipt!.logs.find((l) => l.topics[0] === attestedTopic);
  if (!log) throw new Error("Attested event not found");
  // uid is the only non-indexed parameter, so it's in log.data
  return ethers.AbiCoder.defaultAbiCoder().decode(["bytes32"], log.data)[0];
}

function encodeIdentityData(agentAddress: string, ownerAddress: string) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "address", "address", "bytes32", "bytes32", "uint64", "uint8", "bytes32"],
    [
      ethers.keccak256(ethers.toUtf8Bytes("did:ethr:base:" + agentAddress)),
      agentAddress,
      ownerAddress,
      ethers.keccak256(ethers.toUtf8Bytes("TestAgent")),
      ethers.keccak256(ethers.toUtf8Bytes("A test agent")),
      BigInt(Math.floor(Date.now() / 1000)),
      1,
      ethers.ZeroHash,
    ]
  );
}

function encodeCapabilityData() {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "uint256", "address", "uint64", "uint64", "bytes32", "uint8"],
    [
      ethers.keccak256(ethers.toUtf8Bytes("cap-transact")),
      1n, // TRANSACT permission
      ethers.ZeroAddress,
      BigInt(Math.floor(Date.now() / 1000)),
      0n, // never expires
      ethers.ZeroHash,
      100, // trust level
    ]
  );
}

const attestParams = (schema: string, recipient: string, data: string, refUID = ethers.ZeroHash, expirationTime = 0n) => ({
  schema,
  data: { recipient, expirationTime, revocable: true, refUID, data, value: 0n },
});

async function deployEASFixture() {
  const [deployer, attester, agent, owner, other] = await ethers.getSigners();

  // Deploy SchemaRegistry
  const SchemaRegistry = await ethers.getContractFactory("SchemaRegistry");
  const schemaRegistry = await SchemaRegistry.deploy();

  // Deploy EAS
  const EAS = await ethers.getContractFactory("EAS");
  const eas = await EAS.deploy(await schemaRegistry.getAddress());

  // Deploy KYAIdentityResolver (permissionless — whitelistEnabled = false)
  const IdentityResolver = await ethers.getContractFactory("KYAIdentityResolver");
  const identityResolver = await IdentityResolver.deploy(
    await eas.getAddress(),
    deployer.address,
    false // permissionless
  );

  // Register Identity schema with resolver
  const regTx1 = await schemaRegistry.register(
    IDENTITY_SCHEMA,
    await identityResolver.getAddress(),
    true
  );
  const receipt1 = await regTx1.wait();
  const identitySchemaUID = receipt1!.logs[0]!.topics[1]!;

  // Deploy KYACapabilityResolver
  const CapabilityResolver = await ethers.getContractFactory("KYACapabilityResolver");
  const capabilityResolver = await CapabilityResolver.deploy(
    await eas.getAddress(),
    identitySchemaUID
  );

  // Register Capability schema with resolver
  const regTx2 = await schemaRegistry.register(
    CAPABILITY_SCHEMA,
    await capabilityResolver.getAddress(),
    true
  );
  const receipt2 = await regTx2.wait();
  const capabilitySchemaUID = receipt2!.logs[0]!.topics[1]!;

  return {
    eas,
    schemaRegistry,
    identityResolver,
    capabilityResolver,
    identitySchemaUID,
    capabilitySchemaUID,
    deployer,
    attester,
    agent,
    owner,
    other,
  };
}

describe("KYAIdentityResolver", function () {
  it("should register an identity successfully", async function () {
    const { eas, identitySchemaUID, agent, owner, attester } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(agent.address, owner.address);
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );
    const uid = await getUIDFromAttestTx(tx);
    expect(uid).to.not.equal(ethers.ZeroHash);
  });

  it("should reject duplicate agent registration", async function () {
    const { eas, identitySchemaUID, agent, owner, attester } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(agent.address, owner.address);

    // First registration succeeds
    await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );

    // Second registration for same agent should fail
    await expect(
      eas.connect(attester).attest(
        attestParams(identitySchemaUID, agent.address, data)
      )
    ).to.be.reverted;
  });

  it("should reject zero owner address", async function () {
    const { eas, identitySchemaUID, agent, attester } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(agent.address, ethers.ZeroAddress);

    await expect(
      eas.connect(attester).attest(
        attestParams(identitySchemaUID, agent.address, data)
      )
    ).to.be.reverted;
  });

  it("should clear mapping on revocation", async function () {
    const { eas, identityResolver, identitySchemaUID, agent, owner, attester } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(agent.address, owner.address);

    // Register and get UID from event
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );
    const uid = await getUIDFromAttestTx(tx);

    // Verify mapping is set
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);

    // Revoke
    await eas.connect(attester).revoke({
      schema: identitySchemaUID,
      data: { uid, value: 0n },
    });

    // Verify mapping is cleared
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(
      ethers.ZeroHash
    );
  });

  it("should enforce whitelist when enabled", async function () {
    const { eas, identityResolver, identitySchemaUID, agent, owner, attester, deployer } =
      await loadFixture(deployEASFixture);

    // Enable whitelist
    await identityResolver.connect(deployer).setWhitelistEnabled(true);

    const data = encodeIdentityData(agent.address, owner.address);

    // Should fail — attester not whitelisted
    await expect(
      eas.connect(attester).attest(
        attestParams(identitySchemaUID, agent.address, data)
      )
    ).to.be.reverted;

    // Whitelist attester
    await identityResolver.connect(deployer).addAuthorizedAttester(attester.address);

    // Should succeed now
    await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );
  });

  it("should reject zero agent address", async function () {
    const { eas, identitySchemaUID, owner, attester } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(ethers.ZeroAddress, owner.address);

    await expect(
      eas.connect(attester).attest(
        attestParams(identitySchemaUID, ethers.ZeroAddress, data)
      )
    ).to.be.reverted;
  });

  it("should support 2-step admin transfer", async function () {
    const { identityResolver, deployer, other } =
      await loadFixture(deployEASFixture);

    // Non-admin cannot transfer
    await expect(
      identityResolver.connect(other).transferAdmin(other.address)
    ).to.be.reverted;

    // Admin initiates transfer
    await identityResolver.connect(deployer).transferAdmin(other.address);
    expect(await identityResolver.pendingAdmin()).to.equal(other.address);

    // Old admin is still admin
    expect(await identityResolver.admin()).to.equal(deployer.address);

    // Wrong account cannot accept
    await expect(
      identityResolver.connect(deployer).acceptAdmin()
    ).to.be.reverted;

    // Pending admin accepts
    await identityResolver.connect(other).acceptAdmin();
    expect(await identityResolver.admin()).to.equal(other.address);
    expect(await identityResolver.pendingAdmin()).to.equal(ethers.ZeroAddress);
  });

  it("should not affect existing attestations when whitelist is toggled", async function () {
    const { eas, identityResolver, identitySchemaUID, agent, owner, attester, deployer } =
      await loadFixture(deployEASFixture);

    const data = encodeIdentityData(agent.address, owner.address);

    // Create attestation while whitelist is disabled
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );
    const uid = await getUIDFromAttestTx(tx);

    // Verify attestation exists
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);

    // Enable whitelist
    await identityResolver.connect(deployer).setWhitelistEnabled(true);

    // Existing attestation should still be valid
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);

    // Verify the attestation still exists in EAS and is not revoked
    const attestation = await eas.getAttestation(uid);
    expect(attestation.uid).to.equal(uid);
    expect(attestation.revocationTime).to.equal(0n);

    // Disable whitelist again
    await identityResolver.connect(deployer).setWhitelistEnabled(false);

    // Attestation still valid
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);
  });

  it("should overwrite pendingAdmin when transferAdmin is called twice", async function () {
    const { identityResolver, deployer, attester, other } =
      await loadFixture(deployEASFixture);

    // First transfer initiation
    await identityResolver.connect(deployer).transferAdmin(attester.address);
    expect(await identityResolver.pendingAdmin()).to.equal(attester.address);

    // Second transfer initiation overwrites the first
    await identityResolver.connect(deployer).transferAdmin(other.address);
    expect(await identityResolver.pendingAdmin()).to.equal(other.address);

    // Original pending admin (attester) cannot accept
    await expect(
      identityResolver.connect(attester).acceptAdmin()
    ).to.be.reverted;

    // New pending admin (other) can accept
    await identityResolver.connect(other).acceptAdmin();
    expect(await identityResolver.admin()).to.equal(other.address);
    expect(await identityResolver.pendingAdmin()).to.equal(ethers.ZeroAddress);
  });

  it("should not affect existing attestations when attester is removed", async function () {
    const { eas, identityResolver, identitySchemaUID, agent, owner, attester, deployer } =
      await loadFixture(deployEASFixture);

    // Enable whitelist and authorize attester
    await identityResolver.connect(deployer).setWhitelistEnabled(true);
    await identityResolver.connect(deployer).addAuthorizedAttester(attester.address);

    const data = encodeIdentityData(agent.address, owner.address);

    // Create attestation while attester is authorized
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, data)
    );
    const uid = await getUIDFromAttestTx(tx);

    // Verify attestation exists
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);

    // Remove attester from whitelist
    await identityResolver.connect(deployer).removeAuthorizedAttester(attester.address);

    // Existing attestation should still be valid
    expect(await identityResolver.agentToIdentity(agent.address)).to.equal(uid);

    // Verify the attestation still exists in EAS and is not revoked
    const attestation = await eas.getAttestation(uid);
    expect(attestation.uid).to.equal(uid);
    expect(attestation.revocationTime).to.equal(0n);

    // Removed attester cannot create new attestations
    const [, , , , otherAgent] = await ethers.getSigners();
    const newData = encodeIdentityData(otherAgent.address, owner.address);
    await expect(
      eas.connect(attester).attest(
        attestParams(identitySchemaUID, otherAgent.address, newData)
      )
    ).to.be.reverted;
  });
});

describe("KYACapabilityResolver", function () {
  async function createIdentityFixture() {
    const fixture = await deployEASFixture();
    const { eas, identitySchemaUID, agent, owner, attester } = fixture;

    const identityData = encodeIdentityData(agent.address, owner.address);
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, identityData)
    );
    const identityUID = await getUIDFromAttestTx(tx);

    return { ...fixture, identityUID };
  }

  it("should accept capability with valid parent identity", async function () {
    const { eas, capabilitySchemaUID, identityUID, agent, attester } =
      await loadFixture(createIdentityFixture);

    const capData = encodeCapabilityData();

    await eas.connect(attester).attest(
      attestParams(capabilitySchemaUID, agent.address, capData, identityUID)
    );
  });

  it("should reject capability with zero refUID", async function () {
    const { eas, capabilitySchemaUID, agent, attester } =
      await loadFixture(createIdentityFixture);

    const capData = encodeCapabilityData();

    await expect(
      eas.connect(attester).attest(
        attestParams(capabilitySchemaUID, agent.address, capData, ethers.ZeroHash)
      )
    ).to.be.reverted;
  });

  it("should reject capability with revoked parent identity", async function () {
    const { eas, identitySchemaUID, capabilitySchemaUID, identityUID, agent, attester } =
      await loadFixture(createIdentityFixture);

    // Revoke the identity
    await eas.connect(attester).revoke({
      schema: identitySchemaUID,
      data: { uid: identityUID, value: 0n },
    });

    const capData = encodeCapabilityData();

    await expect(
      eas.connect(attester).attest(
        attestParams(capabilitySchemaUID, agent.address, capData, identityUID)
      )
    ).to.be.reverted;
  });

  it("should reject capability with expired parent identity", async function () {
    const fixture = await deployEASFixture();
    const { eas, identitySchemaUID, capabilitySchemaUID, agent, owner, attester } = fixture;

    const identityData = encodeIdentityData(agent.address, owner.address);

    // Create identity with short expiration
    const now = await time.latest();
    const tx = await eas.connect(attester).attest(
      attestParams(identitySchemaUID, agent.address, identityData, ethers.ZeroHash, BigInt(now + 60))
    );
    const identityUID = await getUIDFromAttestTx(tx);

    // Fast-forward past expiration
    await time.increase(120);

    const capData = encodeCapabilityData();

    await expect(
      eas.connect(attester).attest(
        attestParams(capabilitySchemaUID, agent.address, capData, identityUID)
      )
    ).to.be.reverted;
  });

  it("should reject capability referencing another capability instead of identity", async function () {
    const { eas, capabilitySchemaUID, capabilityResolver, identityUID, agent, attester } =
      await loadFixture(createIdentityFixture);

    const capData = encodeCapabilityData();

    // Create a valid capability referencing the identity
    const tx = await eas.connect(attester).attest(
      attestParams(capabilitySchemaUID, agent.address, capData, identityUID)
    );
    const firstCapabilityUID = await getUIDFromAttestTx(tx);

    // Try to create a second capability referencing the first capability (not the identity)
    // This should fail because the parent schema doesn't match identitySchemaUID
    await expect(
      eas.connect(attester).attest(
        attestParams(capabilitySchemaUID, agent.address, capData, firstCapabilityUID)
      )
    ).to.be.revertedWithCustomError(capabilityResolver, "InvalidParentIdentity");
  });

  it("should accept multiple capabilities referencing the same identity", async function () {
    const { eas, capabilitySchemaUID, identityUID, agent, attester } =
      await loadFixture(createIdentityFixture);

    // Create first capability with TRANSACT permission
    const capData1 = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address", "uint64", "uint64", "bytes32", "uint8"],
      [
        ethers.keccak256(ethers.toUtf8Bytes("cap-transact")),
        1n, // TRANSACT permission
        ethers.ZeroAddress,
        BigInt(Math.floor(Date.now() / 1000)),
        0n,
        ethers.ZeroHash,
        100,
      ]
    );

    const tx1 = await eas.connect(attester).attest(
      attestParams(capabilitySchemaUID, agent.address, capData1, identityUID)
    );
    const uid1 = await getUIDFromAttestTx(tx1);
    expect(uid1).to.not.equal(ethers.ZeroHash);

    // Create second capability with SIGN permission
    const capData2 = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address", "uint64", "uint64", "bytes32", "uint8"],
      [
        ethers.keccak256(ethers.toUtf8Bytes("cap-sign")),
        2n, // SIGN permission
        ethers.ZeroAddress,
        BigInt(Math.floor(Date.now() / 1000)),
        0n,
        ethers.ZeroHash,
        50,
      ]
    );

    const tx2 = await eas.connect(attester).attest(
      attestParams(capabilitySchemaUID, agent.address, capData2, identityUID)
    );
    const uid2 = await getUIDFromAttestTx(tx2);
    expect(uid2).to.not.equal(ethers.ZeroHash);

    // Create third capability with DELEGATE permission
    const capData3 = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "uint256", "address", "uint64", "uint64", "bytes32", "uint8"],
      [
        ethers.keccak256(ethers.toUtf8Bytes("cap-delegate")),
        4n, // DELEGATE permission
        ethers.ZeroAddress,
        BigInt(Math.floor(Date.now() / 1000)),
        0n,
        ethers.ZeroHash,
        75,
      ]
    );

    const tx3 = await eas.connect(attester).attest(
      attestParams(capabilitySchemaUID, agent.address, capData3, identityUID)
    );
    const uid3 = await getUIDFromAttestTx(tx3);
    expect(uid3).to.not.equal(ethers.ZeroHash);

    // Verify all three UIDs are unique
    expect(uid1).to.not.equal(uid2);
    expect(uid2).to.not.equal(uid3);
    expect(uid1).to.not.equal(uid3);

    // Verify all attestations reference the same identity
    const attestation1 = await eas.getAttestation(uid1);
    const attestation2 = await eas.getAttestation(uid2);
    const attestation3 = await eas.getAttestation(uid3);

    expect(attestation1.refUID).to.equal(identityUID);
    expect(attestation2.refUID).to.equal(identityUID);
    expect(attestation3.refUID).to.equal(identityUID);
  });
});
