const fs = require('fs');
const archiver = require('archiver');

// Liest Name und Version aus der manifest.json
const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
const version = manifest.version;
const name = manifest.name.replace(/\s+/g, '-'); // Ersetzt Leerzeichen durch Bindestriche

// Holt den Browser-Namen aus dem Befehl (chrome oder firefox)
const browser = process.argv[2] || 'build';
const fileName = `${name}-v${version}-${browser}.zip`;

const output = fs.createWriteStream(fileName);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`--- ZIP fertig erstellt: ${fileName} ---`);
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);

// Packt den Inhalt des dist-Ordners in die ZIP
archive.directory('dist/', false);
archive.finalize();

