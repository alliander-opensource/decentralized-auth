#!/usr/bin/env bash

cd resources/public/contracts/src

for fileName in *; do
    echo $fileName
    solc --overwrite --optimize --bin --abi $fileName -o ../build/
done

cd ../build

for fileName in *.bin; do
    wc -c $fileName | awk -v name=$fileName '{print name ": " $1 " bytes"}'
done
