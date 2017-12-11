/**
 * Evaluates to true if a comes after b w.r.t. some order
 */
type After<K> = (a: K, b: K)=> boolean;

class OrderedMap<K, V> implements IterableIterator<V | null> {
    private map: Map<K, V>;
    private order: K[];
    private after: After<K>;

    private forward_iteration: number = 0;
    private backward_iteration: number = 0;

    constructor(after: After<K>) {
        this.map = new Map();
        this.order = [];
        this.after = after;
    }

    set(key: K, value: V) {
        if (!this.map.has(key)) {
            const n = this.order.length;
            let i = 0;
            while (this.after(key, this.order[i]) && i < n){
                i++;
            }
            this.order.splice(i, 0, key);
            this.backward_iteration = this.order.length - 1;
        }
        this.map.set(key, value);
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    delete(key: K) {
        const index = this.order.indexOf(key);
        if(index === -1) {
            return;
        }
        this.order.splice(index, 1);
        this.map.delete(key);
    }


    forEachInOrder(f: (value: V, key: K, map: Map<K, V>)=> void) {
        for(const key of this.order) {
            const value = this.map.get(key)!;
            f(value, key, this.map);
        }
    }

    forEachInReversedOrder(f: (value: V, key: K, map: Map<K, V>)=> void) {
        for(const key of this.order.reverse()) {
            const value = this.map.get(key)!;
            f(value, key, this.map);
        }
    }

    range(start: number, end: number): V[] {
        const [i0, i1] = [Math.max(0, start), Math.min(this.order.length, end)];
        let range: V[] = [];

        for (let i = i0; i < i1; i++) {
            const key = this.order[i];
            range.push(this.map.get(key)!);
        }

        return range;
    }

    get asArray(): V[] {
        return this.range(0, this.order.length);
    }

    get size(): number {
        return this.map.size;
    }


    public next(): IteratorResult<V|null> {
        if (this.forward_iteration < this.order.length) {
            const key = this.order[this.forward_iteration++];
            return {
                done: false,
                value: this.map.get(key)!
            };
        } else {
            return {
                done: true,
                value: null
            };
        }
    }

    [Symbol.iterator](): IterableIterator<V | null> {
        return this;
    }

    // public previous(): IteratorResult<V|null> {
    //     if (this.backward_iteration > -1) {
    //         const key = this.order[this.backward_iteration--];
    //         return {
    //             done: false,
    //             value: this.map.get(key)!
    //         };
    //     } else {
    //         return {
    //             done: true,
    //             value: null
    //         };
    //     }
    // }

    get firstKey(): K | undefined {
        if (this.order.length === 0) {
            return undefined;
        }
        return this.order[0];
    }

    get lastKey(): K | undefined {
        if (this.order.length === 0) {
            return undefined;
        }
        return this.order[this.order.length-1];
    }

    get first(): V | undefined {
        if (this.order.length === 0) {
            return undefined;
        }
        return this.map.get(this.order[0]);
    }

    get last(): V | undefined {
        if (this.order.length === 0) {
            return undefined;
        }
        return this.map.get(this.order[this.order.length-1]);
    }

    clear() {
        this.map.clear();
        this.order = [];
    }
}

export { After, OrderedMap };
