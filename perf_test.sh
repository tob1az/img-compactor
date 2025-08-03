#!/bin/bash
cargo b --release
RUST_LOG=info time cargo r --release -- --from-file big_input.txt --quality 40
