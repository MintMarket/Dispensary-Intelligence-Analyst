#!/bin/bash
# Run Executive Intelligence Summary Report

echo "========================================="
echo "Generating Intelligence Report..."
echo "========================================="
echo ""

npx ts-node examples/basic-usage.ts

echo ""
echo "========================================="
echo "Report Complete!"
echo "========================================="
echo ""
echo "The report is displayed above."
echo "You can copy/paste it or redirect to a file:"
echo "  ./run-report.sh > report.txt"
echo ""
