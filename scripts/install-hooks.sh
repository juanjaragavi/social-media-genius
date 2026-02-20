#!/bin/bash

# Script to install git hooks

echo "Installing git hooks..."

# Create the hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy the pre-push hook
cp scripts/hooks/pre-push .git/hooks/pre-push

# Make it executable
chmod +x .git/hooks/pre-push

echo "✅ Git hooks installed successfully."
