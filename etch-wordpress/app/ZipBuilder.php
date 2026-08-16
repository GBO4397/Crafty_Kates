<?php

declare(strict_types=1);

final class ZipBuilder
{
    private string $body = '';
    private array $entries = [];

    public function add(string $name, string $contents, ?int $timestamp = null): void
    {
        $name = $this->safeName($name);
        if ($name === '' || isset($this->entries[$name])) {
            return;
        }
        [$dosTime, $dosDate] = $this->dosDateTime($timestamp ?? time());
        $crc = crc32($contents);
        $size = strlen($contents);
        $offset = strlen($this->body);
        $nameLength = strlen($name);
        $flags = 0x0800;
        $this->body .= pack('VvvvvvVVVvv', 0x04034b50, 20, $flags, 0, $dosTime, $dosDate, $crc, $size, $size, $nameLength, 0);
        $this->body .= $name . $contents;
        $this->entries[$name] = compact('crc', 'size', 'offset', 'nameLength', 'dosTime', 'dosDate', 'flags');
    }

    public function addFile(string $name, string $path): void
    {
        if (!is_file($path)) {
            return;
        }
        $contents = file_get_contents($path);
        if ($contents === false) {
            throw new RuntimeException("Unable to read archive source: {$path}");
        }
        $this->add($name, $contents, filemtime($path) ?: time());
    }

    public function finish(): string
    {
        $central = '';
        foreach ($this->entries as $name => $entry) {
            $central .= pack(
                'VvvvvvvVVVvvvvvVV',
                0x02014b50, 20, 20, $entry['flags'], 0, $entry['dosTime'], $entry['dosDate'],
                $entry['crc'], $entry['size'], $entry['size'], $entry['nameLength'], 0, 0, 0, 0, 0, $entry['offset']
            );
            $central .= $name;
        }
        $count = count($this->entries);
        $end = pack('VvvvvVVv', 0x06054b50, 0, 0, $count, $count, strlen($central), strlen($this->body), 0);
        return $this->body . $central . $end;
    }

    private function safeName(string $name): string
    {
        $name = str_replace('\\', '/', $name);
        $segments = array_values(array_filter(explode('/', $name), static fn (string $segment): bool => $segment !== '' && $segment !== '.' && $segment !== '..'));
        return implode('/', $segments);
    }

    private function dosDateTime(int $timestamp): array
    {
        $parts = getdate(max($timestamp, mktime(0, 0, 0, 1, 1, 1980)));
        $time = ($parts['hours'] << 11) | ($parts['minutes'] << 5) | intdiv($parts['seconds'], 2);
        $date = (($parts['year'] - 1980) << 9) | ($parts['mon'] << 5) | $parts['mday'];
        return [$time, $date];
    }
}
