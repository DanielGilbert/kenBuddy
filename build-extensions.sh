#!/bin/bash

# Function to create directories if they don't exist
create_directories() {
    mkdir -p "$1"
}

# Function to package the extension
zip_files() {
    local zipfilename=$1
    local sourcedir=$2
    local manifestfile=$3

    echo "Creating $zipfilename..."

    # Ensure build directory exists
    mkdir -p "$(dirname "$zipfilename")"

    # Remove existing zip if it exists
    [ -f "$zipfilename" ] && rm "$zipfilename"

    # Create temporary directory for staging
    local tempdir=$(mktemp -d)
    
    # Copy all files from source directory to temp staging area
    cp -r "$sourcedir/"* "$tempdir/"

    # Replace manifest.json with the target version
    if [ -f "$tempdir/$manifestfile" ]; then
        cp "$tempdir/$manifestfile" "$tempdir/manifest.json"
    else
        echo "Error: $manifestfile not found in $sourcedir"
        rm -rf "$tempdir"
        exit 1
    fi

    # Remove the different manifest versions from the package
    rm -f "$tempdir/manifest_v2.json"
    rm -f "$tempdir/manifest_v3.json"

    # Create the zip file from the temp directory
    (cd "$tempdir" && zip -r -q "$zipfilename" .)

    # Cleanup temp directory
    rm -rf "$tempdir"
}

# Define root directory (where the script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Ensuring folders exist..."
create_directories "$SCRIPT_DIR/build/chrome"
create_directories "$SCRIPT_DIR/build/firefox"
create_directories "$SCRIPT_DIR/debug/chrome"
create_directories "$SCRIPT_DIR/debug/firefox"

echo "Packaging extensions..."
zip_files "$SCRIPT_DIR/build/chrome/release.zip" "$SCRIPT_DIR/extension" "manifest_v3.json"
zip_files "$SCRIPT_DIR/build/firefox/release.zip" "$SCRIPT_DIR/extension" "manifest_v2.json"

echo "Extracting for Debug..."
unzip -o -q "$SCRIPT_DIR/build/chrome/release.zip" -d "$SCRIPT_DIR/debug/chrome"
unzip -o -q "$SCRIPT_DIR/build/firefox/release.zip" -d "$SCRIPT_DIR/debug/firefox"

echo "Build complete."
