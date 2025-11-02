#!/bin/bash
# Run PTL Verification Report

echo "========================================="
echo "Running PTL Verification..."
echo "========================================="
echo ""

npx ts-node examples/ptl-verification.ts

echo ""
echo "Report complete!"
echo ""
