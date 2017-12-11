/**
 * This module contains types allowing for simpler navigation in the chain
 */

import { Hash } from './exonum-types';

interface Tx {
    hash: Hash;
    raw: Object;
}

enum History { GetMorePast, GetMoreFuture }
enum Exhaustion {
    NoMorePast = "No More Past",
    NotReached = "Not Reached",
    NoMoreFuture = "No More Future"
}

export { Tx, History, Exhaustion };
