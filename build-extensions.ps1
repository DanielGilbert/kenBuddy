Add-Type -assembly  System.IO.Compression.FileSystem

function CreateDirectories($directory)
{
    [System.IO.Directory]::CreateDirectory($directory)
}

function ZipFiles( $zipfilename, $sourcedir, $manifestFile )
{
    if (Test-Path $zipfilename) {
        Remove-Item $zipfilename
    }
    $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir, $zipfilename, $compressionLevel, $false)
    $zip =  [System.IO.Compression.ZipFile]::Open($zipfileName,"Update")
    $zipArchiveEntry = $zip.GetEntry("manifest.json")
    if ($null -ne $zipArchiveEntry)
    {
        $zipArchiveEntry.Delete()
    }
    $manifestEntry = $zip.GetEntry($manifestFile)
    $tempfile = Join-Path $env:TEMP $manifestFile
    If ($manifestEntry) { [IO.Compression.ZipFileExtensions]::ExtractToFile( $manifestEntry, $tempfile, $true ) }
    Else {throw "Child item not found";break}
    
    # Add renamed file
    Try {[IO.Compression.ZipFileExtensions]::CreateEntryFromFile( $zip, $tempfile, "manifest.json") }
    Catch {"Error creating entry";$Error[0];break}
    
    # Cleanup
    $manifestEntry.Delete()
    $zip.Dispose()
    Remove-Item $tempfile
    $zip.Dispose()
}

Write-Host Ensuring folders exists...
CreateDirectories -directory $PSScriptRoot\build\chrome\
CreateDirectories -directory $PSScriptRoot\build\firefox\
CreateDirectories -directory $PSScriptRoot\debug\chrome\
CreateDirectories -directory $PSScriptRoot\debug\firefox\

Write-Host Packaging extensions...
ZipFiles -zipfilename $PSScriptRoot\build\chrome\release.zip -sourcedir $PSScriptRoot\extension -manifestFile "manifest_v3.json"
ZipFiles -zipfilename $PSScriptRoot\build\firefox\release.zip -sourcedir $PSScriptRoot\extension -manifestFile "manifest_v2.json"

Write-Host Extracting for Debug...
Expand-Archive -Force -Path $PSScriptRoot\build\chrome\release.zip -DestinationPath $PSScriptRoot\debug\chrome\
Expand-Archive -Force -Path $PSScriptRoot\build\firefox\release.zip -DestinationPath $PSScriptRoot\debug\firefox\