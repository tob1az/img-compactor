#!/bin/bash
RUST_LOG=info time cargo r -- --from-file big_input.txt --quality 40
