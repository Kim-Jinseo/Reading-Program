param(
  [ValidateSet('Inspect', 'Export', 'StudentPreview')][string]$Mode = 'Inspect',
  [Parameter(Mandatory = $true)][string]$Source,
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '../artifacts/class-lessons/source-renders')
)

$ErrorActionPreference = 'Stop'
$sourceFile = Get-Item -LiteralPath $Source
$sourceHash = (Get-FileHash -LiteralPath $sourceFile.FullName -Algorithm SHA256).Hash
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($sourceFile.FullName)
try {
  $slides = @($archive.Entries | Where-Object { $_.FullName -match '^ppt/slides/slide[0-9]+\.xml$' } | Sort-Object { [int]([regex]::Match($_.FullName, 'slide([0-9]+)\.xml').Groups[1].Value) } | ForEach-Object {
    $reader = [IO.StreamReader]::new($_.Open())
    try { [xml]$slideXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $namespaces = [Xml.XmlNamespaceManager]::new($slideXml.NameTable)
    $namespaces.AddNamespace('a', 'http://schemas.openxmlformats.org/drawingml/2006/main')
    [pscustomobject]@{
      number = [int]([regex]::Match($_.FullName, 'slide([0-9]+)\.xml').Groups[1].Value)
      hidden = $slideXml.DocumentElement.GetAttribute('show') -eq '0'
      text = @($slideXml.SelectNodes('//a:t', $namespaces) | ForEach-Object { $_.InnerText }) -join ' | '
    }
  })
  $presentationEntry = $archive.GetEntry('ppt/presentation.xml')
  $reader = [IO.StreamReader]::new($presentationEntry.Open())
  try { [xml]$presentationXml = $reader.ReadToEnd() } finally { $reader.Dispose() }
  $dimensions = $presentationXml.DocumentElement.ChildNodes | Where-Object { $_.LocalName -eq 'sldSz' }
  [pscustomobject]@{ source = $sourceFile.Name; bytes = $sourceFile.Length; sha256 = $sourceHash; width = $dimensions.cx; height = $dimensions.cy; slides = $slides } | ConvertTo-Json -Depth 4
} finally { $archive.Dispose() }

if ($Mode -in @('Export', 'StudentPreview')) {
  if ($Mode -eq 'StudentPreview' -and $sourceHash -ne 'E99539C52E653B98FED365D029155DD250563C04DCA2BA95A4A3A7DBF2267AF4') {
    throw 'The sample selection is specific to the reviewed classroom deck. Review a changed source before reusing these page numbers.'
  }
  $outputPath = [IO.Path]::GetFullPath($OutputDirectory)
  if ($Mode -eq 'StudentPreview') { $outputPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../artifacts/class-lessons/student-renders')) }
  New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
  $powerPointWasRunning = @(Get-Process -Name POWERPNT -ErrorAction SilentlyContinue).Count -gt 0
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $previousAutomationSecurity = $powerPoint.AutomationSecurity
  $previousDisplayAlerts = $powerPoint.DisplayAlerts
  $presentation = $null
  try {
    # Disable macros and open without a visible window. Never save the supplied deck.
    $powerPoint.AutomationSecurity = 3
    $powerPoint.DisplayAlerts = 1
    $presentation = $powerPoint.Presentations.Open($sourceFile.FullName, -1, 0, 0)
    $width = 1600
    $height = [int][Math]::Round($width * $presentation.PageSetup.SlideHeight / $presentation.PageSetup.SlideWidth)
    $selectedSlides = @(8, 6, 12, 14, 17, 18, 20, 24)
    foreach ($slide in $presentation.Slides) {
      if ($Mode -eq 'StudentPreview' -and $slide.SlideIndex -notin $selectedSlides) {
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($slide)
        continue
      }
      if ($Mode -eq 'StudentPreview') {
        # Only omit exact teacher-note/stage labels in the temporary render view.
        # Images, lesson text, speech bubbles, and the source logo remain unchanged.
        for ($shapeIndex = $slide.Shapes.Count; $shapeIndex -ge 1; $shapeIndex--) {
          $shape = $slide.Shapes.Item($shapeIndex)
          try {
            if ($shape.HasTextFrame -and $shape.TextFrame.HasText) {
              $shapeText = $shape.TextFrame.TextRange.Text.Trim()
              if ($shapeText -match '^Note to teacher:' -or $shapeText -match '^(Title|Context setting \(1 min\)|Structure clarification\s*\(5 mins\)|Structure practice \(6 mins\)|Wrap-up \(5 mins\))$') {
                Write-Output ('Omitted teacher-only text from slide {0}: {1}' -f $slide.SlideIndex, $shapeText)
                $shape.Delete()
              }
            }
          } finally { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shape) }
        }
      }
      $target = Join-Path $outputPath ('slide-{0:d2}.png' -f $slide.SlideIndex)
      $slide.Export($target, 'PNG', $width, $height)
      Write-Output ('Exported {0}' -f $target)
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($slide)
    }
  } finally {
    if ($null -ne $presentation) {
      # Suppress a save prompt for the temporary in-memory render view.
      $presentation.Saved = -1
      $presentation.Close()
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
    }
    $powerPoint.AutomationSecurity = $previousAutomationSecurity
    $powerPoint.DisplayAlerts = $previousDisplayAlerts
    if (-not $powerPointWasRunning -and $powerPoint.Presentations.Count -eq 0) { $powerPoint.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
  }
  $afterHash = (Get-FileHash -LiteralPath $sourceFile.FullName -Algorithm SHA256).Hash
  if ($afterHash -ne $sourceHash) { throw 'Source PowerPoint changed unexpectedly.' }
  Write-Output ('Original SHA256 unchanged: {0}' -f $afterHash)
}
