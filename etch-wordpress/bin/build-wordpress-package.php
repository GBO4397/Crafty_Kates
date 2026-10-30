<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/ZipBuilder.php';

$root = dirname(__DIR__);
$version = '1.0.0';
$pluginSource = $root . '/wordpress/wp-content/plugins/crafty-kates-portal';
$dist = $root . '/dist';
if (!is_dir($pluginSource)) {
    fwrite(STDERR, "Plugin source not found.\n");
    exit(1);
}
if (!is_dir($dist) && !mkdir($dist, 0775, true) && !is_dir($dist)) {
    fwrite(STDERR, "Unable to create dist directory.\n");
    exit(1);
}

/** @return array<string,string> */
function package_files(string $directory): array
{
    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile()) continue;
        $relative = str_replace('\\', '/', substr($file->getPathname(), strlen($directory) + 1));
        $files[$relative] = $file->getPathname();
    }
    ksort($files);
    return $files;
}

function write_archive(string $path, array $entries): void
{
    $zip = new ZipBuilder();
    foreach ($entries as $archiveName => $sourcePath) $zip->addFile($archiveName, $sourcePath);
    $bytes = $zip->finish();
    if (file_put_contents($path, $bytes) !== strlen($bytes)) {
        fwrite(STDERR, "Unable to write {$path}.\n");
        exit(1);
    }
}

$pluginEntries = [];
foreach (package_files($pluginSource) as $relative => $source) {
    $pluginEntries['crafty-kates-portal/' . $relative] = $source;
}
$pluginZip = $dist . '/crafty-kates-portal-' . $version . '.zip';
write_archive($pluginZip, $pluginEntries);

$bundleEntries = ['crafty-kates-portal-' . $version . '.zip' => $pluginZip];
foreach (['etch', 'ws-form'] as $folder) {
    $sourceRoot = $root . '/wordpress/' . $folder;
    foreach (package_files($sourceRoot) as $relative => $source) $bundleEntries[$folder . '/' . $relative] = $source;
}
foreach (['README.md', 'docs/deployment.md'] as $relative) $bundleEntries[$relative] = $root . '/' . $relative;
$bundleZip = $dist . '/crafty-kates-etch-deployment-' . $version . '.zip';
write_archive($bundleZip, $bundleEntries);

foreach ([$pluginZip, $bundleZip] as $path) {
    echo basename($path) . '  ' . filesize($path) . ' bytes  sha256=' . hash_file('sha256', $path) . PHP_EOL;
}

$checksumFile = $dist . '/CHECKSUMS.sha256';
$checksums = '';
foreach ([$pluginZip, $bundleZip] as $path) {
    $checksums .= hash_file('sha256', $path) . '  ' . basename($path) . PHP_EOL;
}
if (file_put_contents($checksumFile, $checksums) !== strlen($checksums)) {
    fwrite(STDERR, "Unable to write {$checksumFile}.\n");
    exit(1);
}
echo basename($checksumFile) . '  written' . PHP_EOL;
