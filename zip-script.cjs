const fs = require('fs');
const archiver = require('archiver');

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));
const version = manifest.version;
// Name bereinigen (Leerzeichen zu Bindestrichen)
const cleanName = manifest.name.replace(/\s+/g, '-');

const targetBrowser = process.argv[2] || 'Build';
// Ersten Buchstaben groß schreiben (chrome -> Chrome)
const browserLabel = targetBrowser.charAt(0).toUpperCase() + targetBrowser.slice(1);

const fileName = `${cleanName}-${version}-${browserLabel}.zip`;

const output = fs.createWriteStream(fileName);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ ZIP erstellt: ${fileName} (${archive.pointer()} bytes)`);
});

archive.on('error', (err) => { throw err; });
archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();

