/**
 * This module contains helper functions for requesting blocks and transactions
 */

import axios from 'axios';

import { BlockHeader, Block, Hash } from './exonum-types';
import { Tx, History, Exhaustion } from './extra-types';

/**
 * Returns list of blocks starting with the larger height
 * @param explorer_base_path http address to request blocks
 * @param ref_height height of the reference block. It's possible to move to more distant
 *                   or more recent history from this block. -1 means `latest known`
 * @param dir direction to move from the reference block
 * @param target_size how many blocks of histry should be returned starting (including) the reference block
 * @param include_empty_blocks should empty blocks be accounted
 * @param try_fill_in if going to the future, the required number of blocks cannot be fetched,
 *                      then try to get some blocks from the past w.r.t. the reference
 * @param delay if the diff between two consequent pulls from the future is less or equal to delay,
 *              conclude that future is exhausted
 *
 * @returns list of fetched blocks together with indication if the chain is exhausted from any side
 */
async function pull_headers (
    explorer_base_path: string,
    ref_height: number,
    dir: History,
    target_size: number,
    include_empty_blocks: boolean,
    try_fill_in: boolean = true,
    delay: number = 5): Promise<{headers: BlockHeader[], exhaustion: Exhaustion}>{

    // console.log(`!!!   PULLING BLOCKS   !!!   ${dir}`);

    // Blocks are ordered in reverse w.r.t. their height
    // max .. height_n .. height_k .. 0 with n>k

    let headers: BlockHeader[] = [];
    let reference = ref_height;

    // read as many as possible or as many as required
    const count = Math.min(1000, target_size);
    if (reference !== -1 && dir === History.GetMoreFuture) {
        // read more recent  history
        //                       from |
        //                            v
        // B_{n} B_{n-1} ... B_{k+1} B_k B_{k-1} B_{k-2}
        //              <--- read --- ^
        // as we don't know before hand how many blocks there are,
        // just read as much as possible from the future
        reference = reference + count + 1;
    }
    // The following cases are presented for completeness
    // but commented out as in these cases no extra steps heightmust be taken
    // else
    // if (reference === -1 && dir === -1) {
    //     // empty by definition
    //     //            from |
    //     //                 v
    //     //                B_n B_{n-1} B_{n-2}
    //     //  <--- read ---
    //     // Going to the future, this is a refresh
    // }
    // else
    // if (reference !== -1 && dir === 1) {
    //     // read more distant history
    //     //               from |
    //     //                    v
    //     // B_{n} B_{n-1} ... B_k B_{k-1} B_{k-2} ... B_1
    //     //                       --- read --->
    // } else
    // if (reference === -1 && dir === 1) {
    //     // get the latest known history
    //     //  from |
    //     //       v
    //     //      B_n B_{n-1} B_{n-2}
    //     //            --- read --->
    // }

    let exhaustion = Exhaustion.NotReached;

    let collected_heights = new Set<number>();

    do {
        const request_params = [
            reference !== -1 ? `latest=${reference}` : '',
            `count=${count}`
        ];

        const request = `${explorer_base_path}/blocks?${request_params.filter(p=> p!=='').join('&')}`;
        // console.log(request);

        const response = await axios.get(request);

        if (response.status !== 200) {
            console.log("Something went wrong while polling for blocks; Terminating...");
            return {headers: [], exhaustion};
        }

        let responded_headers = (response.data as BlockHeader[])
            // for some reason the height field is interpreted as a string
            .map(h=> {
                const height = h.height as any;
                delete h.height;
                h.height = parseInt(height, 10);    // Blocks are ordered in reverse w.r.t. their height
                // max .. height_n .. height_k .. 0 with n>k
                return h;
            });

        if(
            dir === History.GetMorePast &&
            // we go further the genesis block to the past
            responded_headers.length === 0 )
        {
            exhaustion = Exhaustion.NoMorePast;
            break;
        }

        if (
            dir === History.GetMoreFuture &&
            // retrieving from the more close present gives (almost) the same most recent height
            (responded_headers[0].height - (reference - count - 1)) <= delay )
        {
            exhaustion = Exhaustion.NoMoreFuture;
            break;
        }

        // do this way because incrementing or decrementing `reference` by `count`
        // is not valid at the very first request
        if (dir === History.GetMorePast){
            reference = responded_headers[responded_headers.length - 1].height;
        } else {
            // dir = History.GetMoreFuture
            reference = responded_headers[0].height + count + 1;
        }

        const new_headers =
            include_empty_blocks
            ? responded_headers
            : responded_headers.filter(h=> h.tx_count > 0);

        if (dir === History.GetMorePast) {
            headers = [...headers, ...new_headers];
        } else {
            // dir = History.GetMoreFuture
            headers = [...new_headers, ...headers];
        }
    } while (headers.length < target_size);

    // console.log(`0: Collected headers from reference: ${headers.map(h=> h.height)}`);

    // if we went to the present, i.e., dir = History.GetMoreFuture
    // we might have accumulated only a fraction of the required blocks,
    if (try_fill_in && dir === History.GetMoreFuture && headers.length < target_size) {
        // console.log(`--- Add more headers from the past ---`);
        // add more headers from the past
        const new_reference = headers.length === 0 ? -1: ref_height;
        const extra = await pull_headers(
            explorer_base_path,
            new_reference,
            History.GetMorePast,
            target_size - headers.length + 1,
            include_empty_blocks,
            try_fill_in,
            delay);
        headers = [...headers, ...extra.headers];
        exhaustion = extra.exhaustion;
    }

    // console.log(`1: Collected headers: ${headers.map(h=> h.height)}`);

    headers = dir === History.GetMorePast
        ? headers.slice(0, target_size)
        : headers.reverse().slice(0, target_size).reverse();

    // console.log(`2: Trimmed headers: ${headers.map(h=> h.height)}`);

    return {headers, exhaustion};
}

/**
 * Returns a blocks at specified height if it exists otherwise null
 * @param explorer_base_path http address to request blocks
 * @param height height of the block
 */
async function pull_block (explorer_base_path: string, height: number): Promise<Block | null> {
    const request = `${explorer_base_path}/blocks/${height}`;
    // console.log(request);

    const response = await axios.get(request);

    if (response.status !== 200) {
        // console.log("Something went wrong while polling for blocks; Terminaing...");
        return null;
    }

    if (response.data === null) {
        return null;
    }

    let block = response.data as Block;
    // re-arrange some fields
    block.header = (block as any).block;
    delete (block as any).block;

    const h = block.header.height as any;
    delete block.header.height;
    block.header.height = parseInt(h, 10);

    return block;
}

/**
 * Collects a required number of transactions starting from a required tx in required block
 * @param endpoint http address to request blocks
 * @param ref_height height of the block to start from
 * @param ref_hash hash of the transaction to start from
 * @param dir Direction to go from the reference block
 * @param target_size how many tx of history should be returned starting (including) the reference tx
 *
 * @returns transactions with an indication if the transactions on the chain are exhausted from any side
 */
async function pull_txs (
    explorer_base_path: string,
    system_base_path: string,
    ref_height: number,
    ref_hash: Hash,
    dir: History,
    target_size: number): Promise<{txs: Tx[], exhaustion: Exhaustion}>
    {

    // console.log(`!!!   PULLING TXS   !!!   ${dir}`);

    let txs: Tx[] = [];
    let track_ref_height = ref_height > 0 ? ref_height + (dir === History.GetMorePast ? 1 : -1) : ref_height;
    let chain_exhaustion = Exhaustion.NotReached;

    do {
        // Get 100 non-empty blocks in the given direction
        const subchain = await pull_headers(explorer_base_path, track_ref_height, dir, 100, false, false);
        const headers = dir === History.GetMorePast ? subchain.headers : subchain.headers.reverse();
        chain_exhaustion = subchain.exhaustion;

        if (headers.length === 0) {
            continue;
        }

        // Update the height reference
        track_ref_height =
            dir === 1
            ? headers[headers.length-1].height
            : headers[0].height;

        for (let header of headers) {
            const block = (await pull_block(explorer_base_path, header.height))!;

            // ASSUMPTION:
            // any existing order of transactions in the block
            // does not convey any blockchain specific information

            // these are transaction hashes without the actual content
            const tx_hashes =
                block.header.height === ref_height
                // a sybset of transactions has to be taken
                ? block.txs.filter(
                    // subset depends in which direction we iterate
                    hash => dir === History.GetMorePast ? (hash > ref_hash) : (hash < ref_hash)
                )
                // all transactions have to be taken
                : block.txs;

            // Get transactions corresponding to the hashes
            let block_txs: Tx[] = [];
            for (const hash of tx_hashes) {
                const tx = (await pull_tx(system_base_path, hash))!;
                block_txs.push({ hash, raw: tx });
            }


            if (dir === History.GetMorePast) {
                txs = [...txs, ...block_txs];
            } else {
                txs = [...block_txs, ...txs];
            }
        }
    } while (txs.length < target_size && chain_exhaustion === Exhaustion.NotReached);

    // The only case when we will not get the required number of transactions
    // is when there are not enought block to collect these many transactions
    // console.log(`0: Collected txs from the reference:\n\t${txs.map(tx=> tx.hash).join('\n\t')}`);

    // if we went to the present, i.e., dir = History.GetMoreFuture
    // we might have accumulated only a fraction of the required txs,
    if (dir === History.GetMoreFuture && txs.length < target_size) {
        // console.log(`--- Add more txs from the past ---`);
        // add more headers from the past
        let new_ref_height = ref_height;
        let new_ref_hash = "";
        if (ref_hash !== "") {
            const block = (await pull_block(explorer_base_path, new_ref_height))!;
            const smaller = block.txs.filter(hash=> hash < ref_hash);
            const l = smaller.length;
            if (l > 0) {
                new_ref_hash = smaller[l - 1];
            }
        }

        const extra = await pull_txs(
            explorer_base_path,
            system_base_path,
            new_ref_height,
            new_ref_hash,
            History.GetMorePast,
            target_size - txs.length);

        txs = [...txs, ...extra.txs];
        chain_exhaustion = extra.exhaustion;
    }

    // console.log(`1: Collected txs:\n\t${txs.map(tx=> tx.hash).join('\n\t')}`);

    // Consider the following:
    // 1. Target size is 12 txs
    // 2. There are 3 blocks, each of which contains 5 txs
    // When we fetch blocks to get contained txs,
    // we will exhaust all the chain, but not the transactions
    // i.e. 3 will be left.
    //  =>
    // necessary exhaustion condition is the exhaustion of the chain
    // suffcient --- the complete slice with the transactions has to be returned

    const slice = dir === History.GetMorePast
        ? txs.slice(0, target_size)
        : txs.reverse().slice(0, target_size).reverse();

    const exhaustion =
        chain_exhaustion !== Exhaustion.NotReached && slice.length === txs.length
        ? chain_exhaustion
        : Exhaustion.NotReached;

    // console.log(`2: Trimmed txs:\n\t${slice.map(tx=> tx.hash).join('\n\t')}`);

    return {txs: slice, exhaustion};
}

async function pull_tx(system_base_path: string, transaction_hash: Hash): Promise<Object | null> {
    const request = `${system_base_path}/transactions/${transaction_hash}`;
    // console.log(`Fetching tx: ${request}`);

    const response = await axios.get(request);

    if (response.status !== 200) {
        // console.log("Something went wrong while polling for blocks; Terminaing...");
        return null;
    }

    if (response.data === null) {
        return null;
    }

    let tx = response.data;

    if (tx['type'] === "Unknown") {
        return null;
    }

    return tx as Object;
}

export { pull_headers, pull_block, pull_txs, pull_tx };
