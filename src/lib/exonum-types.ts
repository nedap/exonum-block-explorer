/**
 * This module contains types as described in
 * https://exonum.com/doc/advanced/node-management/#explorer-api-endpoints
 *
 * with a small (logical modification): Block has field `header` instead of `block`
 */

type Hash = string; //32 bytes
type Signature = string; //64 bytes

interface BlockHeader {
    // The height of the block
    height: number;
    // The hash of the previous block
    prev_hash: Hash;
    // ID of the validator that created an approved block proposal
    proposer_id: number;
    // Information schema version. Currently, 0
    schema_version: number;
    state_hash: Hash;
    // Number of transactions included into the block
    tx_count: number;
    // The root hash of the transactions Merkle tree
    tx_hash: Hash;
}

interface Time {
    // The UNIX timestamp
    seconds: number;
    // Number of nanoseconds
    nanos: number;
}

interface PrecommitBody {
    // The hash of the current block (the Precommit message was created for)
    block_hash: Hash;
    // The height of the current block
    height: number;
    // The round when the block proposal was created
    round: number;
    // UTC time of the validator that created the block proposal
    time: Time;
    // ID of the validator that created this Precommit message
    validator: number;
}

interface Precommit {
    // The content of the Precommit message
    body: PrecommitBody;
    // ID of the Precommit message. Equals 4
    message_id: number;
    // Network ID. Is not used currently
    network_id: number;
    // The major version of the Exonum serialization protocol. Currently, 0
    protocol_version: number;
    // Unique service identifier. Equals 0
    service_id: number;
    // Precommit message creator's signature
    signature: Signature;
}

interface Block {
    // The header of the specified block
    header: BlockHeader;
    // The list of 'Precommit' messages supporting the block.
    precommits?: Precommit[];
    // The list of the transactions included into the block
    txs: Hash[];
}


export { Hash, Signature, BlockHeader, Time, PrecommitBody, Precommit, Block };
